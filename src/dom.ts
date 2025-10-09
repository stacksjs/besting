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

  querySelector(selector: string): VirtualElement | null {
    return querySelectorEngine(this, selector)
  }

  querySelectorAll(selector: string): VirtualElement[] {
    return querySelectorAllEngine(this, selector)
  }

  matches(selector: string): boolean {
    return matchesSelector(this, selector)
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

  constructor() {
    super('document')
    this.nodeName = '#document'
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
 * CSS Selector Engine (Basic implementation)
 */
function querySelectorEngine(root: VirtualElement, selector: string): VirtualElement | null {
  const results = querySelectorAllEngine(root, selector)
  return results[0] || null
}

function querySelectorAllEngine(root: VirtualElement, selector: string): VirtualElement[] {
  const results: VirtualElement[] = []

  function traverse(node: VirtualNode): void {
    if (node.nodeType === 'element') {
      const element = node as VirtualElement
      if (matchesSelector(element, selector)) {
        results.push(element)
      }
      element.children.forEach(traverse)
    }
  }

  traverse(root)
  return results
}

function matchesSelector(element: VirtualElement, selector: string): boolean {
  // Handle simple selectors
  selector = selector.trim()

  // Universal selector
  if (selector === '*') {
    return true
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

  // Attribute selector
  if (selector.startsWith('[') && selector.endsWith(']')) {
    const attrMatch = selector.slice(1, -1).match(/([a-z-]+)(?:="([^"]*)")?/i)
    if (attrMatch) {
      const [, attrName, attrValue] = attrMatch
      if (attrValue !== undefined) {
        return element.getAttribute(attrName) === attrValue
      }
      return element.hasAttribute(attrName)
    }
  }

  // Tag selector
  return element.nodeName.toLowerCase() === selector.toLowerCase()
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
