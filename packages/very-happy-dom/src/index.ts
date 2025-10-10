// Export types
export type { NodeType, VirtualNode, EventListenerOptions, EventListener, Location, History, HistoryState } from './nodes/VirtualNode'
export type { WindowOptions, IOptionalBrowserSettings, IBrowserSettings } from './window/Window'
export type { IBrowserPageViewport } from './browser/BrowserPage'
export type { ICookie } from './browser/CookieContainer'

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

// Export utilities
export { parseHTML } from './parsers/html-parser'
export {
  querySelectorEngine,
  querySelectorAllEngine,
  matchesSimpleSelector,
  matchesPseudoClass,
  matchesAttributeSelector,
} from './selectors/engine'
