// Export types
export type { NodeType, VirtualNode, EventListenerOptions, EventListener, Location, History, HistoryState } from './nodes/VirtualNode'
export type { WindowOptions, IOptionalBrowserSettings, IBrowserSettings } from './window/Window'
export type { IBrowserPageViewport, PageEventType, PageEventHandler } from './browser/BrowserPage'
export type { ICookie } from './browser/CookieContainer'
export type { MutationObserverInit, MutationRecord, MutationCallback } from './observers/MutationObserver'
export type { IntersectionObserverInit, IntersectionObserverEntry, IntersectionObserverCallback } from './observers/IntersectionObserver'
export type { ResizeObserverEntry, ResizeObserverCallback, ResizeObserverSize } from './observers/ResizeObserver'
export type { CustomEventInit } from './events/CustomEvent'

// Export DOM classes
export { VirtualElement } from './nodes/VirtualElement'
export { VirtualTextNode } from './nodes/VirtualTextNode'
export { VirtualCommentNode } from './nodes/VirtualCommentNode'
export { VirtualDocument, createDocument } from './nodes/VirtualDocument'
export { VirtualEvent } from './events/VirtualEvent'

// Export Browser API classes
export { Window } from './window/Window'
export { GlobalWindow } from './window/GlobalWindow'
export { DetachedWindowAPI } from './window/DetachedWindowAPI'
export { Browser } from './browser/Browser'
export { BrowserContext } from './browser/BrowserContext'
export { BrowserPage } from './browser/BrowserPage'
export { BrowserFrame } from './browser/BrowserFrame'
export { CookieContainer, CookieSameSiteEnum } from './browser/CookieContainer'

// Export Storage & Timers
export { Storage, createStorage } from './storage/Storage'
export { TimerManager } from './timers/TimerManager'

// Export Event APIs
export { CustomEvent } from './events/CustomEvent'

// Export Observer APIs
export { MutationObserver } from './observers/MutationObserver'
export { IntersectionObserver } from './observers/IntersectionObserver'
export { ResizeObserver } from './observers/ResizeObserver'

// Export XPath APIs
export { XPathResult, XPathResultType } from './xpath/XPathResult'
export { XPathEvaluator } from './xpath/XPathEvaluator'

// Export HTTP APIs
export { XMLHttpRequest } from './http/XMLHttpRequest'

// Export Network APIs
export { VeryHappyWebSocket as WebSocket } from './network/WebSocket'
export { RequestInterceptor, type InterceptedRequest, type RequestInterceptionHandler } from './network/RequestInterceptor'

// Export Web Components
export { CustomElementRegistry, HTMLElement } from './webcomponents/CustomElementRegistry'
export { ShadowRoot, type ShadowRootInit } from './webcomponents/ShadowRoot'

// Export Browser APIs
export { Performance, Geolocation, Notification, EnhancedConsole, DataTransfer } from './apis/BrowserAPIs'
export { Navigator, Clipboard } from './apis/Clipboard'
export { VeryHappyFile as File, VeryHappyFileReader as FileReader, VeryHappyFileList as FileList } from './apis/FileAPI'

// Export utilities
export { parseHTML } from './parsers/html-parser'
export {
  querySelectorEngine,
  querySelectorAllEngine,
  matchesSimpleSelector,
  matchesPseudoClass,
  matchesAttributeSelector,
} from './selectors/engine'
