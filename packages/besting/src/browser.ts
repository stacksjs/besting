/**
 * Browser Testing Module
 *
 * Provides Laravel Dusk-inspired browser testing capabilities using
 * Bun's native tooling and Chrome DevTools Protocol (CDP).
 *
 * No external dependencies - pure Bun implementation.
 */

import type { Subprocess } from 'bun'
import { expect } from 'bun:test'
import { Buffer } from 'node:buffer'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import process from 'node:process'

export type BrowserType = 'chromium' | 'firefox'

interface BrowserOptions {
  browser?: BrowserType
  headless?: boolean
  width?: number
  height?: number
  timeout?: number
  slowMo?: number
  devtools?: boolean
  executablePath?: string
}

interface ElementHandle {
  click: () => Promise<void>
  type: (text: string) => Promise<void>
  clear: () => Promise<void>
  value: () => Promise<string>
  text: () => Promise<string>
  getAttribute: (name: string) => Promise<string | null>
  isVisible: () => Promise<boolean>
  isEnabled: () => Promise<boolean>
  screenshot: () => Promise<Buffer>
}

interface PageScreenshotOptions {
  path?: string
  fullPage?: boolean
  type?: 'png' | 'jpeg'
  quality?: number
}

/**
 * Get bundled Chromium path
 */
export function getBundledChromiumPath(): string {
  const homeDir = os.homedir()
  const bestingDir = path.join(homeDir, '.besting')

  const platform = process.platform
  const arch = process.arch

  if (platform === 'darwin') {
    if (arch === 'arm64') {
      return path.join(bestingDir, 'chromium-mac-arm64', 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium')
    }
    return path.join(bestingDir, 'chromium-mac-x64', 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium')
  }
  else if (platform === 'linux') {
    return path.join(bestingDir, 'chromium-linux', 'chrome-linux', 'chrome')
  }
  else if (platform === 'win32') {
    return path.join(bestingDir, 'chromium-win64', 'chrome-win', 'chrome.exe')
  }

  return ''
}

/**
 * Find Chrome/Chromium executable
 */
export function findChrome(): string | null {
  // Check for bundled Chromium first
  const bundledPath = getBundledChromiumPath()
  if (fs.existsSync(bundledPath)) {
    return bundledPath
  }

  // Common Chrome installation paths
  const chromePaths = [
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ]

  for (const chromePath of chromePaths) {
    if (fs.existsSync(chromePath)) {
      return chromePath
    }
  }

  return null
}

/**
 * Find Firefox executable
 */
export function findFirefox(): string | null {
  // Common Firefox installation paths
  const firefoxPaths = [
    // macOS
    '/Applications/Firefox.app/Contents/MacOS/firefox',
    // Linux
    '/usr/bin/firefox',
    '/usr/bin/firefox-esr',
    '/snap/bin/firefox',
    // Windows
    'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
    'C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe',
  ]

  for (const firefoxPath of firefoxPaths) {
    if (fs.existsSync(firefoxPath)) {
      return firefoxPath
    }
  }

  return null
}

/**
 * Chrome DevTools Protocol Client
 */
class CDPClient {
  private ws: WebSocket | null = null
  private messageId = 0
  private callbacks = new Map<number, { resolve: (...args: any[]) => any, reject: (...args: any[]) => any }>()
  private eventHandlers = new Map<string, ((...args: any[]) => any)[]>()

  constructor(private wsUrl: string) {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl)

      this.ws.onopen = () => {
        resolve()
      }

      this.ws.onerror = (error) => {
        reject(new Error(`WebSocket error: ${error}`))
      }

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data as string)

        if (message.id !== undefined) {
          const callback = this.callbacks.get(message.id)
          if (callback) {
            if (message.error) {
              callback.reject(new Error(message.error.message))
            }
            else {
              callback.resolve(message.result)
            }
            this.callbacks.delete(message.id)
          }
        }
        else if (message.method) {
          const handlers = this.eventHandlers.get(message.method)
          if (handlers) {
            handlers.forEach(handler => handler(message.params))
          }
        }
      }
    })
  }

  async send(method: string, params: any = {}): Promise<any> {
    if (!this.ws) {
      throw new Error('WebSocket not connected')
    }

    return new Promise((resolve, reject) => {
      const id = ++this.messageId
      this.callbacks.set(id, { resolve, reject })

      this.ws!.send(JSON.stringify({ id, method, params }))
    })
  }

  on(event: string, handler: (...args: any[]) => any): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(handler)
  }

  async close(): Promise<void> {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

/**
 * Browser Page
 */
class Page {
  private client: CDPClient
  private timeout: number

  constructor(client: CDPClient, timeout: number = 30000) {
    this.client = client
    this.timeout = timeout
  }

  async navigate(url: string): Promise<void> {
    await this.client.send('Page.enable')
    await this.client.send('Page.navigate', { url })
    await this.waitForNavigation()
  }

  async goto(url: string): Promise<void> {
    return this.navigate(url)
  }

  async waitForNavigation(options?: { timeout?: number }): Promise<void> {
    const timeout = options?.timeout || this.timeout

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Navigation timeout'))
      }, timeout)

      this.client.on('Page.loadEventFired', () => {
        clearTimeout(timer)
        resolve()
      })
    })
  }

  async waitForSelector(selector: string, options?: { timeout?: number, visible?: boolean }): Promise<ElementHandle> {
    const timeout = options?.timeout || this.timeout
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const element = await this.querySelector(selector)
      if (element) {
        if (options?.visible) {
          const isVisible = await element.isVisible()
          if (isVisible) {
            return element
          }
        }
        else {
          return element
        }
      }
      await this.sleep(100)
    }

    throw new Error(`Timeout waiting for selector: ${selector}`)
  }

  async querySelector(selector: string): Promise<ElementHandle | null> {
    await this.client.send('Runtime.enable')
    await this.client.send('DOM.enable')

    const { root } = await this.client.send('DOM.getDocument')
    const { nodeId } = await this.client.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector,
    })

    if (nodeId === 0) {
      return null
    }

    return new ElementHandleImpl(this.client, nodeId)
  }

  async querySelectorAll(selector: string): Promise<ElementHandle[]> {
    await this.client.send('Runtime.enable')
    await this.client.send('DOM.enable')

    const { root } = await this.client.send('DOM.getDocument')
    const { nodeIds } = await this.client.send('DOM.querySelectorAll', {
      nodeId: root.nodeId,
      selector,
    })

    return nodeIds.map((nodeId: number) => new ElementHandleImpl(this.client, nodeId))
  }

  async click(selector: string): Promise<void> {
    const element = await this.waitForSelector(selector)
    await element.click()
  }

  async type(selector: string, text: string): Promise<void> {
    const element = await this.waitForSelector(selector)
    await element.type(text)
  }

  async fill(selector: string, text: string): Promise<void> {
    const element = await this.waitForSelector(selector)
    await element.clear()
    await element.type(text)
  }

  async select(selector: string, value: string): Promise<void> {
    await this.evaluate((sel: string, val: string) => {
      const element = document.querySelector(sel) as HTMLSelectElement
      if (element) {
        element.value = val
        element.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }, selector, value)
  }

  async check(selector: string): Promise<void> {
    await this.evaluate((sel: string) => {
      const element = document.querySelector(sel) as HTMLInputElement
      if (element && !element.checked) {
        element.checked = true
        element.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }, selector)
  }

  async uncheck(selector: string): Promise<void> {
    await this.evaluate((sel: string) => {
      const element = document.querySelector(sel) as HTMLInputElement
      if (element && element.checked) {
        element.checked = false
        element.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }, selector)
  }

  async text(selector: string): Promise<string> {
    const element = await this.waitForSelector(selector)
    return element.text()
  }

  async value(selector: string): Promise<string> {
    const element = await this.waitForSelector(selector)
    return element.value()
  }

  async getAttribute(selector: string, name: string): Promise<string | null> {
    const element = await this.waitForSelector(selector)
    return element.getAttribute(name)
  }

  async title(): Promise<string> {
    const result = await this.evaluate(() => document.title)
    return result
  }

  async url(): Promise<string> {
    const result = await this.evaluate(() => window.location.href)
    return result
  }

  async content(): Promise<string> {
    const result = await this.evaluate(() => document.documentElement.outerHTML)
    return result
  }

  async evaluate(fn: (...args: any[]) => any, ...args: any[]): Promise<any> {
    const fnString = fn.toString()
    const expression = `(${fnString})(${args.map(arg => JSON.stringify(arg)).join(',')})`

    const result = await this.client.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
    })

    if (result.exceptionDetails) {
      throw new Error(`Evaluation error: ${result.exceptionDetails.text}`)
    }

    return result.result.value
  }

  async screenshot(options?: PageScreenshotOptions): Promise<Buffer> {
    const { data } = await this.client.send('Page.captureScreenshot', {
      format: options?.type || 'png',
      quality: options?.quality,
      captureBeyondViewport: options?.fullPage,
    })

    const buffer = Buffer.from(data, 'base64')

    if (options?.path) {
      await Bun.write(options.path, buffer)
    }

    return buffer
  }

  async waitFor(ms: number): Promise<void> {
    return this.sleep(ms)
  }

  async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async waitForText(text: string, options?: { timeout?: number }): Promise<void> {
    const timeout = options?.timeout || this.timeout
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

  async press(key: string): Promise<void> {
    await this.client.send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key,
    })
    await this.client.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key,
    })
  }

  async focus(selector: string): Promise<void> {
    await this.evaluate((sel: string) => {
      const element = document.querySelector(sel) as HTMLElement
      if (element) {
        element.focus()
      }
    }, selector)
  }

  async blur(selector: string): Promise<void> {
    await this.evaluate((sel: string) => {
      const element = document.querySelector(sel) as HTMLElement
      if (element) {
        element.blur()
      }
    }, selector)
  }

  async isVisible(selector: string): Promise<boolean> {
    const element = await this.querySelector(selector)
    if (!element) {
      return false
    }
    return element.isVisible()
  }

  async isEnabled(selector: string): Promise<boolean> {
    const element = await this.querySelector(selector)
    if (!element) {
      return false
    }
    return element.isEnabled()
  }

  async setViewport(width: number, height: number): Promise<void> {
    await this.client.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    })
  }

  // Advanced Mouse Interactions
  async hover(selector: string): Promise<void> {
    const element = await this.waitForSelector(selector)
    const { model } = await this.client.send('DOM.getBoxModel', { nodeId: (element as any).nodeId })
    const [x, y] = model.content

    await this.client.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x,
      y,
    })
  }

  async doubleClick(selector: string): Promise<void> {
    const element = await this.waitForSelector(selector)
    const { model } = await this.client.send('DOM.getBoxModel', { nodeId: (element as any).nodeId })
    const [x, y] = model.content

    await this.client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x,
      y,
      button: 'left',
      clickCount: 2,
    })

    await this.client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x,
      y,
      button: 'left',
      clickCount: 2,
    })
  }

  async rightClick(selector: string): Promise<void> {
    const element = await this.waitForSelector(selector)
    const { model } = await this.client.send('DOM.getBoxModel', { nodeId: (element as any).nodeId })
    const [x, y] = model.content

    await this.client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x,
      y,
      button: 'right',
      clickCount: 1,
    })

    await this.client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x,
      y,
      button: 'right',
      clickCount: 1,
    })
  }

  async drag(sourceSelector: string, targetSelector: string): Promise<void> {
    const source = await this.waitForSelector(sourceSelector)
    const target = await this.waitForSelector(targetSelector)

    const { model: sourceModel } = await this.client.send('DOM.getBoxModel', { nodeId: (source as any).nodeId })
    const { model: targetModel } = await this.client.send('DOM.getBoxModel', { nodeId: (target as any).nodeId })

    const [sourceX, sourceY] = sourceModel.content
    const [targetX, targetY] = targetModel.content

    // Mouse down on source
    await this.client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: sourceX,
      y: sourceY,
      button: 'left',
    })

    // Move to target
    await this.client.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: targetX,
      y: targetY,
    })

    // Release on target
    await this.client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: targetX,
      y: targetY,
      button: 'left',
    })
  }

  // Cookie Management
  async getCookies(): Promise<Array<{ name: string, value: string, domain: string, path: string }>> {
    await this.client.send('Network.enable')
    const { cookies } = await this.client.send('Network.getAllCookies')
    return cookies
  }

  async getCookie(name: string): Promise<{ name: string, value: string } | null> {
    const cookies = await this.getCookies()
    return cookies.find(c => c.name === name) || null
  }

  async setCookie(name: string, value: string, options?: {
    domain?: string
    path?: string
    secure?: boolean
    httpOnly?: boolean
    sameSite?: 'Strict' | 'Lax' | 'None'
  }): Promise<void> {
    await this.client.send('Network.enable')
    await this.client.send('Network.setCookie', {
      name,
      value,
      domain: options?.domain,
      path: options?.path || '/',
      secure: options?.secure,
      httpOnly: options?.httpOnly,
      sameSite: options?.sameSite,
    })
  }

  async deleteCookie(name: string): Promise<void> {
    const currentUrl = await this.url()
    const urlObj = new URL(currentUrl)

    await this.client.send('Network.enable')
    await this.client.send('Network.deleteCookies', {
      name,
      domain: urlObj.hostname,
    })
  }

  async clearCookies(): Promise<void> {
    await this.client.send('Network.enable')
    await this.client.send('Network.clearBrowserCookies')
  }

  // Local Storage
  async getLocalStorage(key: string): Promise<string | null> {
    return await this.evaluate((k: string) => {
      return localStorage.getItem(k)
    }, key)
  }

  async setLocalStorage(key: string, value: string): Promise<void> {
    await this.evaluate((k: string, v: string) => {
      localStorage.setItem(k, v)
    }, key, value)
  }

  async removeLocalStorage(key: string): Promise<void> {
    await this.evaluate((k: string) => {
      localStorage.removeItem(k)
    }, key)
  }

  async clearLocalStorage(): Promise<void> {
    await this.evaluate(() => {
      localStorage.clear()
    })
  }

  // Session Storage
  async getSessionStorage(key: string): Promise<string | null> {
    return await this.evaluate((k: string) => {
      return sessionStorage.getItem(k)
    }, key)
  }

  async setSessionStorage(key: string, value: string): Promise<void> {
    await this.evaluate((k: string, v: string) => {
      sessionStorage.setItem(k, v)
    }, key, value)
  }

  async removeSessionStorage(key: string): Promise<void> {
    await this.evaluate((k: string) => {
      sessionStorage.removeItem(k)
    }, key)
  }

  async clearSessionStorage(): Promise<void> {
    await this.evaluate(() => {
      sessionStorage.clear()
    })
  }

  // Scroll Functions
  async scrollTo(x: number, y: number): Promise<void> {
    await this.evaluate((scrollX: number, scrollY: number) => {
      window.scrollTo(scrollX, scrollY)
    }, x, y)
  }

  async scrollToElement(selector: string): Promise<void> {
    await this.evaluate((sel: string) => {
      const element = document.querySelector(sel)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, selector)
  }

  async scrollToTop(): Promise<void> {
    await this.scrollTo(0, 0)
  }

  async scrollToBottom(): Promise<void> {
    await this.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })
  }

  // Dialog Handling
  private dialogHandler: ((message: string) => boolean | string | Promise<boolean | string>) | null = null

  async onDialog(handler: (message: string) => boolean | string | Promise<boolean | string>): Promise<void> {
    this.dialogHandler = handler
    await this.client.send('Page.enable')

    this.client.on('Page.javascriptDialogOpening', async (params: any) => {
      if (this.dialogHandler) {
        const response = await this.dialogHandler(params.message)

        if (typeof response === 'string') {
          // Prompt dialog
          await this.client.send('Page.handleJavaScriptDialog', {
            accept: true,
            promptText: response,
          })
        }
        else {
          // Alert or Confirm dialog
          await this.client.send('Page.handleJavaScriptDialog', {
            accept: response,
          })
        }
      }
    })
  }

  async acceptDialog(): Promise<void> {
    await this.client.send('Page.handleJavaScriptDialog', {
      accept: true,
    })
  }

  async dismissDialog(): Promise<void> {
    await this.client.send('Page.handleJavaScriptDialog', {
      accept: false,
    })
  }

  // File Upload
  async uploadFile(selector: string, ...filePaths: string[]): Promise<void> {
    const element = await this.waitForSelector(selector)
    const { node } = await this.client.send('DOM.describeNode', { nodeId: (element as any).nodeId })

    if (node.nodeName !== 'INPUT' || !node.attributes.includes('type') || !node.attributes.includes('file')) {
      throw new Error('Element is not a file input')
    }

    await this.client.send('DOM.setFileInputFiles', {
      nodeId: (element as any).nodeId,
      files: filePaths,
    })
  }

  // Console Log Capture
  private consoleLogs: Array<{ type: string, message: string, timestamp: number }> = []

  async startConsoleCapture(): Promise<void> {
    await this.client.send('Runtime.enable')
    await this.client.send('Log.enable')

    this.client.on('Runtime.consoleAPICalled', (params: any) => {
      const message = params.args.map((arg: any) => arg.value || arg.description || '').join(' ')
      this.consoleLogs.push({
        type: params.type,
        message,
        timestamp: Date.now(),
      })
    })

    this.client.on('Log.entryAdded', (params: any) => {
      this.consoleLogs.push({
        type: params.entry.level,
        message: params.entry.text,
        timestamp: Date.now(),
      })
    })
  }

  getConsoleLogs(): Array<{ type: string, message: string, timestamp: number }> {
    return this.consoleLogs
  }

  clearConsoleLogs(): void {
    this.consoleLogs = []
  }

  // PDF Generation
  async pdf(options?: {
    path?: string
    format?: 'Letter' | 'Legal' | 'A4'
    printBackground?: boolean
    landscape?: boolean
    scale?: number
    marginTop?: number
    marginBottom?: number
    marginLeft?: number
    marginRight?: number
  }): Promise<Buffer> {
    const { data } = await this.client.send('Page.printToPDF', {
      landscape: options?.landscape || false,
      printBackground: options?.printBackground !== false,
      paperWidth: options?.format === 'Legal' ? 8.5 : options?.format === 'A4' ? 8.27 : 8.5,
      paperHeight: options?.format === 'Legal' ? 14 : options?.format === 'A4' ? 11.69 : 11,
      scale: options?.scale || 1,
      marginTop: options?.marginTop || 0,
      marginBottom: options?.marginBottom || 0,
      marginLeft: options?.marginLeft || 0,
      marginRight: options?.marginRight || 0,
    })

    const buffer = Buffer.from(data, 'base64')

    if (options?.path) {
      await Bun.write(options.path, buffer)
    }

    return buffer
  }

  // Network Control
  async setOffline(offline: boolean): Promise<void> {
    await this.client.send('Network.enable')
    await this.client.send('Network.emulateNetworkConditions', {
      offline,
      downloadThroughput: offline ? 0 : -1,
      uploadThroughput: offline ? 0 : -1,
      latency: 0,
    })
  }

  async setNetworkThrottle(profile: 'fast3G' | 'slow3G' | 'offline' | 'none'): Promise<void> {
    await this.client.send('Network.enable')

    const profiles = {
      fast3G: { downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, latency: 40 },
      slow3G: { downloadThroughput: 500 * 1024 / 8, uploadThroughput: 500 * 1024 / 8, latency: 400 },
      offline: { downloadThroughput: 0, uploadThroughput: 0, latency: 0 },
      none: { downloadThroughput: -1, uploadThroughput: -1, latency: 0 },
    }

    const config = profiles[profile]

    await this.client.send('Network.emulateNetworkConditions', {
      offline: profile === 'offline',
      downloadThroughput: config.downloadThroughput,
      uploadThroughput: config.uploadThroughput,
      latency: config.latency,
    })
  }

  async interceptRequest(urlPattern: string, handler: (request: any) => void): Promise<void> {
    await this.client.send('Network.enable')
    await this.client.send('Network.setRequestInterception', {
      patterns: [{ urlPattern }],
    })

    this.client.on('Network.requestIntercepted', handler)
  }

  // Mobile Emulation
  async setUserAgent(userAgent: string): Promise<void> {
    await this.client.send('Network.enable')
    await this.client.send('Network.setUserAgentOverride', { userAgent })
  }

  async setGeolocation(latitude: number, longitude: number, accuracy: number = 100): Promise<void> {
    await this.client.send('Emulation.setGeolocationOverride', {
      latitude,
      longitude,
      accuracy,
    })
  }

  async emulateDevice(device: 'iPhone' | 'iPad' | 'Pixel' | 'Galaxy'): Promise<void> {
    const devices = {
      iPhone: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        width: 375,
        height: 812,
        deviceScaleFactor: 3,
        mobile: true,
      },
      iPad: {
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        width: 768,
        height: 1024,
        deviceScaleFactor: 2,
        mobile: true,
      },
      Pixel: {
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
        width: 393,
        height: 851,
        deviceScaleFactor: 3,
        mobile: true,
      },
      Galaxy: {
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Samsung Galaxy S21) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
        width: 360,
        height: 800,
        deviceScaleFactor: 4,
        mobile: true,
      },
    }

    const config = devices[device]

    await this.client.send('Network.enable')
    await this.client.send('Network.setUserAgentOverride', { userAgent: config.userAgent })
    await this.client.send('Emulation.setDeviceMetricsOverride', {
      width: config.width,
      height: config.height,
      deviceScaleFactor: config.deviceScaleFactor,
      mobile: config.mobile,
    })
  }

  async setTouchEmulation(enabled: boolean): Promise<void> {
    await this.client.send('Emulation.setTouchEmulationEnabled', {
      enabled,
    })
  }

  // Laravel Dusk-style assertions
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
    const checked = await this.evaluate((sel: string) => {
      const element = document.querySelector(sel) as HTMLInputElement
      return element?.checked || false
    }, selector)
    expect(checked).toBe(true)
  }

  async assertNotChecked(selector: string): Promise<void> {
    const checked = await this.evaluate((sel: string) => {
      const element = document.querySelector(sel) as HTMLInputElement
      return element?.checked || false
    }, selector)
    expect(checked).toBe(false)
  }

  async assertAttribute(selector: string, attribute: string, value: string): Promise<void> {
    const attrValue = await this.getAttribute(selector, attribute)
    expect(attrValue).toBe(value)
  }

  async assertHasClass(selector: string, className: string): Promise<void> {
    const hasClass = await this.evaluate((sel: string, cls: string) => {
      const element = document.querySelector(sel)
      return element?.classList.contains(cls) || false
    }, selector, className)
    expect(hasClass).toBe(true)
  }

  async assertHasNotClass(selector: string, className: string): Promise<void> {
    const hasClass = await this.evaluate((sel, cls) => {
      const element = document.querySelector(sel)
      return element?.classList.contains(cls) || false
    }, selector, className)
    expect(hasClass).toBe(false)
  }
}

/**
 * Element Handle Implementation
 */
class ElementHandleImpl implements ElementHandle {
  constructor(private client: CDPClient, private nodeId: number) {}

  async click(): Promise<void> {
    const { model } = await this.client.send('DOM.getBoxModel', { nodeId: this.nodeId })
    const [x, y] = model.content

    await this.client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x,
      y,
      button: 'left',
      clickCount: 1,
    })

    await this.client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x,
      y,
      button: 'left',
      clickCount: 1,
    })
  }

  async type(text: string): Promise<void> {
    await this.focus()

    for (const char of text) {
      await this.client.send('Input.dispatchKeyEvent', {
        type: 'char',
        text: char,
      })
    }
  }

  async clear(): Promise<void> {
    await this.focus()

    // Select all text
    await this.client.send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: 'a',
      modifiers: 2, // Ctrl/Cmd
    })

    await this.client.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: 'a',
      modifiers: 2,
    })

    // Delete
    await this.client.send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: 'Backspace',
    })

    await this.client.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: 'Backspace',
    })
  }

  async focus(): Promise<void> {
    await this.client.send('DOM.focus', { nodeId: this.nodeId })
  }

  async value(): Promise<string> {
    const { object } = await this.client.send('DOM.resolveNode', { nodeId: this.nodeId })
    const result = await this.client.send('Runtime.callFunctionOn', {
      objectId: object.objectId,
      functionDeclaration: 'function() { return this.value; }',
      returnByValue: true,
    })
    return result.result.value || ''
  }

  async text(): Promise<string> {
    const { object } = await this.client.send('DOM.resolveNode', { nodeId: this.nodeId })
    const result = await this.client.send('Runtime.callFunctionOn', {
      objectId: object.objectId,
      functionDeclaration: 'function() { return this.textContent; }',
      returnByValue: true,
    })
    return result.result.value || ''
  }

  async getAttribute(name: string): Promise<string | null> {
    const { attributes } = await this.client.send('DOM.getAttributes', { nodeId: this.nodeId })
    const index = attributes.indexOf(name)
    return index !== -1 ? attributes[index + 1] : null
  }

  async isVisible(): Promise<boolean> {
    try {
      await this.client.send('DOM.getBoxModel', { nodeId: this.nodeId })
      return true
    }
    catch {
      return false
    }
  }

  async isEnabled(): Promise<boolean> {
    const disabled = await this.getAttribute('disabled')
    return disabled === null
  }

  async screenshot(): Promise<Buffer> {
    const { model } = await this.client.send('DOM.getBoxModel', { nodeId: this.nodeId })
    const [x, y, , , width, height] = model.content

    const { data } = await this.client.send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x,
        y,
        width: width - x,
        height: height - y,
        scale: 1,
      },
    })

    return Buffer.from(data, 'base64')
  }
}

/**
 * Browser Instance
 */
class Browser {
  private process: Subprocess | null = null
  private client: CDPClient | null = null
  private options: Required<BrowserOptions>
  private debugPort: number = 9222
  private browserType: BrowserType

  constructor(options: BrowserOptions = {}) {
    this.browserType = options.browser || 'chromium'
    this.options = {
      browser: this.browserType,
      headless: options.headless !== false,
      width: options.width || 1280,
      height: options.height || 720,
      timeout: options.timeout || 30000,
      slowMo: options.slowMo || 0,
      devtools: options.devtools || false,
      executablePath: options.executablePath || '',
    }
  }

  async launch(): Promise<void> {
    if (this.browserType === 'firefox') {
      await this.launchFirefox()
    }
    else {
      await this.launchChrome()
    }
  }

  private async launchChrome(): Promise<void> {
    // Find Chrome/Chromium binary
    const chromePath = this.options.executablePath || findChrome()

    if (!chromePath) {
      throw new Error(
        'Chrome/Chromium not found. Please install Chrome or run "besting setup-browser" to download Chromium.',
      )
    }

    const args = [
      `--remote-debugging-port=${this.debugPort}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-breakpad',
      '--disable-client-side-phishing-detection',
      '--disable-component-extensions-with-background-pages',
      '--disable-default-apps',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-features=TranslateUI',
      '--disable-hang-monitor',
      '--disable-ipc-flooding-protection',
      '--disable-popup-blocking',
      '--disable-prompt-on-repost',
      '--disable-renderer-backgrounding',
      '--disable-sync',
      '--force-color-profile=srgb',
      '--metrics-recording-only',
      '--no-service-autorun',
      '--password-store=basic',
      '--use-mock-keychain',
      `--window-size=${this.options.width},${this.options.height}`,
    ]

    if (this.options.headless) {
      args.push('--headless=new')
    }

    if (this.options.devtools) {
      args.push('--auto-open-devtools-for-tabs')
    }

    // Launch Chrome
    this.process = Bun.spawn([chromePath, ...args], {
      stdout: 'pipe',
      stderr: 'pipe',
    })

    // Wait for Chrome to start
    await this.sleep(1000)

    // Get WebSocket debugger URL
    const response = await fetch(`http://localhost:${this.debugPort}/json/version`)
    const json = await response.json()
    const wsUrl = json.webSocketDebuggerUrl

    // Connect to Chrome DevTools Protocol
    this.client = new CDPClient(wsUrl)
    await this.client.connect()
  }

  private async launchFirefox(): Promise<void> {
    // Find Firefox binary
    const firefoxPath = this.options.executablePath || findFirefox()

    if (!firefoxPath) {
      throw new Error(
        'Firefox not found. Please install Firefox or run "besting setup-browser --browser firefox" to download Firefox.',
      )
    }

    const args = [
      '--remote-debugging-port',
      this.debugPort.toString(),
      '--no-remote',
    ]

    if (this.options.headless) {
      args.push('--headless')
    }

    // Launch Firefox
    this.process = Bun.spawn([firefoxPath, ...args], {
      stdout: 'pipe',
      stderr: 'pipe',
    })

    // Wait for Firefox to start
    await this.sleep(2000)

    // Get WebSocket debugger URL
    // Firefox uses a similar protocol but slightly different endpoints
    const response = await fetch(`http://localhost:${this.debugPort}/json/version`)
    const json = await response.json()
    const wsUrl = json.webSocketDebuggerUrl

    // Connect to Firefox Remote Protocol (similar to CDP)
    this.client = new CDPClient(wsUrl)
    await this.client.connect()
  }

  async newPage(): Promise<Page> {
    if (!this.client) {
      throw new Error('Browser not launched')
    }

    // Create new target
    const { targetId } = await this.client.send('Target.createTarget', {
      url: 'about:blank',
    })

    // Get WebSocket URL for the new target
    const response = await fetch(`http://localhost:${this.debugPort}/json`)
    const targets = await response.json()
    const target = targets.find((t: any) => t.id === targetId)

    if (!target) {
      throw new Error('Failed to create new page')
    }

    // Connect to the new target
    const pageClient = new CDPClient(target.webSocketDebuggerUrl)
    await pageClient.connect()

    return new Page(pageClient, this.options.timeout)
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close()
    }

    if (this.process) {
      this.process.kill()
      this.process = null
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * Create a new browser instance
 */
export function browser(options?: BrowserOptions): Browser {
  return new Browser(options)
}

/**
 * Helper for running browser tests with automatic cleanup
 */
export async function browse(
  callback: (page: Page) => Promise<void>,
  options?: BrowserOptions,
): Promise<void> {
  const br = browser(options)

  try {
    await br.launch()
    const page = await br.newPage()
    await callback(page)
  }
  finally {
    await br.close()
  }
}

// Export types
export type { Browser, BrowserOptions, ElementHandle, Page, PageScreenshotOptions }
