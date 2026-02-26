---
title: Browser Testing
description: Full browser testing using Chrome DevTools Protocol.
---

# Browser Testing

Besting supports full browser testing using Chrome DevTools Protocol (CDP) - no Playwright, no Puppeteer, just pure Bun.

## Overview

While besting's virtual DOM is perfect for most testing scenarios, sometimes you need a real browser. Besting provides CDP-based browser testing for these cases.

## Basic Browser Testing

```ts
import { browser, test } from 'besting'

test('test with real browser', async () => {
  const br = browser({ browser: 'chromium' })

  try {
    await br.launch()
    const page = await br.newPage()

    await page.goto('https://example.com')
    await page.assertSee('Example Domain')
    await page.assertTitle('Example Domain')
  }
  finally {
    await br.close()
  }
})
```

## Browser Configuration

```ts
import { browser, test } from 'besting'

test('configure browser', async () => {
  const br = browser({
    browser: 'chromium',  // 'chromium' or 'firefox'
    headless: true,       // Run without visible window
    width: 1920,          // Viewport width
    height: 1080,         // Viewport height
    timeout: 30000,       // Default timeout (ms)
    devtools: false,      // Open DevTools
  })

  try {
    await br.launch()
    const page = await br.newPage()
    await page.goto('https://example.com')
  }
  finally {
    await br.close()
  }
})
```

## Testing with Firefox

```ts
import { browser, test } from 'besting'

test('test with Firefox', async () => {
  const br = browser({ browser: 'firefox' })

  try {
    await br.launch()
    const page = await br.newPage()

    await page.goto('https://example.com')
    await page.assertSee('Example Domain')
  }
  finally {
    await br.close()
  }
})
```

## Cookie Management

```ts
import { browse, test } from 'besting'

test('manage cookies', async () => {
  await browse(async (page) => {
    await page.goto('https://example.com')

    // Set a cookie
    await page.setCookie('session', 'abc123', {
      domain: 'example.com',
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'Strict'
    })

    // Get all cookies
    const cookies = await page.getCookies()

    // Get specific cookie
    const sessionCookie = await page.getCookie('session')

    // Delete a cookie
    await page.deleteCookie('session')

    // Clear all cookies
    await page.clearCookies()
  })
})
```

## Dialog Handling

```ts
import { browse, test } from 'besting'

test('handle dialogs', async () => {
  await browse(async (page) => {
    await page.goto('https://example.com')

    // Set up dialog handler
    await page.onDialog(async (message) => {
      console.log('Dialog message:', message)

      // Return true to accept, false to dismiss
      if (message.includes('confirm')) {
        return true
      }

      // Return string for prompt dialogs
      if (message.includes('name')) {
        return 'John Doe'
      }

      return false
    })

    // Or accept/dismiss manually
    await page.acceptDialog()
    await page.dismissDialog()
  })
})
```

## File Uploads

```ts
import { browse, test } from 'besting'

test('upload files', async () => {
  await browse(async (page) => {
    await page.goto('https://example.com/upload')

    // Upload single file
    await page.uploadFile('input[type="file"]', '/path/to/file.pdf')

    // Upload multiple files
    await page.uploadFile(
      'input[type="file"][multiple]',
      '/path/to/file1.jpg',
      '/path/to/file2.jpg'
    )

    await page.click('button[type="submit"]')
  })
})
```

## Console Log Capture

```ts
import { browse, test } from 'besting'

test('capture console logs', async () => {
  await browse(async (page) => {
    // Start capturing console logs
    await page.startConsoleCapture()

    await page.goto('https://example.com')

    // Execute JavaScript that logs to console
    await page.evaluate(() => {
      console.log('Hello from the browser!')
      console.error('An error occurred')
    })

    // Get captured logs
    const logs = page.getConsoleLogs()
    // [
    //   { type: 'log', message: 'Hello!', timestamp: ... },
    //   { type: 'error', message: 'An error', timestamp: ... }
    // ]

    // Clear logs
    page.clearConsoleLogs()
  })
})
```

## PDF Generation

```ts
import { browse, test } from 'besting'

test('generate PDF', async () => {
  await browse(async (page) => {
    await page.goto('https://example.com')

    // Generate PDF with options
    await page.pdf({
      path: 'page.pdf',
      format: 'A4',
      printBackground: true,
      landscape: true,
      scale: 0.8,
      marginTop: 10,
      marginBottom: 10,
      marginLeft: 10,
      marginRight: 10
    })
  })
})
```

## Network Control

```ts
import { browse, test } from 'besting'

test('network control', async () => {
  await browse(async (page) => {
    // Set offline mode
    await page.setOffline(true)
    // page.goto will fail

    await page.setOffline(false)

    // Throttle network
    await page.setNetworkThrottle('slow3G')
    await page.goto('https://example.com')

    // Fast 3G
    await page.setNetworkThrottle('fast3G')

    // No throttling
    await page.setNetworkThrottle('none')

    // Intercept requests
    await page.interceptRequest('*.jpg', (request) => {
      console.log('Image request intercepted:', request.url)
    })
  })
})
```

## Mobile Emulation

```ts
import { browse, test } from 'besting'

test('mobile emulation', async () => {
  await browse(async (page) => {
    // Emulate different devices
    await page.emulateDevice('iPhone')
    await page.goto('https://example.com')

    await page.emulateDevice('iPad')
    await page.emulateDevice('Pixel')
    await page.emulateDevice('Galaxy')

    // Custom user agent
    await page.setUserAgent('Mozilla/5.0 (Custom) ...')

    // Set geolocation
    await page.setGeolocation(37.7749, -122.4194) // San Francisco

    // Enable touch emulation
    await page.setTouchEmulation(true)
  })
})
```

## Multiple Windows

```ts
import { browser, test } from 'besting'

test('work with multiple pages', async () => {
  const br = browser()

  try {
    await br.launch()

    // Create multiple pages
    const page1 = await br.newPage()
    const page2 = await br.newPage()

    // Navigate independently
    await page1.goto('https://example.com')
    await page2.goto('https://httpbin.org')

    // Interact with each page
    await page1.assertSee('Example Domain')
    await page2.assertSee('httpbin')
  }
  finally {
    await br.close()
  }
})
```

## When to Use Browser vs Virtual DOM

| Use Case | Recommended |
|----------|-------------|
| Unit testing components | Virtual DOM |
| Fast integration tests | Virtual DOM |
| Testing rendering behavior | Virtual DOM |
| Testing real network requests | Browser |
| Testing browser-specific APIs | Browser |
| End-to-end testing | Browser |
| Visual regression testing | Browser |
| Performance testing | Browser |

## Virtual DOM Benefits

- **Lightning fast** - No browser overhead
- **Zero setup** - No downloads required
- **Pure Bun** - No external dependencies
- **Faster than happy-dom** - Optimized performance

For most testing scenarios, the virtual DOM is recommended. Use real browser testing only when you need browser-specific features.

## Related

- [Getting Started](./getting-started.md) - Installation and setup
- [DOM Testing](./dom-testing.md) - Virtual DOM testing
- [Assertions](./assertions.md) - Assertion reference
