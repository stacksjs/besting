import type { History, HistoryState, Location, NodeType, VirtualNode } from './VirtualNode'
import { VirtualElement } from './VirtualElement'
import { VirtualTextNode } from './VirtualTextNode'
import { VirtualCommentNode } from './VirtualCommentNode'
import { parseHTML } from '../parsers/html-parser'

export class VirtualDocument implements VirtualNode {
  nodeType: NodeType = 'document'
  nodeName = '#document'
  nodeValue: string | null = null
  attributes = new Map<string, string>()
  children: VirtualNode[] = []
  parentNode: VirtualNode | null = null

  documentElement: VirtualElement | null = null
  head: VirtualElement | null = null
  body: VirtualElement | null = null
  location: Location
  history: History
  title = ''

  private _historyStack: HistoryState[] = []
  private _historyIndex = -1

  constructor() {
    // Initialize with basic structure
    this.documentElement = new VirtualElement('html')
    this.head = new VirtualElement('head')
    this.body = new VirtualElement('body')

    this.documentElement.appendChild(this.head)
    this.documentElement.appendChild(this.body)
    this.appendChild(this.documentElement)

    // Initialize location
    this.location = {
      href: '',
      protocol: '',
      host: '',
      hostname: '',
      port: '',
      pathname: '',
      search: '',
      hash: '',
      origin: '',
      assign: (url: string) => {
        this._updateLocation(url)
      },
      replace: (url: string) => {
        this._updateLocation(url)
      },
      reload: () => {
        // No-op in virtual DOM
      },
    }

    // Initialize history with closure to maintain 'this' context
    const self = this
    this.history = {
      get length() {
        return self._historyStack.length
      },
      get state() {
        return self._historyStack[self._historyIndex]?.state || null
      },
      pushState(state: any, title: string, url?: string) {
        // Remove any forward history
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
          self._updateLocation(url)
        }
      },
      replaceState(state: any, title: string, url?: string) {
        if (self._historyIndex >= 0) {
          self._historyStack[self._historyIndex] = {
            state,
            title,
            url: url || self.location.href,
          }

          // Update location if URL provided
          if (url) {
            self._updateLocation(url)
          }
        }
      },
      back() {
        if (self._historyIndex > 0) {
          self._historyIndex--
          const entry = self._historyStack[self._historyIndex]
          if (entry.url) {
            self._updateLocation(entry.url)
          }
        }
      },
      forward() {
        if (self._historyIndex < self._historyStack.length - 1) {
          self._historyIndex++
          const entry = self._historyStack[self._historyIndex]
          if (entry.url) {
            self._updateLocation(entry.url)
          }
        }
      },
      go(delta: number) {
        const newIndex = self._historyIndex + delta
        if (newIndex >= 0 && newIndex < self._historyStack.length) {
          self._historyIndex = newIndex
          const entry = self._historyStack[self._historyIndex]
          if (entry.url) {
            self._updateLocation(entry.url)
          }
        }
      },
    }

    // Don't initialize history stack - let pushState be the first entry
    // this._historyStack.push({
    //   state: null,
    //   title: '',
    //   url: this.location.href,
    // })
    // this._historyIndex = 0
  }

  private _updateLocation(url: string): void {
    try {
      const parsed = new URL(url, this.location.href)
      this.location.href = parsed.href
      this.location.protocol = parsed.protocol
      this.location.host = parsed.host
      this.location.hostname = parsed.hostname
      this.location.port = parsed.port
      this.location.pathname = parsed.pathname
      this.location.search = parsed.search
      this.location.hash = parsed.hash
      this.location.origin = parsed.origin
    }
    catch {
      // Invalid URL, ignore
    }
  }

  get textContent(): string {
    return this.documentElement?.textContent || ''
  }

  set textContent(value: string) {
    if (this.documentElement) {
      this.documentElement.textContent = value
    }
  }

  appendChild(child: VirtualNode): VirtualNode {
    this.children.push(child)
    child.parentNode = this
    return child
  }

  createElement(tagName: string): VirtualElement {
    return new VirtualElement(tagName)
  }

  createTextNode(text: string): VirtualTextNode {
    return new VirtualTextNode(text)
  }

  createComment(text: string): VirtualCommentNode {
    return new VirtualCommentNode(text)
  }

  createDocumentFragment(): VirtualElement {
    // DocumentFragment is similar to a VirtualElement but doesn't get serialized
    // For simplicity, we use a VirtualElement with a special tag
    const fragment = new VirtualElement('document-fragment')
    // Mark it as a fragment internally
    ;(fragment as any)._isFragment = true
    return fragment
  }

  querySelector(selector: string): VirtualElement | null {
    return this.documentElement?.querySelector(selector) || null
  }

  querySelectorAll(selector: string): VirtualElement[] {
    return this.documentElement?.querySelectorAll(selector) || []
  }

  getElementById(id: string): VirtualElement | null {
    return this.querySelector(`#${id}`)
  }

  getElementsByTagName(tagName: string): VirtualElement[] {
    return this.querySelectorAll(tagName)
  }

  getElementsByClassName(className: string): VirtualElement[] {
    return this.querySelectorAll(`.${className}`)
  }

  // Parse and set body HTML
  parseHTML(html: string): void {
    const nodes = parseHTML(html)

    if (this.body) {
      this.body.children = []
      for (const node of nodes) {
        this.body.appendChild(node)
      }
    }
  }

  // Get computed styles
  getComputedStyle(element: VirtualElement): any {
    // For now, just return the inline styles with direct property access
    // In a full implementation, this would include default styles and cascaded styles
    const self = element
    return new Proxy(
      {
        getPropertyValue(property: string): string {
          return self.style.getPropertyValue(property)
        },
      },
      {
        get(target, prop: string) {
          if (prop === 'getPropertyValue') {
            return target.getPropertyValue
          }
          // Convert camelCase to kebab-case
          const kebabProp = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)
          return self.style.getPropertyValue(kebabProp)
        },
      },
    )
  }
}

/**
 * Factory function to create a new virtual document
 */
export function createDocument(): VirtualDocument {
  return new VirtualDocument()
}
