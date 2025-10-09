// Export types
export type { NodeType, VirtualNode, EventListenerOptions, EventListener, Location, History, HistoryState } from './nodes/VirtualNode'

// Export classes
export { VirtualElement } from './nodes/VirtualElement'
export { VirtualTextNode } from './nodes/VirtualTextNode'
export { VirtualCommentNode } from './nodes/VirtualCommentNode'
export { VirtualDocument, createDocument } from './nodes/VirtualDocument'
export { VirtualEvent } from './events/VirtualEvent'

// Export utilities
export { parseHTML } from './parsers/html-parser'
export {
  querySelectorEngine,
  querySelectorAllEngine,
  matchesSimpleSelector,
  matchesPseudoClass,
  matchesAttributeSelector,
} from './selectors/engine'
