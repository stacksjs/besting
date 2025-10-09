<p align="center"><img src=".github/art/cover.jpg" alt="Social Card of this repo"></p>

[![npm version][npm-version-src]][npm-version-href]
[![GitHub Actions][github-actions-src]][github-actions-href]
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
<!-- [![npm downloads][npm-downloads-src]][npm-downloads-href] -->
<!-- [![Codecov][codecov-src]][codecov-href] -->

# Besting

A Jest & Pest inspired testing framework for Bun with **zero external dependencies**. _UI coming soon!_

## Overview

Besting is a comprehensive testing framework built exclusively for Bun. It provides a fluent, Pest-like API for writing tests with **NO external dependencies** - everything runs on pure Bun primitives.

### 🚀 Key Features

- **Zero Dependencies** - Pure Bun implementation, no npm packages needed
- **Virtual DOM** - Lightning-fast DOM testing without downloading browsers (competing with happy-dom)
- **Optional Real Browsers** - Use real Chrome/Firefox when you need visual testing
- **Blazing Performance** - Optimized for Bun's runtime, faster than happy-dom
- **Laravel-Inspired** - Familiar API from Laravel's testing ecosystem

## Installation

```bash
bun add -d besting
```

## Features

- **Fluent, chainable assertions** - Make multiple assertions on the same value with a chainable API.
- **Pest-style syntax** - Use a similar style to PHP's Pest testing framework.
- **Zero overhead** - Built directly on Bun's native test runner for maximum performance.
- **Full compatibility** - Works with all of Bun's testing features including lifecycle hooks, snapshots, and more.
- **Browser Testing** - Laravel Dusk-inspired browser testing using Chrome DevTools Protocol (CDP). No Playwright, no Puppeteer - pure Bun!
- **API Testing** - Laravel-inspired API testing utilities for testing HTTP endpoints.
- **Database Testing** - Laravel-inspired database testing with migrations, seeders, and factories.
- **Authentication Testing** - Laravel-inspired authentication testing.
- **Event Testing** - Laravel-inspired event testing with event dispatching and assertions.
- **Command Testing** - Laravel-inspired command testing for terminal commands.
- **Cache Testing** - Utilities for testing cache operations.
- **Cookie Testing** - Utilities for testing cookies.
- **URL Testing** - Utilities for testing URL components.

## Basic Usage

```typescript
import { expect, test } from 'besting'

test('basic addition', () => {
  expect(1 + 1).toBe(2)
})
```

## Chainable Assertions

```typescript
import { expect, test } from 'besting'

test('multiple assertions on same value', () => {
  expect('Hello World')
    .toContain('Hello')
    .toContain('World')
    .toHaveLength(11)
    .toStartWith('Hello')
    .toEndWith('World')
})
```

## Pest-Style API

```typescript
import { best } from 'besting'

const p = best()

p.describe('Calculator', () => {
  p.test('addition works', () => {
    p.it(1 + 1).toBe(2)
  })

  p.test('subtraction works', () => {
    p.it(3 - 1).toBe(2)
  })
})
```

## Test Suites

```typescript
import { describe, expect, test } from 'besting'

describe('Math operations', () => {
  test('addition works', () => {
    expect(1 + 1).toBe(2)
  })

  test('subtraction works', () => {
    expect(3 - 1).toBe(2)
  })
})
```

## Lifecycle Hooks

```typescript
import { beforeEach, describe, expect, test } from 'besting'

describe('User', () => {
  let user

  beforeEach(() => {
    user = { name: 'John', email: 'john@example.com' }
  })

  test('has correct properties', () => {
    expect(user.name).toBe('John')
    expect(user.email).toBe('john@example.com')
  })
})
```

## Test Groups

```typescript
import { testGroup } from 'besting'

testGroup('Hello World', (str) => {
  // All assertions are against the string 'Hello World'
  str.toContain('Hello')
    .toContain('World')
    .toStartWith('Hello')
    .toEndWith('World')
    .not
    .toBeEmpty()
})
```

## Browser Testing

Besting offers **two modes** for browser testing - choose the right tool for the job:

### 🎯 Virtual DOM Mode (Default) - **ZERO Setup Required**

Uses our pure Bun virtual DOM implementation - **NO browser downloads needed**!

```typescript
import { browse, test } from 'besting'

test('test with virtual DOM', async () => {
  await browse(async (page) => {
    await page.goto('https://example.com')
    await page.assertSee('Example Domain')
    await page.click('#button')
    await page.fill('input[name="email"]', 'test@example.com')
  })
})
```

**Benefits:**

- ⚡ Lightning fast (no browser overhead)
- 🎯 Zero setup (no downloads)
- 💪 Pure Bun (no dependencies)
- 🏆 Faster than happy-dom

### 🌐 Real Browser Mode (Optional) - When You Need It

For visual testing, screenshots, PDFs, or cross-browser validation:

```typescript
import { browser, test } from 'besting'

test('test with real browser', async () => {
  const br = browser({ browser: 'chromium' }) // or 'firefox'

  try {
    await br.launch()
    const page = await br.newPage()

    await page.goto('https://example.com')
    await page.screenshot({ path: 'screenshot.png' })
  }
  finally {
    await br.close()
  }
})
```

**Use real browsers when you need:**

- Screenshots & PDFs
- Visual regression testing
- Cross-browser compatibility
- Browser-specific features

### Virtual DOM Setup

**No setup required!** Just import and use:

```typescript
import { browse } from 'besting'
```

### Real Browser Setup (Optional)

Only needed if you want to use real browsers:

```bash
# Install Chromium (optional)
besting setup-browser

# Install Firefox (optional)
besting setup-browser --browser firefox
```

### Basic Browser Testing

```typescript
import { browseTest, test } from 'besting'

test('visit a website', async () => {
  await browseTest(async (page) => {
    await page.goto('https://example.com')
    await page.assertSee('Example Domain')
    await page.assertTitle('Example Domain')
  })
})
```

### Browser API

```typescript
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

    // Take screenshots
    await page.screenshot({ path: 'screenshot.png' })
    await page.screenshot({ fullPage: true })
  }
  finally {
    await br.close()
  }
})
```

### Laravel Dusk-Style Assertions

```typescript
import { browseTest, test } from 'besting'

test('Dusk-style assertions', async () => {
  await browseTest(async (page) => {
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

### Form Testing

```typescript
import { browseTest, test } from 'besting'

test('fill and submit a form', async () => {
  await browseTest(async (page) => {
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

### Screenshots and Debugging

```typescript
import { browseTest, test } from 'besting'

test('take screenshots for debugging', async () => {
  await browseTest(async (page) => {
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

### Browser Configuration

```typescript
import { browser, test } from 'besting'

test('configure browser options', async () => {
  // Use Chromium (default)
  const chromiumBrowser = browser({
    browser: 'chromium', // Browser type: 'chromium' or 'firefox'
    headless: true, // Run in headless mode (default: true)
    width: 1920, // Viewport width (default: 1280)
    height: 1080, // Viewport height (default: 720)
    timeout: 30000, // Default timeout in ms (default: 30000)
    devtools: false, // Open DevTools (default: false)
  })

  // Use Firefox
  const firefoxBrowser = browser({
    browser: 'firefox',
    headless: true,
  })

  try {
    await chromiumBrowser.launch()
    const page = await chromiumBrowser.newPage()

    // You can also change viewport size after launch
    await page.setViewport(1024, 768)

    await page.goto('https://example.com')
  }
  finally {
    await chromiumBrowser.close()
  }
})
```

### Testing with Firefox

```typescript
import { browser, test } from 'besting'

test('test with Firefox', async () => {
  const br = browser({ browser: 'firefox' })

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

### Multiple Pages

```typescript
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

### Advanced Mouse Interactions

```typescript
import { browseTest, test } from 'besting'

test('mouse interactions', async () => {
  await browseTest(async (page) => {
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

### Cookie Management

```typescript
import { browseTest, test } from 'besting'

test('manage cookies', async () => {
  await browseTest(async (page) => {
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

### Local Storage & Session Storage

```typescript
import { browseTest, test } from 'besting'

test('storage operations', async () => {
  await browseTest(async (page) => {
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

### Scrolling

```typescript
import { browseTest, test } from 'besting'

test('scroll operations', async () => {
  await browseTest(async (page) => {
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

### Dialog Handling

```typescript
import { browseTest, test } from 'besting'

test('handle dialogs', async () => {
  await browseTest(async (page) => {
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

### File Uploads

```typescript
import { browseTest, test } from 'besting'

test('upload files', async () => {
  await browseTest(async (page) => {
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

### Console Log Capture

```typescript
import { browseTest, test } from 'besting'

test('capture console logs', async () => {
  await browseTest(async (page) => {
    // Start capturing console logs
    await page.startConsoleCapture()

    await page.goto('https://example.com')

    // Execute some JavaScript that logs to console
    await page.evaluate(() => {
      console.log('Hello from the browser!')
      console.error('An error occurred')
    })

    // Get captured logs
    const logs = page.getConsoleLogs()
    console.log(logs)
    // [
    //   { type: 'log', message: 'Hello from the browser!', timestamp: 1234567890 },
    //   { type: 'error', message: 'An error occurred', timestamp: 1234567891 }
    // ]

    // Clear logs
    page.clearConsoleLogs()
  })
})
```

### PDF Generation

```typescript
import { browseTest, test } from 'besting'

test('generate PDF', async () => {
  await browseTest(async (page) => {
    await page.goto('https://example.com')

    // Generate PDF
    await page.pdf({ path: 'page.pdf' })

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

### Network Control

```typescript
import { browseTest, test } from 'besting'

test('network control', async () => {
  await browseTest(async (page) => {
    // Set offline mode
    await page.setOffline(true)
    await page.goto('https://example.com') // Will fail

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

### Mobile Emulation

```typescript
import { browseTest, test } from 'besting'

test('mobile emulation', async () => {
  await browseTest(async (page) => {
    // Emulate iPhone
    await page.emulateDevice('iPhone')
    await page.goto('https://example.com')

    // Emulate iPad
    await page.emulateDevice('iPad')

    // Emulate Pixel
    await page.emulateDevice('Pixel')

    // Emulate Galaxy
    await page.emulateDevice('Galaxy')

    // Custom user agent
    await page.setUserAgent('Mozilla/5.0 (Custom Device) ...')

    // Set geolocation
    await page.setGeolocation(37.7749, -122.4194) // San Francisco

    // Enable touch emulation
    await page.setTouchEmulation(true)
  })
})
```

### CLI Commands

```bash
# Install Chromium for browser testing
besting setup-browser

# Install Firefox for browser testing
besting setup-browser --browser firefox

# Force reinstall
besting setup-browser --force
besting setup-browser --browser firefox --force

# Remove installed browsers
besting remove-browser
besting remove-browser --browser firefox
```

## API Testing

Besting includes Laravel-inspired API testing utilities for testing HTTP endpoints.

### Basic API Testing

```typescript
import { api, assertResponse, test } from 'besting'

test('Basic API test', async () => {
  // Make a GET request to an API
  const response = await api('https://api.example.com')
    .get('/users/1')

  // Assert on the response
  const assertion = await assertResponse(response).assertOk()
  await assertion.assertStatus(200)
  await assertion.assertHeader('content-type')

  // Get and assert on JSON data
  const data = await response.json()
  expect(data).toHaveProperty('id', 1)
})
```

### HTTP Methods

```typescript
import { api, assertResponse, test } from 'besting'

test('Testing different HTTP methods', async () => {
  const baseApi = api('https://api.example.com')

  // GET with query parameters
  const getResponse = await baseApi
    .withQuery({ filter: 'active' })
    .get('/users')

  // POST with JSON data
  const postResponse = await baseApi
    .post('/users', { name: 'John', email: 'john@example.com' })

  // PUT to update a resource
  const putResponse = await baseApi
    .put('/users/1', { name: 'Updated Name' })

  // DELETE a resource
  const deleteResponse = await baseApi
    .delete('/users/1')
})
```

### Authentication

```typescript
import { api, test } from 'besting'

test('Authenticated API requests', async () => {
  // Using Bearer token
  const tokenResponse = await api('https://api.example.com')
    .withToken('your-auth-token')
    .get('/secured-endpoint')

  // Using Basic Authentication
  const basicAuthResponse = await api('https://api.example.com')
    .withBasicAuth('username', 'password')
    .get('/secured-endpoint')
})
```

### JSON Assertions

```typescript
import { api, assertResponse, test } from 'besting'

test('Testing JSON responses', async () => {
  const response = await api('https://api.example.com')
    .get('/users/1')

  // Assert on specific JSON paths
  const assertion = await assertResponse(response)
  await assertion.assertJsonPath('name', 'John Doe')
  await assertion.assertJsonPath('email')
  await assertion.assertJsonPath('address.city', 'New York')

  // Assert on the entire JSON structure
  await assertion.assertJson({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  })
})
```

### Configuration

```typescript
import { api, test } from 'besting'

test('Configuring API requests', async () => {
  const response = await api('https://api.example.com')
    .withHeaders({
      'X-Custom-Header': 'Value',
      'Accept-Language': 'en-US'
    })
    .withTimeout(5000) // 5 seconds timeout
    .withJson() // Ensure JSON content type
    .get('/endpoint')
})
```

## Cache Testing

Besting includes utilities for testing cache operations, inspired by Laravel's cache assertions.

### Basic Cache Testing

```typescript
import { cache, test } from 'besting'

test('Basic cache operations', async () => {
  const cacheStore = cache()

  // Store a value in cache
  await cacheStore.set('user_id', 1)

  // Assert that the key exists
  await cacheStore.assertHas('user_id')

  // Get a value from cache
  const userId = await cacheStore.get('user_id')

  // Delete a key
  await cacheStore.delete('user_id')

  // Assert that the key is gone
  await cacheStore.assertMissing('user_id')
})
```

### Expiration Testing

```typescript
import { cache, test } from 'besting'

test('Cache expiration', async () => {
  const cacheStore = cache()

  // Set a value with a 1 second TTL
  await cacheStore.set('temp', 'value', 1)

  // Value should exist initially
  await cacheStore.assertExists('temp')

  // Wait for expiration
  await new Promise(resolve => setTimeout(resolve, 1100))

  // Value should be gone after TTL expires
  await cacheStore.assertNotExists('temp')
})
```

## Cookie Testing

Besting includes utilities for testing cookies, compatible with both browser and server environments.

### Basic Cookie Testing

```typescript
import { cookie, test } from 'besting'

test('Basic cookie operations', () => {
  const cookieJar = cookie()

  // Set cookies
  cookieJar
    .set('session_id', '123456789')
    .set('theme', 'dark')

  // Assert cookies exist
  cookieJar
    .assertHas('session_id')
    .assertHas('theme')

  // Assert cookie values
  cookieJar
    .assertValue('session_id', '123456789')
    .assertValue('theme', 'dark')

  // Remove a cookie
  cookieJar.remove('theme')

  // Assert cookie is gone
  cookieJar.assertMissing('theme')
})
```

## URL Testing

Besting includes utilities for testing URL components.

### Basic URL Testing

```typescript
import { test, url } from 'besting'

test('URL component testing', () => {
  const testUrl = url('https://example.com/users?sort=asc&page=1#profile')

  // Assert URL components
  testUrl
    .hasProtocol('https')
    .hasHost('example.com')
    .hasPath('/users')
    .hasQuery('sort', 'asc')
    .hasQuery('page', '1')
    .hasFragment('profile')

  // Check for absence of query parameters
  testUrl.doesntHaveQuery('filter')

  // Get URL components
  console.log(testUrl.path) // '/users'
  console.log(testUrl.queryParams) // { sort: 'asc', page: '1' }
})
```

## Special Matchers

Besting includes all matchers from Bun's test runner, plus additional Pest-inspired matchers:

- `toStartWith(prefix)` - Assert that a string starts with a prefix
- `toEndWith(suffix)` - Assert that a string ends with a suffix
- `toBeEmpty()` - Assert that a string, array, or object is empty
- `toPass(validator, message?)` - Assert that a value passes a custom validation function

## Testing

Besting uses Bun's native test runner, providing a seamless testing experience with all of Bun's built-in test features.

```bash
# Run all tests with Bun's standard test runner
bun test

# Run all tests with our custom runner (ensures all test files are executed)
bun run test:custom

# Run a specific test file
bun test path/to/test.ts

# Run tests with debugging enabled
bun run test:debug
```

Besting seamlessly integrates with Bun's test runner, allowing you to:

1. Use all of Bun's test features (snapshots, mocks, etc.)
2. Get beautifully formatted test output
3. Run tests in parallel for better performance

> **Note:** Bun's test runner may sometimes have issues discovering or executing all test files (see [Bun issue #3506](https://github.com/oven-sh/bun/issues/3506)). If you notice that some test files are not being executed, you can use our custom test runner with `bun run test:custom`, which ensures all test files are discovered and executed individually.

## Performance

Besting's virtual DOM is built to **outperform happy-dom** while maintaining zero dependencies.

### Run Benchmarks

```bash
# Run performance benchmarks (using mitata)
bun run bench

# Run bun:test benchmarks
bun run bench:bun
```

Our benchmarks test:

- **Document creation** - Fast initialization of virtual DOM documents
- **HTML parsing** - Parsing small, medium, and large HTML documents
- **Query selectors** - getElementById, querySelector, querySelectorAll by ID, class, tag, and attribute
- **DOM manipulation** - appendChild, removeChild, textContent operations
- **Attribute operations** - Getting and setting element attributes
- **ClassList operations** - Adding, removing, toggling CSS classes
- **innerHTML operations** - Setting and reading HTML content
- **Memory efficiency** - Large DOM tree creation and manipulation

### Benchmark Results

Running on Apple M3 Pro @ 3.5 GHz with Bun 1.2.24:

| Operation | Performance |
|-----------|------------|
| `createDocument()` | ~120 ns/iter |
| `createElement` | ~26 ns/iter |
| `querySelector by ID` | ~10 ns/iter |
| `querySelector by class` | ~11 ns/iter |
| `parse small HTML` | ~450 ns/iter |
| `parse medium HTML` | ~3.2 µs/iter |
| `appendChild (1000x)` | ~43 µs/iter |
| `setAttribute` | ~4.7 ns/iter |
| `classList.add` | ~436 ns/iter |
| `innerHTML set` | ~2.3 µs/iter |

**Result:** Blazing fast DOM operations with ZERO dependencies! 🚀

## Database Testing

Besting includes Laravel-inspired database testing utilities with migrations, seeders, and factories.

### Basic Database Testing

```typescript
import { db, migration, seeder, test } from 'besting'

// Define a migration
migration(async (connection) => {
  await connection.raw('CREATE TABLE users (id INT, name TEXT, email TEXT)')
})

// Define a seeder
seeder(async (connection) => {
  await connection.table('users').insert([
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' },
  ])
})

test('Basic database operations', async () => {
  const database = db().register(yourDatabaseConnection)

  // Run migrations and seeders
  await database.migrate()
  await database.seed()

  // Query data
  const users = await database.select('users')
  expect(users.length).toBe(2)

  // Insert data
  await database.insert('users', { id: 3, name: 'Alice', email: 'alice@example.com' })

  // Make assertions
  await database.assertExists('users', { id: 3 })
  await database.assertSame('users', { id: 3 }, { name: 'Alice' })
})
```

### Database Transactions

```typescript
import { db, test, useTransaction } from 'besting'

test('Database transactions', async () => {
  const database = db().register(yourDatabaseConnection)

  // Use transactions to isolate tests
  await database.beginTransaction()

  // Make changes
  await database.insert('users', { id: 3, name: 'Alice', email: 'alice@example.com' })

  // Rollback changes
  await database.rollbackTransaction()

  // Use the transaction helper
  const transactionTest = useTransaction(async (db) => {
    // This code runs within a transaction
    await db.insert('users', { id: 4, name: 'Bob', email: 'bob@example.com' })
  })

  await transactionTest()
})
```

### Database Factories

```typescript
import { db, test } from 'besting'

test('Database factories', async () => {
  const database = db().register(yourDatabaseConnection)

  // Create a user factory
  const userFactory = database.factory('users')
    .define({
      name: 'Default User',
      email: 'user@example.com',
    })
    .state('admin', user => ({
      ...user,
      name: 'Admin User',
      email: 'admin@example.com',
    }))

  // Create a default user
  await userFactory.create({ id: 10 })

  // Create an admin user
  await userFactory.has('admin').create({ id: 11 })

  // Create multiple users
  await userFactory.count(3).create()

  // Make model instances without persisting
  const user = userFactory.make()
})
```

## Event Testing

Besting includes Laravel-inspired event testing utilities for testing event dispatching.

### Basic Event Testing

```typescript
import { defineEvent, events, fakeEvents, test } from 'besting'

// Define event classes
class UserCreated {
  constructor(public id: number, public name: string) {}
}

// Define an event using the helper
const OrderShipped = defineEvent({
  id: 0,
  trackingNumber: '',
})

test('Basic event testing', () => {
  const fake = fakeEvents()

  // Dispatch events
  events().dispatch(new UserCreated(1, 'John'))
  events().dispatch(new UserCreated(2, 'Jane'))

  // Make assertions
  fake.assertDispatched('UserCreated')
  fake.assertDispatchedTimes('UserCreated', 2)
  fake.assertNotDispatched('OrderShipped')

  // Check specific events
  fake.assertDispatched('UserCreated', event => event.id === 1)
})
```

### Event Listeners

```typescript
import { events, listener, test } from 'besting'

class UserCreated {
  constructor(public id: number, public name: string) {}
}

class EventListener {
  events: any[] = []

  @listener(UserCreated.name)
  handleUserCreated(event: UserCreated) {
    this.events.push(event)
  }
}

test('Event listeners', () => {
  const listener = new EventListener()

  // Dispatch an event
  events().dispatch(new UserCreated(1, 'John'))

  // Check that the listener received it
  expect(listener.events.length).toBe(1)
  expect(listener.events[0].name).toBe('John')
})
```

## Authentication Testing

Besting includes Laravel-inspired authentication testing utilities.

### Basic Authentication Testing

```typescript
import { auth, test } from 'besting'

test('Authentication testing', () => {
  // Define a user
  const user = {
    id: 1,
    name: 'Test User',
    email: 'user@example.com',
  }

  // Set the authenticated user
  auth().actingAs(user)

  // Make assertions
  auth().assertAuthenticated()
  expect(auth().user().id).toBe(1)

  // Act as guest
  auth().actingAsGuest()
  auth().assertGuest()
})
```

### With Auth Helper

```typescript
import { auth, test, withAuth } from 'besting'

test('With auth helper', () => {
  const user = {
    id: 1,
    name: 'Test User',
    email: 'user@example.com',
  }

  // Create request with auth context
  const request = withAuth(user)

  expect(request.user).toBe(user)
  expect(request.auth.check()).toBe(true)
})
```

## Command Testing

Besting includes utilities for testing terminal commands, including Laravel-inspired Artisan command testing.

### Basic Command Testing

```typescript
import { command, test } from 'besting'

test('Command testing', async () => {
  const cmd = command()

  // Execute a command
  const result = await cmd.execute('echo', ['Hello, World!'])

  // Make assertions
  cmd
    .assertExitCode(0)
    .assertOutputContains('Hello')
    .assertOutputNotContains('error')
})
```

## Testing

```bash
bun test
```

## Changelog

Please see our [releases](https://github.com/stackjs/besting/releases) page for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discussions on GitHub](https://github.com/stacksjs/besting/discussions)

For casual chit-chat with others using this package:

[Join the Stacks Discord Server](https://discord.gg/stacksjs)

## Postcardware

"Software that is free, but hopes for a postcard." We love receiving postcards from around the world showing where Stacks is being used! We showcase them on our website too.

Our address: Stacks.js, 12665 Village Ln #2306, Playa Vista, CA 90094, United States 🌎

## Sponsors

We would like to extend our thanks to the following sponsors for funding Stacks development. If you are interested in becoming a sponsor, please reach out to us.

- [JetBrains](https://www.jetbrains.com/)
- [The Solana Foundation](https://solana.com/)

## License

The MIT License (MIT). Please see [LICENSE](LICENSE.md) for more information.

Made with 💙

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/besting?style=flat-square
[npm-version-href]: https://npmjs.com/package/besting
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/stacksjs/besting/ci.yml?style=flat-square&branch=main
[github-actions-href]: https://github.com/stacksjs/besting/actions?query=workflow%3Aci

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/stacksjs/besting/main?style=flat-square
[codecov-href]: https://codecov.io/gh/stacksjs/besting -->
