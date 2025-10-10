# Browser API

VeryHappyDOM now includes a Browser API compatible with Happy DOM's Browser, BrowserContext, BrowserPage, and BrowserFrame APIs.

## Quick Start

### Browser

```typescript
import { Browser } from 'very-happy-dom'

const browser = new Browser()
const page = browser.newPage()

page.url = 'https://example.com'
page.content = '<html><body>Hello world!</body></html>'

console.log(page.mainFrame.document.body.textContent) // "Hello world!"

await browser.close()
```

### Window

```typescript
import { Window } from 'very-happy-dom'

const window = new Window({
  url: 'https://localhost:8080',
  width: 1920,
  height: 1080,
  settings: {
    navigator: {
      userAgent: 'Mozilla/5.0 (X11; Linux x64) VeryHappyDOM/1.0.0'
    }
  }
})

window.document.body.innerHTML = '<div class="container"><button>Click me</button></div>'

const container = window.document.querySelector('.container')
console.log(container) // VirtualElement { tagName: 'DIV', ... }

await window.happyDOM.close()
```

### GlobalWindow

```typescript
import { GlobalWindow } from 'very-happy-dom'

const window = new GlobalWindow()

window.document.write(`
  <html>
    <body>
      <div id="test">Global test</div>
    </body>
  </html>
`)

const testDiv = window.document.querySelector('#test')
console.log(testDiv.textContent) // "Global test"

await window.happyDOM.close()
```

## API Reference

### Browser

Represents a browser instance with contexts and pages.

**Constructor:**
```typescript
new Browser(options?: {
  settings?: IOptionalBrowserSettings
  console?: Console
})
```

**Properties:**
- `contexts: BrowserContext[]` - All browser contexts
- `defaultContext: BrowserContext` - The default context
- `settings: IBrowserSettings` - Browser settings (modifiable at runtime)
- `console: Console` - Console instance

**Methods:**
- `newPage(): BrowserPage` - Creates a new page in the default context
- `newIncognitoContext(): BrowserContext` - Creates a new incognito context
- `close(): Promise<void>` - Closes the browser and all contexts
- `waitUntilComplete(): Promise<void>` - Waits for all operations to complete
- `abort(): Promise<void>` - Aborts all ongoing operations

### BrowserContext

Represents a context where data (cookies, cache) is shared between pages.

**Properties:**
- `pages: BrowserPage[]` - Pages in this context
- `browser: Browser` - Owner browser
- `cookieContainer: CookieContainer` - Cookie storage
- `responseCache: Map<string, Response>` - Response cache
- `preflightResponseCache: Map<string, Response>` - Preflight response cache

**Methods:**
- `newPage(): BrowserPage` - Creates a new page
- `close(): Promise<void>` - Closes the context and all pages
- `waitUntilComplete(): Promise<void>` - Waits for all operations to complete
- `abort(): Promise<void>` - Aborts all ongoing operations

### BrowserPage

Represents a browser page (tab or popup).

**Properties:**
- `mainFrame: BrowserFrame` - Main frame
- `frames: BrowserFrame[]` - All frames
- `context: BrowserContext` - Owner context
- `console: Console` - Console instance
- `viewport: IBrowserPageViewport` - Viewport settings
- `content: string` - Page HTML content (get/set)
- `url: string` - Page URL (get/set)

**Methods:**
- `goto(url: string): Promise<Response | null>` - Navigate to URL
- `evaluate(code: string | Function): any` - Execute code in page context
- `setViewport(viewport: IBrowserPageViewport): void` - Set viewport size
- `close(): Promise<void>` - Close the page
- `waitUntilComplete(): Promise<void>` - Wait for operations to complete
- `waitForNavigation(): Promise<void>` - Wait for navigation to complete
- `abort(): Promise<void>` - Abort all operations

### BrowserFrame

Represents a browser frame.

**Properties:**
- `window: Window` - Window instance
- `document: VirtualDocument` - Document instance
- `page: BrowserPage` - Owner page
- `parentFrame: BrowserFrame | null` - Parent frame
- `childFrames: BrowserFrame[]` - Child frames
- `content: string` - Frame HTML content (get/set)
- `url: string` - Frame URL (get/set)

**Methods:**
- `goto(url: string): Promise<Response | null>` - Navigate frame
- `evaluate(code: string | Function): any` - Execute code in frame context
- `goBack(): Promise<Response | null>` - Navigate back in history
- `goForward(): Promise<Response | null>` - Navigate forward in history
- `goSteps(steps: number): Promise<Response | null>` - Navigate by steps
- `reload(): Promise<Response | null>` - Reload the frame
- `waitUntilComplete(): Promise<void>` - Wait for operations to complete
- `waitForNavigation(): Promise<void>` - Wait for navigation to complete
- `abort(): Promise<void>` - Abort all operations

### Window

Standalone window instance.

**Constructor:**
```typescript
new Window(options?: {
  url?: string            // Default: 'about:blank'
  width?: number          // Default: 1024
  height?: number         // Default: 768
  console?: Console
  settings?: IOptionalBrowserSettings
})
```

**Properties:**
- `document: VirtualDocument` - Document instance
- `happyDOM: DetachedWindowAPI` - API for window management
- `console: Console` - Console instance
- `location: Location` - Location object
- `settings: IBrowserSettings` - Browser settings
- `innerWidth: number` - Inner width
- `innerHeight: number` - Inner height

### DetachedWindowAPI

API for managing a detached Window instance.

**Properties:**
- `settings: IBrowserSettings` - Browser settings (modifiable)

**Methods:**
- `close(): Promise<void>` - Close the window
- `waitUntilComplete(): Promise<void>` - Wait for all operations to complete
- `abort(): Promise<void>` - Abort all operations
- `setURL(url: string): void` - Set URL without navigating
- `setViewport(options: { width?: number, height?: number }): void` - Set viewport size

### CookieContainer

Cookie storage for a BrowserContext.

**Methods:**
- `addCookies(cookies: ICookie[]): void` - Add cookies
- `getCookies(url: string, includeHttpOnly?: boolean): ICookie[]` - Get cookies for URL
- `clearCookies(): void` - Clear all cookies

**Cookie Interface:**
```typescript
interface ICookie {
  key: string
  value?: string
  originURL: string
  domain?: string
  path?: string
  expires?: Date
  httpOnly?: boolean
  secure?: boolean
  sameSite?: CookieSameSiteEnum
}

enum CookieSameSiteEnum {
  none = 'None',
  lax = 'Lax',
  strict = 'Strict'
}
```

## Examples

### Cookie Management

```typescript
import { Browser, CookieSameSiteEnum } from 'very-happy-dom'

const browser = new Browser()

browser.defaultContext.cookieContainer.addCookies([
  {
    key: "session",
    value: "abc123",
    originURL: "https://example.com",
    domain: "example.com",
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: CookieSameSiteEnum.strict
  }
])

const cookies = browser.defaultContext.cookieContainer.getCookies(
  "https://example.com/",
  true // include HttpOnly cookies
)

console.log(cookies) // [{ key: "session", value: "abc123", ... }]

await browser.close()
```

### Multiple Pages

```typescript
import { Browser } from 'very-happy-dom'

const browser = new Browser()

const page1 = browser.newPage()
const page2 = browser.newPage()

page1.content = '<body>Page 1</body>'
page2.content = '<body>Page 2</body>'

console.log(browser.defaultContext.pages.length) // 2

await browser.close()
```

### Incognito Context

```typescript
import { Browser } from 'very-happy-dom'

const browser = new Browser()
const incognitoContext = browser.newIncognitoContext()
const incognitoPage = incognitoContext.newPage()

incognitoPage.content = '<body>Private browsing</body>'

// Incognito context has separate cookie storage
incognitoContext.cookieContainer.addCookies([...])

await browser.close() // Closes all contexts and pages
```

### Runtime Settings

```typescript
import { Browser } from 'very-happy-dom'

const browser = new Browser()

// Modify settings at runtime
browser.settings.navigator.userAgent = 'Custom User Agent'
browser.settings.device.prefersColorScheme = 'dark'

const page = browser.newPage()
// Page will use the modified settings

await browser.close()
```

## Compatibility with Happy DOM

The VeryHappyDOM Browser API is designed to be compatible with Happy DOM's Browser API. Most Happy DOM examples should work with minimal changes:

```typescript
// Happy DOM
import { Browser } from 'happy-dom'

// VeryHappyDOM - same API!
import { Browser } from 'very-happy-dom'
```

## Differences from Happy DOM

1. **Performance**: VeryHappyDOM is optimized for Bun and is significantly faster
2. **Navigation**: Currently, `goto()`, `goBack()`, `goForward()` are stubs (no actual HTTP requests)
3. **Evaluation**: `evaluate()` uses simple eval instead of VM contexts
4. **Virtual Console**: Not yet implemented (uses global console)

## Next Steps

- Implement actual HTTP navigation with `fetch()`
- Add VM context isolation for `evaluate()`
- Implement VirtualConsolePrinter
- Add support for custom elements
- Add more comprehensive event handling
