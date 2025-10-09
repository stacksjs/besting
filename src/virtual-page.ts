/**
 * Virtual Page Implementation
 *
 * Implements the Page API using our pure Bun virtual DOM.
 * No browser needed - everything runs in Bun's runtime!
 */

import { expect } from 'bun:test'
import type { VirtualDocument, VirtualElement } from './dom'
import { createDocument, parseHTML } from './dom'

interface VirtualStorage {
  [key: string]: string
}

/**
 * Virtual Page - DOM-based implementation
 */
export class VirtualPage {
  private document: VirtualDocument
  private _timeout: number
  private localStorage: VirtualStorage = {}
  private sessionStorage: VirtualStorage = {}
  private cookies: Map<string, { value: string, options?: any }> = new Map()
  private consoleLogs: Array<{ type: string, message: string, timestamp: number }> = []

  constructor(timeout: number = 30000) {
    this.document = createDocument()
    this._timeout = timeout
  }

  // Navigation
  async goto(url: string): Promise<void> {
    // Parse URL
    const urlObj = new URL(url)
    this.document.location = {
      href: url,
      protocol: urlObj.protocol,
      host: urlObj.host,
      hostname: urlObj.hostname,
      port: urlObj.port,
      pathname: urlObj.pathname,
      search: urlObj.search,
      hash: urlObj.hash,
    }

    // Fetch the page
    try {
      const response = await fetch(url)
      const html = await response.text()

      // Parse and set HTML
      const nodes = parseHTML(html)
      const htmlNode = nodes.find(n => n.nodeName === 'HTML')

      if (htmlNode) {
        this.document.children = [htmlNode]
        htmlNode.parentNode = this.document
      }
      else {
        // Create basic structure and add nodes to body
        const body = this.document.body
        if (body) {
          body.children = nodes
          nodes.forEach(node => node.parentNode = body)
        }
      }

      // Extract title
      const titleElement = this.document.querySelector('title')
      if (titleElement) {
        this.document.title = titleElement.textContent
      }
    }
    catch (error) {
      throw new Error(`Navigation failed: ${error}`)
    }
  }

  async navigate(url: string): Promise<void> {
    return this.goto(url)
  }

  // Element Interaction
  async click(selector: string): Promise<void> {
    const element = await this.waitForSelector(selector)
    if (!element) {
      throw new Error(`Element not found: ${selector}`)
    }

    // Simulate click event
    // In a real implementation, this would trigger event handlers
  }

  async type(selector: string, text: string): Promise<void> {
    const element = await this.waitForSelector(selector)
    if (!element) {
      throw new Error(`Element not found: ${selector}`)
    }

    const currentValue = element.getAttribute('value') || ''
    element.setAttribute('value', currentValue + text)
  }

  async fill(selector: string, text: string): Promise<void> {
    const element = await this.waitForSelector(selector)
    if (!element) {
      throw new Error(`Element not found: ${selector}`)
    }

    element.setAttribute('value', text)
  }

  async clear(selector: string): Promise<void> {
    const element = await this.waitForSelector(selector)
    if (!element) {
      throw new Error(`Element not found: ${selector}`)
    }

    element.setAttribute('value', '')
  }

  async select(selector: string, value: string): Promise<void> {
    const element = await this.waitForSelector(selector)
    if (!element) {
      throw new Error(`Element not found: ${selector}`)
    }

    element.setAttribute('value', value)
  }

  async check(selector: string): Promise<void> {
    const element = await this.waitForSelector(selector)
    if (!element) {
      throw new Error(`Element not found: ${selector}`)
    }

    element.setAttribute('checked', 'true')
  }

  async uncheck(selector: string): Promise<void> {
    const element = await this.waitForSelector(selector)
    if (!element) {
      throw new Error(`Element not found: ${selector}`)
    }

    element.removeAttribute('checked')
  }

  // Element Queries
  async querySelector(selector: string): Promise<VirtualElement | null> {
    return this.document.querySelector(selector)
  }

  async querySelectorAll(selector: string): Promise<VirtualElement[]> {
    return this.document.querySelectorAll(selector)
  }

  async waitForSelector(selector: string, options?: { timeout?: number }): Promise<VirtualElement | null> {
    const timeout = options?.timeout || this._timeout
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const element = this.document.querySelector(selector)
      if (element) {
        return element
      }
      await this.sleep(100)
    }

    throw new Error(`Timeout waiting for selector: ${selector}`)
  }

  async waitForText(text: string, options?: { timeout?: number }): Promise<void> {
    const timeout = options?.timeout || this._timeout
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const content = await this.content()
      if (content.includes(text)) {
        return
      }
      await this.sleep(100)
    }

    throw new Error(`Timeout waiting for text: ${text}`)
  }

  // Element Properties
  async text(selector: string): Promise<string> {
    const element = await this.waitForSelector(selector)
    return element?.textContent || ''
  }

  async value(selector: string): Promise<string> {
    const element = await this.waitForSelector(selector)
    return element?.getAttribute('value') || ''
  }

  async getAttribute(selector: string, name: string): Promise<string | null> {
    const element = await this.waitForSelector(selector)
    return element?.getAttribute(name) || null
  }

  async isVisible(selector: string): Promise<boolean> {
    const element = await this.querySelector(selector)
    if (!element)
      return false

    // Check for display: none or visibility: hidden
    const style = element.getAttribute('style') || ''
    if (style.includes('display: none') || style.includes('visibility: hidden')) {
      return false
    }

    return true
  }

  async isEnabled(selector: string): Promise<boolean> {
    const element = await this.querySelector(selector)
    if (!element)
      return false

    return !element.hasAttribute('disabled')
  }

  // Page Properties
  async title(): Promise<string> {
    return this.document.title
  }

  async url(): Promise<string> {
    return this.document.location.href
  }

  async content(): Promise<string> {
    return this.document.documentElement?.outerHTML || ''
  }

  // JavaScript Execution
  async evaluate<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T> {
    // Execute JavaScript in context with document
    const context = {
      document: this.document,
      window: {
        location: this.document.location,
        localStorage: {
          getItem: (key: string) => this.localStorage[key] || null,
          setItem: (key: string, value: string) => { this.localStorage[key] = value },
          removeItem: (key: string) => { delete this.localStorage[key] },
          clear: () => { this.localStorage = {} },
        },
        sessionStorage: {
          getItem: (key: string) => this.sessionStorage[key] || null,
          setItem: (key: string, value: string) => { this.sessionStorage[key] = value },
          removeItem: (key: string) => { delete this.sessionStorage[key] },
          clear: () => { this.sessionStorage = {} },
        },
        scrollTo: () => {},
        console: {
          log: (...msgs: any[]) => {
            this.consoleLogs.push({
              type: 'log',
              message: msgs.join(' '),
              timestamp: Date.now(),
            })
          },
          error: (...msgs: any[]) => {
            this.consoleLogs.push({
              type: 'error',
              message: msgs.join(' '),
              timestamp: Date.now(),
            })
          },
          warn: (...msgs: any[]) => {
            this.consoleLogs.push({
              type: 'warn',
              message: msgs.join(' '),
              timestamp: Date.now(),
            })
          },
        },
      },
    }

    try {
      // Bind the function to our context
      return fn.call(context.window, ...args)
    }
    catch (error) {
      throw new Error(`Evaluation error: ${error}`)
    }
  }

  // Storage APIs
  async getLocalStorage(key: string): Promise<string | null> {
    return this.localStorage[key] || null
  }

  async setLocalStorage(key: string, value: string): Promise<void> {
    this.localStorage[key] = value
  }

  async removeLocalStorage(key: string): Promise<void> {
    delete this.localStorage[key]
  }

  async clearLocalStorage(): Promise<void> {
    this.localStorage = {}
  }

  async getSessionStorage(key: string): Promise<string | null> {
    return this.sessionStorage[key] || null
  }

  async setSessionStorage(key: string, value: string): Promise<void> {
    this.sessionStorage[key] = value
  }

  async removeSessionStorage(key: string): Promise<void> {
    delete this.sessionStorage[key]
  }

  async clearSessionStorage(): Promise<void> {
    this.sessionStorage = {}
  }

  // Cookie Management
  async getCookies(): Promise<Array<{ name: string, value: string }>> {
    return Array.from(this.cookies.entries()).map(([name, data]) => ({
      name,
      value: data.value,
    }))
  }

  async getCookie(name: string): Promise<{ name: string, value: string } | null> {
    const cookie = this.cookies.get(name)
    return cookie ? { name, value: cookie.value } : null
  }

  async setCookie(name: string, value: string, options?: any): Promise<void> {
    this.cookies.set(name, { value, options })
  }

  async deleteCookie(name: string): Promise<void> {
    this.cookies.delete(name)
  }

  async clearCookies(): Promise<void> {
    this.cookies.clear()
  }

  // Scrolling (no-ops in virtual mode)
  async scrollTo(_x: number, _y: number): Promise<void> {
    // No-op in virtual DOM
  }

  async scrollToElement(_selector: string): Promise<void> {
    // No-op in virtual DOM
  }

  async scrollToTop(): Promise<void> {
    // No-op in virtual DOM
  }

  async scrollToBottom(): Promise<void> {
    // No-op in virtual DOM
  }

  // Console Logs
  async startConsoleCapture(): Promise<void> {
    // Already capturing in evaluate()
  }

  getConsoleLogs(): Array<{ type: string, message: string, timestamp: number }> {
    return this.consoleLogs
  }

  clearConsoleLogs(): void {
    this.consoleLogs = []
  }

  // Utilities
  async waitFor(ms: number): Promise<void> {
    return this.sleep(ms)
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async press(_key: string): Promise<void> {
    // Keyboard events in virtual DOM - simplified
  }

  async focus(_selector: string): Promise<void> {
    // Focus in virtual DOM - no-op
  }

  async blur(_selector: string): Promise<void> {
    // Blur in virtual DOM - no-op
  }

  async setViewport(_width: number, _height: number): Promise<void> {
    // Viewport in virtual DOM - no-op
  }

  // Laravel Dusk-style Assertions
  async assertSee(text: string): Promise<void> {
    const content = await this.content()
    expect(content).toContain(text)
  }

  async assertDontSee(text: string): Promise<void> {
    const content = await this.content()
    expect(content).not.toContain(text)
  }

  async assertSeeIn(selector: string, text: string): Promise<void> {
    const elementText = await this.text(selector)
    expect(elementText).toContain(text)
  }

  async assertDontSeeIn(selector: string, text: string): Promise<void> {
    const elementText = await this.text(selector)
    expect(elementText).not.toContain(text)
  }

  async assertTitle(title: string): Promise<void> {
    const pageTitle = await this.title()
    expect(pageTitle).toBe(title)
  }

  async assertTitleContains(text: string): Promise<void> {
    const pageTitle = await this.title()
    expect(pageTitle).toContain(text)
  }

  async assertUrlIs(url: string): Promise<void> {
    const currentUrl = await this.url()
    expect(currentUrl).toBe(url)
  }

  async assertUrlContains(text: string): Promise<void> {
    const currentUrl = await this.url()
    expect(currentUrl).toContain(text)
  }

  async assertPresent(selector: string): Promise<void> {
    const element = await this.querySelector(selector)
    expect(element).not.toBeNull()
  }

  async assertMissing(selector: string): Promise<void> {
    const element = await this.querySelector(selector)
    expect(element).toBeNull()
  }

  async assertVisible(selector: string): Promise<void> {
    const visible = await this.isVisible(selector)
    expect(visible).toBe(true)
  }

  async assertNotVisible(selector: string): Promise<void> {
    const visible = await this.isVisible(selector)
    expect(visible).toBe(false)
  }

  async assertEnabled(selector: string): Promise<void> {
    const enabled = await this.isEnabled(selector)
    expect(enabled).toBe(true)
  }

  async assertDisabled(selector: string): Promise<void> {
    const enabled = await this.isEnabled(selector)
    expect(enabled).toBe(false)
  }

  async assertValue(selector: string, value: string): Promise<void> {
    const elementValue = await this.value(selector)
    expect(elementValue).toBe(value)
  }

  async assertChecked(selector: string): Promise<void> {
    const element = await this.querySelector(selector)
    expect(element?.hasAttribute('checked')).toBe(true)
  }

  async assertNotChecked(selector: string): Promise<void> {
    const element = await this.querySelector(selector)
    expect(element?.hasAttribute('checked')).toBe(false)
  }

  async assertAttribute(selector: string, attribute: string, value: string): Promise<void> {
    const attrValue = await this.getAttribute(selector, attribute)
    expect(attrValue).toBe(value)
  }

  async assertHasClass(selector: string, className: string): Promise<void> {
    const element = await this.querySelector(selector)
    expect(element?.classList.contains(className)).toBe(true)
  }

  async assertHasNotClass(selector: string, className: string): Promise<void> {
    const element = await this.querySelector(selector)
    expect(element?.classList.contains(className)).toBe(false)
  }
}

/**
 * Create a virtual page
 */
export function createVirtualPage(timeout?: number): VirtualPage {
  return new VirtualPage(timeout)
}

/**
 * Helper for running virtual page tests
 */
export async function browse(callback: (page: VirtualPage) => Promise<void>): Promise<void> {
  const page = createVirtualPage()
  await callback(page)
}
