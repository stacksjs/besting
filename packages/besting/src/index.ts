export * from './api'
export * from './auth'
// Export Browser from ./browser (gives precedence over very-happy-dom's Browser)
export { browser, type Browser, type BrowserOptions, type BrowserType, type ElementHandle, type Page, type PageScreenshotOptions } from './browser'
export * from './cache'
export * from './command'
export * from './config'
export * from './cookie'
export * from './database'
export * from './event'
export * from './test'
export * from './types'
export * from './url'
export * from './virtual-page'

export * from 'very-happy-dom'

// Note: Import test utilities directly from 'bun:test' in your test files
// export { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, mock, spyOn, test } from 'bun:test'
