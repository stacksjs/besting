import type { Storage } from '../storage/Storage'
import type { DetachedWindowAPI } from './DetachedWindowAPI'
import { DataTransfer, Notification, Performance } from '../apis/BrowserAPIs'
import { Navigator as VeryHappyNavigator } from '../apis/Clipboard'
import { VeryHappyFile, VeryHappyFileList, VeryHappyFileReader } from '../apis/FileAPI'
import { CustomEvent as VeryHappyCustomEvent } from '../events/CustomEvent'
import { XMLHttpRequest as VeryHappyXMLHttpRequest } from '../http/XMLHttpRequest'
import { VeryHappyWebSocket } from '../network/WebSocket'
import { VirtualDocument } from '../nodes/VirtualDocument'
import { IntersectionObserver as VeryHappyIntersectionObserver } from '../observers/IntersectionObserver'
import { MutationObserver as VeryHappyMutationObserver } from '../observers/MutationObserver'
import { ResizeObserver as VeryHappyResizeObserver } from '../observers/ResizeObserver'
import { createStorage } from '../storage/Storage'
import { TimerManager } from '../timers/TimerManager'
import { CustomElementRegistry, HTMLElement } from '../webcomponents/CustomElementRegistry'

export interface WindowOptions {
  url?: string
  width?: number
  height?: number
  console?: Console
  settings?: IOptionalBrowserSettings
}

export interface IOptionalBrowserSettings {
  navigator?: {
    userAgent?: string
  }
  device?: {
    prefersColorScheme?: 'light' | 'dark'
  }
}

export interface IBrowserSettings {
  navigator: {
    userAgent: string
  }
  device: {
    prefersColorScheme: 'light' | 'dark'
  }
}

/**
 * Window represents a browser window instance
 * Compatible with Happy DOM's Window API
 */
export class Window {
  public document: VirtualDocument
  public happyDOM: DetachedWindowAPI
  public console: Console
  public navigator: VeryHappyNavigator
  public customElements = new CustomElementRegistry()
  public HTMLElement = HTMLElement
  public localStorage: Storage
  public sessionStorage: Storage

  // Global APIs from Bun/Browser
  public fetch = globalThis.fetch.bind(globalThis)
  public Request = globalThis.Request
  public Response = globalThis.Response
  public Headers = globalThis.Headers
  public FormData = globalThis.FormData
  public URL = globalThis.URL
  public URLSearchParams = globalThis.URLSearchParams

  // Observer APIs
  public CustomEvent = VeryHappyCustomEvent
  public MutationObserver = VeryHappyMutationObserver
  public IntersectionObserver = VeryHappyIntersectionObserver
  public ResizeObserver = VeryHappyResizeObserver

  // Legacy HTTP API
  public XMLHttpRequest = VeryHappyXMLHttpRequest

  // WebSocket API
  public WebSocket = VeryHappyWebSocket

  // File API
  public File = VeryHappyFile
  public FileReader = VeryHappyFileReader
  public FileList = VeryHappyFileList

  // Additional Browser APIs
  public performance = new Performance()
  public Notification = Notification
  public DataTransfer = DataTransfer

  private _location: Location
  private _settings: IBrowserSettings
  private _width: number
  private _height: number
  private _timerManager: TimerManager

  constructor(options: WindowOptions = {}) {
    const {
      url = 'about:blank',
      width = 1024,
      height = 768,
      console: consoleInstance,
      settings = {},
    } = options

    this._width = width
    this._height = height

    // Initialize settings with defaults
    this._settings = {
      navigator: {
        userAgent: settings.navigator?.userAgent || 'Mozilla/5.0 (X11; Linux x64) AppleWebKit/537.36 (KHTML, like Gecko) VeryHappyDOM/1.0.0',
      },
      device: {
        prefersColorScheme: settings.device?.prefersColorScheme || 'light',
      },
    }

    // Use provided console or global console
    this.console = consoleInstance || globalThis.console

    // Create navigator
    this.navigator = new VeryHappyNavigator()

    // Create storage
    this.localStorage = createStorage()
    this.sessionStorage = createStorage()

    // Create timer manager
    this._timerManager = new TimerManager()

    // Create document
    this.document = new VirtualDocument()

    // Create location object
    this._location = this._createLocation(url)

    // Import DetachedWindowAPI lazily to avoid circular dependency
    const { DetachedWindowAPI } = require('./DetachedWindowAPI')
    this.happyDOM = new DetachedWindowAPI(this)
  }

  get location(): Location {
    return this._location
  }

  set location(url: string | Location) {
    const urlString = typeof url === 'string' ? url : url.href
    this._location = this._createLocation(urlString)
  }

  get innerWidth(): number {
    return this._width
  }

  get innerHeight(): number {
    return this._height
  }

  get outerWidth(): number {
    return this._width
  }

  get outerHeight(): number {
    return this._height
  }

  private _createLocation(url: string): Location {
    try {
      const parsed = new URL(url)
      return {
        href: parsed.href,
        origin: parsed.origin,
        protocol: parsed.protocol,
        host: parsed.host,
        hostname: parsed.hostname,
        port: parsed.port,
        pathname: parsed.pathname,
        search: parsed.search,
        hash: parsed.hash,
        assign: (url: string) => {
          this.location = url
        },
        replace: (url: string) => {
          this.location = url
        },
        reload: () => {
          // No-op for now
        },
        toString: () => parsed.href,
      } as Location
    }
    catch {
      // Fallback for invalid URLs
      return {
        href: url,
        origin: '',
        protocol: '',
        host: '',
        hostname: '',
        port: '',
        pathname: '',
        search: '',
        hash: '',
        assign: (url: string) => {
          this.location = url
        },
        replace: (url: string) => {
          this.location = url
        },
        reload: () => {},
        toString: () => url,
      } as Location
    }
  }

  // Getter for settings (through happyDOM API)
  get settings(): IBrowserSettings {
    return this._settings
  }

  // Timer methods
  setTimeout(callback: (...args: any[]) => void, delay?: number, ...args: any[]): number {
    return this._timerManager.setTimeout(callback, delay, ...args)
  }

  clearTimeout(id: number): void {
    this._timerManager.clearTimeout(id)
  }

  setInterval(callback: (...args: any[]) => void, delay?: number, ...args: any[]): number {
    return this._timerManager.setInterval(callback, delay, ...args)
  }

  clearInterval(id: number): void {
    this._timerManager.clearInterval(id)
  }

  requestAnimationFrame(callback: (time: number) => void): number {
    return this._timerManager.requestAnimationFrame(callback)
  }

  cancelAnimationFrame(id: number): void {
    this._timerManager.cancelAnimationFrame(id)
  }

  /**
   * Get timer manager for internal use
   * @internal
   */
  _getTimerManager(): TimerManager {
    return this._timerManager
  }
}

interface Location {
  href: string
  origin: string
  protocol: string
  host: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  assign: (url: string) => void
  replace: (url: string) => void
  reload: () => void
  toString: () => string
}
