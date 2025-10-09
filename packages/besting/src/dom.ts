/**
 * Virtual DOM Implementation
 *
 * A lightweight DOM implementation built purely with Bun's runtime.
 * No external dependencies - competing with happy-dom but Bun-native.
 */

export type NodeType = 'element' | 'text' | 'comment' | 'document'

export interface VirtualNode {
  nodeType: NodeType
  nodeName: string
  nodeValue: string | null
  attributes: Map<string, string>
  children: VirtualNode[]
  parentNode: VirtualNode | null
  textContent: string
}

/**
 * Event System
 */
export class VirtualEvent {
  type: string
  target: VirtualElement | null = null
  currentTarget: VirtualElement | null = null
  bubbles: boolean
  cancelable: boolean
  defaultPrevented = false
  propagationStopped = false
  immediatePropagationStopped = false
  timeStamp: number

  constructor(type: string, options?: { bubbles?: boolean, cancelable?: boolean }) {
    this.type = type
    this.bubbles = options?.bubbles ?? true
    this.cancelable = options?.cancelable ?? true
    this.timeStamp = Date.now()
  }

  preventDefault(): void {
    if (this.cancelable) {
      this.defaultPrevented = true
    }
  }

  stopPropagation(): void {
    this.propagationStopped = true
  }

  stopImmediatePropagation(): void {
    this.propagationStopped = true
    this.immediatePropagationStopped = true
  }
}

export type EventListener = (event: VirtualEvent) => void

interface EventListenerEntry {
  listener: EventListener
  useCapture: boolean
}

/**
 * Virtual DOM Element
 */
export class VirtualElement implements VirtualNode {
  nodeType: NodeType = 'element'
  nodeName: string
  nodeValue: string | null = null
  attributes: Map<string, string> = new Map()
  children: VirtualNode[] = []
  parentNode: VirtualNode | null = null
  private _classList: Set<string> = new Set()
  private _eventListeners: Map<string, EventListenerEntry[]> = new Map()
  private _customValidity: string = ''

  constructor(tagName: string) {
    this.nodeName = tagName.toUpperCase()
  }

  get textContent(): string {
    return this.children
      .map(child => child.textContent)
      .join('')
  }

  set textContent(value: string) {
    this.children = [new VirtualTextNode(value)]
  }

  get innerHTML(): string {
    return this.children
      .map(child => this.serializeNode(child))
      .join('')
  }

  set innerHTML(html: string) {
    this.children = parseHTML(html)
    this.children.forEach(child => child.parentNode = this)
  }

  get outerHTML(): string {
    return this.serializeNode(this)
  }

  get classList(): {
    add: (className: string) => void
    remove: (className: string) => void
    contains: (className: string) => boolean
    toggle: (className: string) => void
  } {
    return {
      add: (className: string) => {
        this._classList.add(className)
        this.updateClassAttribute()
      },
      remove: (className: string) => {
        this._classList.delete(className)
        this.updateClassAttribute()
      },
      contains: (className: string) => {
        return this._classList.has(className)
      },
      toggle: (className: string) => {
        if (this._classList.has(className)) {
          this._classList.delete(className)
        }
        else {
          this._classList.add(className)
        }
        this.updateClassAttribute()
      },
    }
  }

  private updateClassAttribute(): void {
    if (this._classList.size > 0) {
      this.attributes.set('class', Array.from(this._classList).join(' '))
    }
    else {
      this.attributes.delete('class')
    }
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name.toLowerCase()) || null
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name.toLowerCase(), value)

    if (name.toLowerCase() === 'class') {
      this._classList = new Set(value.split(/\s+/).filter(Boolean))
    }
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name.toLowerCase())

    if (name.toLowerCase() === 'class') {
      this._classList.clear()
    }
  }

  hasAttribute(name: string): boolean {
    return this.attributes.has(name.toLowerCase())
  }

  appendChild(child: VirtualNode): VirtualNode {
    child.parentNode = this
    this.children.push(child)
    return child
  }

  removeChild(child: VirtualNode): VirtualNode {
    const index = this.children.indexOf(child)
    if (index !== -1) {
      this.children.splice(index, 1)
      child.parentNode = null
    }
    return child
  }

  insertBefore(newNode: VirtualNode, referenceNode: VirtualNode | null): VirtualNode {
    if (!referenceNode) {
      return this.appendChild(newNode)
    }

    const index = this.children.indexOf(referenceNode)
    if (index === -1) {
      throw new Error('Reference node not found')
    }

    newNode.parentNode = this
    this.children.splice(index, 0, newNode)
    return newNode
  }

  replaceChild(newNode: VirtualNode, oldNode: VirtualNode): VirtualNode {
    const index = this.children.indexOf(oldNode)
    if (index === -1) {
      throw new Error('Old node not found')
    }

    newNode.parentNode = this
    this.children[index] = newNode
    oldNode.parentNode = null
    return oldNode
  }

  cloneNode(deep: boolean = false): VirtualElement {
    const clone = new VirtualElement(this.nodeName)

    // Clone attributes
    this.attributes.forEach((value, key) => {
      clone.setAttribute(key, value)
    })

    // Deep clone children
    if (deep) {
      this.children.forEach((child) => {
        if (child.nodeType === 'element') {
          clone.appendChild((child as VirtualElement).cloneNode(true))
        }
        else if (child.nodeType === 'text') {
          clone.appendChild(new VirtualTextNode(child.nodeValue || ''))
        }
        else if (child.nodeType === 'comment') {
          clone.appendChild(new VirtualCommentNode(child.nodeValue || ''))
        }
      })
    }

    return clone
  }

  closest(selector: string): VirtualElement | null {
    let current: VirtualElement | null = this

    while (current) {
      if (current.nodeType === 'element' && matchesSelector(current, selector)) {
        return current
      }
      current = current.parentNode as VirtualElement | null
    }

    return null
  }

  get nextElementSibling(): VirtualElement | null {
    if (!this.parentNode)
      return null

    const siblings = this.parentNode.children.filter(child => child.nodeType === 'element') as VirtualElement[]
    const index = siblings.indexOf(this)

    return index !== -1 && index < siblings.length - 1 ? siblings[index + 1] : null
  }

  get previousElementSibling(): VirtualElement | null {
    if (!this.parentNode)
      return null

    const siblings = this.parentNode.children.filter(child => child.nodeType === 'element') as VirtualElement[]
    const index = siblings.indexOf(this)

    return index > 0 ? siblings[index - 1] : null
  }

  // Style property
  get style(): {
    [key: string]: string
    getPropertyValue: (property: string) => string
    setProperty: (property: string, value: string) => void
    removeProperty: (property: string) => void
  } {
    const styleAttr = this.getAttribute('style') || ''
    const styles: { [key: string]: string } = {}

    // Parse inline styles
    styleAttr.split(';').forEach((rule) => {
      const [property, value] = rule.split(':').map(s => s.trim())
      if (property && value) {
        styles[property] = value
      }
    })

    return new Proxy(styles, {
      get: (target, prop: string) => {
        if (prop === 'getPropertyValue') {
          return (property: string) => target[property] || ''
        }
        if (prop === 'setProperty') {
          return (property: string, value: string) => {
            target[property] = value
            this._updateStyleAttribute(target)
          }
        }
        if (prop === 'removeProperty') {
          return (property: string) => {
            delete target[property]
            this._updateStyleAttribute(target)
          }
        }
        return target[prop]
      },
      set: (target, prop: string, value: string) => {
        target[prop] = value
        this._updateStyleAttribute(target)
        return true
      },
    }) as any
  }

  private _updateStyleAttribute(styles: { [key: string]: string }): void {
    const styleStr = Object.entries(styles)
      .filter(([key]) => key !== 'getPropertyValue' && key !== 'setProperty' && key !== 'removeProperty')
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ')

    if (styleStr) {
      this.setAttribute('style', styleStr)
    }
    else {
      this.removeAttribute('style')
    }
  }

  // Form Validation
  get validity(): {
    valid: boolean
    valueMissing: boolean
    typeMismatch: boolean
    patternMismatch: boolean
    tooLong: boolean
    tooShort: boolean
    rangeUnderflow: boolean
    rangeOverflow: boolean
    stepMismatch: boolean
    badInput: boolean
    customError: boolean
  } {
    const value = this.getAttribute('value') || ''
    const type = this.getAttribute('type') || 'text'

    const validity = {
      valid: true,
      valueMissing: false,
      typeMismatch: false,
      patternMismatch: false,
      tooLong: false,
      tooShort: false,
      rangeUnderflow: false,
      rangeOverflow: false,
      stepMismatch: false,
      badInput: false,
      customError: false,
    }

    // Custom validity
    if (this._customValidity) {
      validity.customError = true
      validity.valid = false
    }

    // Required validation
    if (this.hasAttribute('required') && !value) {
      validity.valueMissing = true
      validity.valid = false
    }

    // Pattern validation
    const pattern = this.getAttribute('pattern')
    if (pattern && value) {
      const regex = new RegExp(`^${pattern}$`)
      if (!regex.test(value)) {
        validity.patternMismatch = true
        validity.valid = false
      }
    }

    // Minlength validation
    const minlength = this.getAttribute('minlength')
    if (minlength && value.length < Number.parseInt(minlength, 10)) {
      validity.tooShort = true
      validity.valid = false
    }

    // Maxlength validation
    const maxlength = this.getAttribute('maxlength')
    if (maxlength && value.length > Number.parseInt(maxlength, 10)) {
      validity.tooLong = true
      validity.valid = false
    }

    // Min validation (for numbers)
    const min = this.getAttribute('min')
    if (min && (type === 'number' || type === 'range')) {
      const numValue = Number.parseFloat(value)
      if (!Number.isNaN(numValue) && numValue < Number.parseFloat(min)) {
        validity.rangeUnderflow = true
        validity.valid = false
      }
    }

    // Max validation (for numbers)
    const max = this.getAttribute('max')
    if (max && (type === 'number' || type === 'range')) {
      const numValue = Number.parseFloat(value)
      if (!Number.isNaN(numValue) && numValue > Number.parseFloat(max)) {
        validity.rangeOverflow = true
        validity.valid = false
      }
    }

    // Type validation for email
    if (type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        validity.typeMismatch = true
        validity.valid = false
      }
    }

    // Type validation for url
    if (type === 'url' && value) {
      try {
        new URL(value)
      }
      catch {
        validity.typeMismatch = true
        validity.valid = false
      }
    }

    return validity
  }

  get validationMessage(): string {
    if (this._customValidity) {
      return this._customValidity
    }

    const validity = this.validity

    if (validity.valueMissing) {
      return 'Please fill out this field.'
    }
    if (validity.patternMismatch) {
      return 'Please match the requested format.'
    }
    if (validity.tooShort) {
      const minlength = this.getAttribute('minlength')
      return `Please lengthen this text to ${minlength} characters or more.`
    }
    if (validity.tooLong) {
      const maxlength = this.getAttribute('maxlength')
      return `Please shorten this text to ${maxlength} characters or less.`
    }
    if (validity.rangeUnderflow) {
      const min = this.getAttribute('min')
      return `Value must be greater than or equal to ${min}.`
    }
    if (validity.rangeOverflow) {
      const max = this.getAttribute('max')
      return `Value must be less than or equal to ${max}.`
    }
    if (validity.typeMismatch) {
      const type = this.getAttribute('type')
      if (type === 'email') {
        return 'Please enter a valid email address.'
      }
      if (type === 'url') {
        return 'Please enter a valid URL.'
      }
    }

    return ''
  }

  setCustomValidity(message: string): void {
    this._customValidity = message
  }

  checkValidity(): boolean {
    return this.validity.valid
  }

  reportValidity(): boolean {
    const isValid = this.checkValidity()

    if (!isValid) {
      // Dispatch invalid event
      const invalidEvent = new VirtualEvent('invalid', { bubbles: false, cancelable: true })
      this.dispatchEvent(invalidEvent)
    }

    return isValid
  }

  querySelector(selector: string): VirtualElement | null {
    return querySelectorEngine(this, selector)
  }

  querySelectorAll(selector: string): VirtualElement[] {
    return querySelectorAllEngine(this, selector)
  }

  matches(selector: string): boolean {
    return matchesSelector(this, selector)
  }

  // Event System Methods
  addEventListener(type: string, listener: EventListener, useCapture: boolean = false): void {
    if (!this._eventListeners.has(type)) {
      this._eventListeners.set(type, [])
    }

    const listeners = this._eventListeners.get(type)!
    // Don't add duplicate listeners
    if (!listeners.some(entry => entry.listener === listener && entry.useCapture === useCapture)) {
      listeners.push({ listener, useCapture })
    }
  }

  removeEventListener(type: string, listener: EventListener, useCapture: boolean = false): void {
    const listeners = this._eventListeners.get(type)
    if (!listeners) {
      return
    }

    const index = listeners.findIndex(entry => entry.listener === listener && entry.useCapture === useCapture)
    if (index !== -1) {
      listeners.splice(index, 1)
    }

    if (listeners.length === 0) {
      this._eventListeners.delete(type)
    }
  }

  dispatchEvent(event: VirtualEvent): boolean {
    event.target = this

    // Build the event path (from document to target)
    const path: VirtualElement[] = []
    let current: VirtualElement | null = this
    while (current) {
      path.unshift(current)
      current = current.parentNode as VirtualElement | null
    }

    // Capturing phase
    for (let i = 0; i < path.length - 1; i++) {
      if (event.propagationStopped) {
        break
      }

      const element = path[i]
      event.currentTarget = element
      this._invokeEventListeners(element, event, true) // useCapture = true
    }

    // Target phase
    if (!event.propagationStopped) {
      event.currentTarget = this
      this._invokeEventListeners(this, event, true) // Capture listeners
      if (!event.immediatePropagationStopped) {
        this._invokeEventListeners(this, event, false) // Bubble listeners
      }
    }

    // Bubbling phase
    if (event.bubbles && !event.propagationStopped) {
      for (let i = path.length - 2; i >= 0; i--) {
        if (event.propagationStopped) {
          break
        }

        const element = path[i]
        event.currentTarget = element
        this._invokeEventListeners(element, event, false) // useCapture = false
      }
    }

    return !event.defaultPrevented
  }

  private _invokeEventListeners(element: VirtualElement, event: VirtualEvent, useCapture: boolean): void {
    const listeners = element._eventListeners.get(event.type)
    if (!listeners) {
      return
    }

    // Make a copy to prevent issues if listeners are removed during invocation
    const listenersToInvoke = listeners.filter(entry => entry.useCapture === useCapture)

    for (const entry of listenersToInvoke) {
      if (event.immediatePropagationStopped) {
        break
      }

      try {
        entry.listener(event)
      }
      catch (error) {
        console.error('Error in event listener:', error)
      }
    }
  }

  private serializeNode(node: VirtualNode): string {
    if (node.nodeType === 'text') {
      return node.nodeValue || ''
    }

    if (node.nodeType === 'comment') {
      return `<!--${node.nodeValue}-->`
    }

    if (node.nodeType === 'element') {
      const element = node as VirtualElement
      const attrs = Array.from(element.attributes.entries())
        .map(([name, value]) => ` ${name}="${value}"`)
        .join('')

      const children = element.children
        .map(child => this.serializeNode(child))
        .join('')

      // Self-closing tags
      if (
        ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'].includes(
          element.nodeName.toLowerCase(),
        )
      ) {
        return `<${element.nodeName.toLowerCase()}${attrs} />`
      }

      return `<${element.nodeName.toLowerCase()}${attrs}>${children}</${element.nodeName.toLowerCase()}>`
    }

    return ''
  }
}

/**
 * Virtual Text Node
 */
export class VirtualTextNode implements VirtualNode {
  nodeType: NodeType = 'text'
  nodeName: string = '#text'
  nodeValue: string
  attributes: Map<string, string> = new Map()
  children: VirtualNode[] = []
  parentNode: VirtualNode | null = null

  constructor(text: string) {
    this.nodeValue = text
  }

  get textContent(): string {
    return this.nodeValue
  }

  set textContent(value: string) {
    this.nodeValue = value
  }
}

/**
 * Virtual Comment Node
 */
export class VirtualCommentNode implements VirtualNode {
  nodeType: NodeType = 'comment'
  nodeName: string = '#comment'
  nodeValue: string
  attributes: Map<string, string> = new Map()
  children: VirtualNode[] = []
  parentNode: VirtualNode | null = null

  constructor(comment: string) {
    this.nodeValue = comment
  }

  get textContent(): string {
    return ''
  }

  set textContent(_value: string) {
    // Comments don't have text content
  }
}

/**
 * Virtual Document
 */
export class VirtualDocument extends VirtualElement {
  nodeType: NodeType = 'document'
  private _title: string = ''
  public location: {
    href: string
    protocol: string
    host: string
    hostname: string
    port: string
    pathname: string
    search: string
    hash: string
  } = {
      href: '',
      protocol: '',
      host: '',
      hostname: '',
      port: '',
      pathname: '',
      search: '',
      hash: '',
    }

  public history: any

  private _historyStack: Array<{ state: any, title: string, url: string }> = []
  private _historyIndex: number = -1

  constructor() {
    super('document')
    this.nodeName = '#document'

    // Initialize history API
    const self = this
    this.history = {
      get state() {
        return self._historyStack[self._historyIndex]?.state || null
      },
      get length() {
        return self._historyStack.length
      },
      pushState: (state: any, title: string, url?: string) => {
        // Remove forward history
        self._historyStack = self._historyStack.slice(0, self._historyIndex + 1)

        // Add new state
        self._historyStack.push({
          state,
          title,
          url: url || self.location.href,
        })
        self._historyIndex++

        // Update location if URL provided
        if (url) {
          try {
            const urlObj = new URL(url, self.location.href)
            self.location.href = urlObj.href
            self.location.pathname = urlObj.pathname
            self.location.search = urlObj.search
            self.location.hash = urlObj.hash
          }
          catch {
            // Invalid URL, ignore
          }
        }
      },
      replaceState: (state: any, title: string, url?: string) => {
        if (self._historyIndex >= 0) {
          self._historyStack[self._historyIndex] = {
            state,
            title,
            url: url || self.location.href,
          }

          // Update location if URL provided
          if (url) {
            try {
              const urlObj = new URL(url, self.location.href)
              self.location.href = urlObj.href
              self.location.pathname = urlObj.pathname
              self.location.search = urlObj.search
              self.location.hash = urlObj.hash
            }
            catch {
              // Invalid URL, ignore
            }
          }
        }
      },
      back: () => {
        if (self._historyIndex > 0) {
          self._historyIndex--
          const entry = self._historyStack[self._historyIndex]
          if (entry.url) {
            try {
              const urlObj = new URL(entry.url)
              self.location.href = urlObj.href
              self.location.pathname = urlObj.pathname
              self.location.search = urlObj.search
              self.location.hash = urlObj.hash
            }
            catch {
              // Invalid URL, ignore
            }
          }
        }
      },
      forward: () => {
        if (self._historyIndex < self._historyStack.length - 1) {
          self._historyIndex++
          const entry = self._historyStack[self._historyIndex]
          if (entry.url) {
            try {
              const urlObj = new URL(entry.url)
              self.location.href = urlObj.href
              self.location.pathname = urlObj.pathname
              self.location.search = urlObj.search
              self.location.hash = urlObj.hash
            }
            catch {
              // Invalid URL, ignore
            }
          }
        }
      },
      go: (delta: number) => {
        const newIndex = self._historyIndex + delta
        if (newIndex >= 0 && newIndex < self._historyStack.length) {
          self._historyIndex = newIndex
          const entry = self._historyStack[self._historyIndex]
          if (entry.url) {
            try {
              const urlObj = new URL(entry.url)
              self.location.href = urlObj.href
              self.location.pathname = urlObj.pathname
              self.location.search = urlObj.search
              self.location.hash = urlObj.hash
            }
            catch {
              // Invalid URL, ignore
            }
          }
        }
      },
    }
  }

  get title(): string {
    return this._title
  }

  set title(value: string) {
    this._title = value
  }

  get documentElement(): VirtualElement | null {
    return this.children.find(child => child.nodeName === 'HTML') as VirtualElement || null
  }

  get body(): VirtualElement | null {
    const html = this.documentElement
    if (!html)
      return null
    return html.children.find(child => child.nodeName === 'BODY') as VirtualElement || null
  }

  get head(): VirtualElement | null {
    const html = this.documentElement
    if (!html)
      return null
    return html.children.find(child => child.nodeName === 'HEAD') as VirtualElement || null
  }

  createElement(tagName: string): VirtualElement {
    return new VirtualElement(tagName)
  }

  createTextNode(text: string): VirtualTextNode {
    return new VirtualTextNode(text)
  }

  createComment(comment: string): VirtualCommentNode {
    return new VirtualCommentNode(comment)
  }

  getComputedStyle(element: VirtualElement): {
    display: string
    visibility: string
    [key: string]: any
    getPropertyValue: (property: string) => string
  } {
    // Simple implementation - returns inline styles
    // In a real browser, this would compute styles from all stylesheets
    const elementStyle = element.style as any
    const styles: any = { ...elementStyle }

    // Add default computed values
    if (!styles.display) {
      const hiddenTags = ['script', 'style', 'head', 'title', 'meta', 'link']
      styles.display = hiddenTags.includes(element.nodeName.toLowerCase()) ? 'none' : 'block'
    }

    if (!styles.visibility) {
      styles.visibility = 'visible'
    }

    styles.getPropertyValue = (property: string) => styles[property] || ''

    return styles
  }
}

/**
 * Simple HTML Parser
 */
export function parseHTML(html: string): VirtualNode[] {
  const nodes: VirtualNode[] = []
  const stack: VirtualElement[] = []

  // Simple regex-based parser (good enough for testing)
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b([^>]*)>/gi
  const selfClosingTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = tagRegex.exec(html)) !== null) {
    // Add text before tag
    if (match.index > lastIndex) {
      const text = html.slice(lastIndex, match.index)
      if (text.trim()) {
        const textNode = new VirtualTextNode(text)
        if (stack.length > 0) {
          stack[stack.length - 1].appendChild(textNode)
        }
        else {
          nodes.push(textNode)
        }
      }
    }

    const fullMatch = match[0]
    const tagName = match[1]
    const attributesStr = match[2]

    if (fullMatch.startsWith('</')) {
      // Closing tag
      if (stack.length > 0) {
        const element = stack.pop()!
        if (stack.length > 0) {
          stack[stack.length - 1].appendChild(element)
        }
        else {
          nodes.push(element)
        }
      }
    }
    else {
      // Opening tag
      const element = new VirtualElement(tagName)

      // Parse attributes
      const attrRegex = /([a-z][a-z0-9-]*)(?:="([^"]*)")?/gi
      let attrMatch: RegExpExecArray | null
      while ((attrMatch = attrRegex.exec(attributesStr)) !== null) {
        const attrName = attrMatch[1]
        const attrValue = attrMatch[2] || ''
        element.setAttribute(attrName, attrValue)
      }

      if (selfClosingTags.has(tagName.toLowerCase()) || fullMatch.endsWith('/>')) {
        // Self-closing tag
        if (stack.length > 0) {
          stack[stack.length - 1].appendChild(element)
        }
        else {
          nodes.push(element)
        }
      }
      else {
        // Push to stack for children
        stack.push(element)
      }
    }

    lastIndex = tagRegex.lastIndex
  }

  // Add remaining text
  if (lastIndex < html.length) {
    const text = html.slice(lastIndex)
    if (text.trim()) {
      const textNode = new VirtualTextNode(text)
      if (stack.length > 0) {
        stack[stack.length - 1].appendChild(textNode)
      }
      else {
        nodes.push(textNode)
      }
    }
  }

  // Pop remaining elements
  while (stack.length > 0) {
    const element = stack.pop()!
    if (stack.length > 0) {
      stack[stack.length - 1].appendChild(element)
    }
    else {
      nodes.push(element)
    }
  }

  return nodes
}

/**
 * CSS Selector Engine (Enhanced implementation with combinators)
 */
function querySelectorEngine(root: VirtualElement, selector: string): VirtualElement | null {
  const results = querySelectorAllEngine(root, selector)
  return results[0] || null
}

function querySelectorAllEngine(root: VirtualElement, selector: string): VirtualElement[] {
  const results: VirtualElement[] = []
  selector = selector.trim()

  // Check if selector contains combinators
  if (hasCombinators(selector)) {
    // Handle complex selectors with combinators
    function traverse(node: VirtualNode): void {
      if (node.nodeType === 'element' || node.nodeType === 'document') {
        const element = node as VirtualElement
        if (node.nodeType === 'element' && matchesComplexSelector(element, selector)) {
          results.push(element)
        }
        element.children.forEach(traverse)
      }
    }
    traverse(root)
  }
  else {
    // Handle simple selectors (faster path)
    function traverse(node: VirtualNode): void {
      if (node.nodeType === 'element' || node.nodeType === 'document') {
        const element = node as VirtualElement
        if (node.nodeType === 'element' && matchesSimpleSelector(element, selector)) {
          results.push(element)
        }
        element.children.forEach(traverse)
      }
    }
    traverse(root)
  }

  return results
}

function hasCombinators(selector: string): boolean {
  // Check for combinators: space (descendant), > (child), + (adjacent), ~ (sibling)
  // But exclude characters inside attribute selectors [...]

  // Remove attribute selectors first
  const withoutAttrs = selector.replace(/\[[^\]]*\]/g, '')

  // Now check for combinators
  return /[\s>+~]/.test(withoutAttrs)
}

function matchesComplexSelector(element: VirtualElement, selector: string): boolean {
  const parts = parseComplexSelector(selector)
  if (parts.length === 0)
    return false

  // Start from the rightmost selector (the element we're testing)
  const lastPart = parts[parts.length - 1]
  if (!matchesSimpleSelector(element, lastPart.selector)) {
    return false
  }

  // Work backwards through the selector parts
  let current: VirtualElement | null = element
  for (let i = parts.length - 2; i >= 0; i--) {
    const part = parts[i]
    const combinator = parts[i + 1].combinator

    switch (combinator) {
      case ' ': // Descendant
        current = findAncestor(current, part.selector)
        break
      case '>': // Child
        current = current.parentNode as VirtualElement | null
        if (!current || !matchesSimpleSelector(current, part.selector)) {
          return false
        }
        break
      case '+': // Adjacent sibling
        current = getPreviousSibling(current)
        if (!current || !matchesSimpleSelector(current, part.selector)) {
          return false
        }
        break
      case '~': // General sibling
        current = findPreviousSibling(current, part.selector)
        break
    }

    if (!current) {
      return false
    }
  }

  return true
}

function parseComplexSelector(selector: string): Array<{ selector: string, combinator: string }> {
  const parts: Array<{ selector: string, combinator: string }> = []
  // Split but keep delimiters - don't filter yet!
  const tokens = selector.split(/(\s+|[>+~])/)

  let currentSelector = ''
  let currentCombinator = ''

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    // Skip empty strings (but not whitespace!)
    if (token === '') {
      continue
    }

    const trimmed = token.trim()

    if (trimmed === '>' || trimmed === '+' || trimmed === '~') {
      if (currentSelector) {
        parts.push({ selector: currentSelector, combinator: currentCombinator })
        currentSelector = ''
      }
      currentCombinator = trimmed
    }
    else if (/^\s+$/.test(token)) {
      // Token is pure whitespace - this is a descendant combinator
      if (currentSelector) {
        parts.push({ selector: currentSelector, combinator: currentCombinator })
        currentSelector = ''
        currentCombinator = ' '
      }
    }
    else {
      // This is a selector part
      currentSelector = trimmed
    }
  }

  if (currentSelector) {
    parts.push({ selector: currentSelector, combinator: currentCombinator })
  }

  return parts
}

function findAncestor(element: VirtualElement | null, selector: string): VirtualElement | null {
  let current = element?.parentNode as VirtualElement | null

  while (current) {
    if (current.nodeType === 'element' && matchesSimpleSelector(current, selector)) {
      return current
    }
    current = current.parentNode as VirtualElement | null
  }

  return null
}

function getPreviousSibling(element: VirtualElement): VirtualElement | null {
  const parent = element.parentNode
  if (!parent)
    return null

  const siblings = parent.children.filter(child => child.nodeType === 'element') as VirtualElement[]
  const index = siblings.indexOf(element)

  return index > 0 ? siblings[index - 1] : null
}

function findPreviousSibling(element: VirtualElement, selector: string): VirtualElement | null {
  const parent = element.parentNode
  if (!parent)
    return null

  const siblings = parent.children.filter(child => child.nodeType === 'element') as VirtualElement[]
  const index = siblings.indexOf(element)

  for (let i = index - 1; i >= 0; i--) {
    if (matchesSimpleSelector(siblings[i], selector)) {
      return siblings[i]
    }
  }

  return null
}

function matchesSimpleSelector(element: VirtualElement, selector: string): boolean {
  // Handle simple selectors (may include pseudo-classes)
  selector = selector.trim()

  // Universal selector
  if (selector === '*') {
    return true
  }

  // Check for pseudo-classes
  const pseudoMatch = selector.match(/^([^:]+)?(:[\w-]+(?:\([^)]*\))?)$/)
  if (pseudoMatch) {
    const [, baseSelector, pseudo] = pseudoMatch

    // First check if base selector matches (if present)
    if (baseSelector && !matchesSimpleSelector(element, baseSelector)) {
      return false
    }

    // Then check pseudo-class
    return matchesPseudoClass(element, pseudo)
  }

  // ID selector
  if (selector.startsWith('#')) {
    const id = selector.slice(1)
    return element.getAttribute('id') === id
  }

  // Class selector
  if (selector.startsWith('.')) {
    const className = selector.slice(1)
    return element.classList.contains(className)
  }

  // Attribute selector with advanced matchers
  if (selector.startsWith('[') && selector.endsWith(']')) {
    return matchesAttributeSelector(element, selector)
  }

  // Tag selector
  return element.nodeName.toLowerCase() === selector.toLowerCase()
}

function matchesPseudoClass(element: VirtualElement, pseudo: string): boolean {
  // :first-child
  if (pseudo === ':first-child') {
    if (!element.parentNode)
      return false
    const siblings = element.parentNode.children.filter(child => child.nodeType === 'element')
    return siblings[0] === element
  }

  // :last-child
  if (pseudo === ':last-child') {
    if (!element.parentNode)
      return false
    const siblings = element.parentNode.children.filter(child => child.nodeType === 'element')
    return siblings[siblings.length - 1] === element
  }

  // :nth-child(n)
  const nthChildMatch = pseudo.match(/:nth-child\((\d+|odd|even)\)/)
  if (nthChildMatch) {
    if (!element.parentNode)
      return false

    const siblings = element.parentNode.children.filter(child => child.nodeType === 'element')
    const index = siblings.indexOf(element as VirtualNode)

    if (index === -1)
      return false

    const position = index + 1 // nth-child is 1-indexed

    const arg = nthChildMatch[1]
    if (arg === 'odd') {
      return position % 2 === 1
    }
    if (arg === 'even') {
      return position % 2 === 0
    }
    return position === Number.parseInt(arg, 10)
  }

  // :not(selector)
  const notMatch = pseudo.match(/:not\(([^)]+)\)/)
  if (notMatch) {
    const innerSelector = notMatch[1]
    return !matchesSimpleSelector(element, innerSelector)
  }

  // :disabled
  if (pseudo === ':disabled') {
    return element.hasAttribute('disabled')
  }

  // :enabled
  if (pseudo === ':enabled') {
    return !element.hasAttribute('disabled')
  }

  // :checked
  if (pseudo === ':checked') {
    return element.hasAttribute('checked')
  }

  // :empty
  if (pseudo === ':empty') {
    return element.children.length === 0
  }

  // Unknown pseudo-class
  return false
}

function matchesAttributeSelector(element: VirtualElement, selector: string): boolean {
  const attrContent = selector.slice(1, -1)

  // [attr^="value"] - starts with
  const startsWithMatch = attrContent.match(/([a-z-]+)\^="([^"]*)"/i)
  if (startsWithMatch) {
    const [, attrName, attrValue] = startsWithMatch
    const value = element.getAttribute(attrName)
    return value ? value.startsWith(attrValue) : false
  }

  // [attr$="value"] - ends with
  const endsWithMatch = attrContent.match(/([a-z-]+)\$="([^"]*)"/i)
  if (endsWithMatch) {
    const [, attrName, attrValue] = endsWithMatch
    const value = element.getAttribute(attrName)
    return value ? value.endsWith(attrValue) : false
  }

  // [attr*="value"] - contains
  const containsMatch = attrContent.match(/([a-z-]+)\*="([^"]*)"/i)
  if (containsMatch) {
    const [, attrName, attrValue] = containsMatch
    const value = element.getAttribute(attrName)
    return value ? value.includes(attrValue) : false
  }

  // [attr~="word"] - word match
  const wordMatch = attrContent.match(/([a-z-]+)~="([^"]*)"/i)
  if (wordMatch) {
    const [, attrName, attrValue] = wordMatch
    const value = element.getAttribute(attrName)
    return value ? value.split(/\s+/).includes(attrValue) : false
  }

  // [attr="value"] - exact match or [attr] - existence
  const exactMatch = attrContent.match(/([a-z-]+)(?:="([^"]*)")?/i)
  if (exactMatch) {
    const [, attrName, attrValue] = exactMatch
    if (attrValue !== undefined) {
      return element.getAttribute(attrName) === attrValue
    }
    return element.hasAttribute(attrName)
  }

  return false
}

function matchesSelector(element: VirtualElement, selector: string): boolean {
  selector = selector.trim()

  if (hasCombinators(selector)) {
    return matchesComplexSelector(element, selector)
  }

  return matchesSimpleSelector(element, selector)
}

/**
 * Create a new virtual document
 */
export function createDocument(): VirtualDocument {
  const doc = new VirtualDocument()

  // Create basic HTML structure
  const html = doc.createElement('html')
  const head = doc.createElement('head')
  const body = doc.createElement('body')

  html.appendChild(head)
  html.appendChild(body)
  doc.appendChild(html)

  return doc
}
