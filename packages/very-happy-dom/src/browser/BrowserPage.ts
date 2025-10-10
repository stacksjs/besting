import { BrowserFrame } from './BrowserFrame'
import type { BrowserContext } from './BrowserContext'

export interface IBrowserPageViewport {
  width: number
  height: number
}

/**
 * BrowserPage represents a browser page (tab or popup window)
 * Compatible with Happy DOM's BrowserPage API
 */
export class BrowserPage {
  public mainFrame: BrowserFrame
  public console: Console

  private _context: BrowserContext
  private _viewport: IBrowserPageViewport
  private _frames: BrowserFrame[] = []

  constructor(context: BrowserContext) {
    this._context = context
    this._viewport = { width: 1024, height: 768 }
    this.console = globalThis.console

    // Create main frame
    this.mainFrame = new BrowserFrame(this)
    this._frames.push(this.mainFrame)
  }

  /**
   * Owner context
   */
  get context(): BrowserContext {
    return this._context
  }

  /**
   * Viewport settings
   */
  get viewport(): IBrowserPageViewport {
    return this._viewport
  }

  /**
   * All frames associated with the page
   */
  get frames(): BrowserFrame[] {
    return this._frames
  }

  /**
   * Page content HTML
   */
  get content(): string {
    return this.mainFrame.content
  }

  set content(html: string) {
    this.mainFrame.content = html
  }

  /**
   * Page URL
   */
  get url(): string {
    return this.mainFrame.url
  }

  set url(url: string) {
    this.mainFrame.url = url
  }

  /**
   * Closes the page
   */
  async close(): Promise<void> {
    await this.abort()
    // Remove from context
    this._context._removePage(this)
  }

  /**
   * Waits for all ongoing operations to complete
   */
  async waitUntilComplete(): Promise<void> {
    await Promise.all(this._frames.map(frame => frame.waitUntilComplete()))
  }

  /**
   * Waits for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.mainFrame.waitForNavigation()
  }

  /**
   * Aborts all ongoing operations
   */
  async abort(): Promise<void> {
    await Promise.all(this._frames.map(frame => frame.abort()))
  }

  /**
   * Evaluates code in the page's context
   */
  evaluate(code: string | Function): any {
    return this.mainFrame.evaluate(code)
  }

  /**
   * Sets the viewport
   */
  setViewport(viewport: IBrowserPageViewport): void {
    this._viewport = { ...viewport }
  }

  /**
   * Navigates the main frame to a URL
   */
  async goto(url: string): Promise<Response | null> {
    return await this.mainFrame.goto(url)
  }

  /**
   * Navigates back in the main frame's history
   */
  async goBack(): Promise<Response | null> {
    return await this.mainFrame.goBack()
  }

  /**
   * Navigates forward in the main frame's history
   */
  async goForward(): Promise<Response | null> {
    return await this.mainFrame.goForward()
  }

  /**
   * Navigates by steps in the main frame's history
   */
  async goSteps(steps: number): Promise<Response | null> {
    return await this.mainFrame.goSteps(steps)
  }

  /**
   * Reloads the page
   */
  async reload(): Promise<Response | null> {
    return await this.mainFrame.reload()
  }
}
