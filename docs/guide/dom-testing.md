---
title: DOM Testing
description: Virtual DOM testing with besting's zero-dependency DOM implementation.
---
test('visit a website', async () => {
  await browse(async (page) => {
    await page.goto('https://example.com')
    await page.assertSee('Example Domain')
    await page.assertTitle('Example Domain')
  })
})

```

## Browser API

For full browser control:

```ts

import { browser, test } from 'besting'

test('full browser control', async () => {
  const br = browser({ headless: true })

  try {
    await br.launch()
    const page = await br.newPage()

    // Navigate
    await page.goto('https://example.com')

    // Interact with elements
    await page.click('button')
    await page.type('input[name="search"]', 'Hello')
    await page.fill('input[name="email"]', 'test@example.com')

    // Select from dropdown
    await page.select('select[name="country"]', 'US')

    // Handle checkboxes
    await page.check('input[type="checkbox"]')
    await page.uncheck('input[type="checkbox"]')

    // Wait for elements
    await page.waitForSelector('.result')
    await page.waitForText('Success')

    // Get element information
    const text = await page.text('h1')
    const value = await page.value('input')
    const isVisible = await page.isVisible('.modal')

    // Execute JavaScript
    const result = await page.evaluate(() => {
      return document.title
    })
  }
  finally {
    await br.close()
  }
})

```

## Laravel Dusk-Style Assertions

Besting provides familiar assertions inspired by Laravel Dusk:

```ts

import { browse, test } from 'besting'

test('Dusk-style assertions', async () => {
  await browse(async (page) => {
    await page.goto('https://example.com')

    // Text assertions
    await page.assertSee('Welcome')
    await page.assertDontSee('Error')
    await page.assertSeeIn('.header', 'Logo')

    // Element assertions
    await page.assertPresent('button')
    await page.assertMissing('.error-message')
    await page.assertVisible('.modal')
    await page.assertNotVisible('.hidden')

    // Form assertions
    await page.assertValue('input[name="email"]', 'test@example.com')
    await page.assertChecked('input[name="terms"]')
    await page.assertNotChecked('input[name="newsletter"]')
    await page.assertEnabled('button[type="submit"]')
    await page.assertDisabled('button[type="submit"]')

    // Attribute assertions
    await page.assertAttribute('a', 'href', 'https://example.com')
    await page.assertHasClass('.button', 'btn-primary')
    await page.assertHasNotClass('.button', 'disabled')

    // Page assertions
    await page.assertTitle('Example Domain')
    await page.assertTitleContains('Example')
    await page.assertUrlIs('https://example.com/')
    await page.assertUrlContains('example')
  })
})

```

## Form Testing

```ts

import { browse, test } from 'besting'

test('fill and submit a form', async () => {
  await browse(async (page) => {
    await page.goto('https://myapp.com/contact')

    // Fill form fields
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="email"]', 'john@example.com')
    await page.fill('textarea[name="message"]', 'Hello!')

    // Select from dropdown
    await page.select('select[name="subject"]', 'inquiry')

    // Check agreement
    await page.check('input[name="agree"]')

    // Submit form
    await page.click('button[type="submit"]')

    // Assert success
    await page.waitForText('Thank you')
    await page.assertSee('Your message has been sent')
  })
})

```

## Mouse Interactions

```ts

import { browse, test } from 'besting'

test('mouse interactions', async () => {
  await browse(async (page) => {
    await page.goto('https://example.com')

    // Hover over an element
    await page.hover('.menu-item')

    // Double click
    await page.doubleClick('.selectable-text')

    // Right click
    await page.rightClick('.context-menu-trigger')

    // Drag and drop
    await page.drag('.draggable', '.drop-zone')
  })
})

```

## Scrolling

```ts

import { browse, test } from 'besting'

test('scroll operations', async () => {
  await browse(async (page) => {
    await page.goto('https://example.com')

    // Scroll to specific coordinates
    await page.scrollTo(0, 500)

    // Scroll to an element
    await page.scrollToElement('#footer')

    // Scroll to top
    await page.scrollToTop()

    // Scroll to bottom
    await page.scrollToBottom()
  })
})

```

## Screenshots

```ts

import { browse, test } from 'besting'

test('take screenshots', async () => {
  await browse(async (page) => {
    await page.goto('https://example.com')

    // Take a regular screenshot
    const screenshot = await page.screenshot()

    // Save screenshot to file
    await page.screenshot({ path: 'example.png' })

    // Take full page screenshot
    await page.screenshot({
      path: 'full-page.png',
      fullPage: true
    })

    // Take JPEG screenshot with quality
    await page.screenshot({
      path: 'example.jpg',
      type: 'jpeg',
      quality: 80
    })
  })
})

```

## Storage Operations

### Local Storage & Session Storage

```ts

import { browse, test } from 'besting'

test('storage operations', async () => {
  await browse(async (page) => {
    await page.goto('https://example.com')

    // Local Storage
    await page.setLocalStorage('theme', 'dark')
    const theme = await page.getLocalStorage('theme')
    await page.removeLocalStorage('theme')
    await page.clearLocalStorage()

    // Session Storage
    await page.setSessionStorage('tab', 'home')
    const tab = await page.getSessionStorage('tab')
    await page.removeSessionStorage('tab')
    await page.clearSessionStorage()
  })
})

```

## Browser Configuration

```ts

import { browser, test } from 'besting'

test('configure browser options', async () => {
  const chromiumBrowser = browser({
    browser: 'chromium',    // Browser type
    headless: true,         // Run in headless mode
    width: 1920,            // Viewport width
    height: 1080,           // Viewport height
    timeout: 30000,         // Default timeout in ms
    devtools: false,        // Open DevTools
  })

  try {
    await chromiumBrowser.launch()
    const page = await chromiumBrowser.newPage()

    // Change viewport size after launch
    await page.setViewport(1024, 768)

    await page.goto('https://example.com')
  }
  finally {
    await chromiumBrowser.close()
  }
})

```

## Multiple Pages

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

## Performance Benchmarks

Running on Apple M3 Pro @ 3.5 GHz with Bun 1.2.24:

| Operation | Performance |
|-----------|------------|
| `createDocument()` | ~120 ns/iter |
| `createElement` | ~26 ns/iter |
| `querySelector by ID` | ~10 ns/iter |
| `querySelector by class` | ~11 ns/iter |
| `parse small HTML` | ~450 ns/iter |
| `parse medium HTML` | ~3.2 us/iter |
| `appendChild (1000x)` | ~43 us/iter |

## Related

- [Getting Started](./getting-started.md) - Installation and setup
- [Browser Testing](./browser-testing.md) - Full browser testing with CDP
- [Assertions](./assertions.md) - Assertion reference
