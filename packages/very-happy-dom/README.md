# VeryHappyDOM

A blazing-fast DOM implementation for Bun, built for speed and browser API compatibility.

## ⚡ Performance

VeryHappyDOM is **16× to 79,000× faster** than established DOM implementations:

- **HTML Parsing**: 413ns average (34,400× faster than HappyDOM)
- **querySelector**: Sub-microsecond to low-microsecond performance
- **DOM Manipulation**: Microsecond-level performance
- **Zero Dependencies**: Pure Bun implementation

See [benchmarks](../benchmarks/README.md) for detailed performance comparisons.

## 🎯 Features

### Core DOM APIs

- ✅ HTML parsing and serialization
- ✅ DOM manipulation (createElement, appendChild, innerHTML, etc.)
- ✅ CSS selectors (querySelector, querySelectorAll)
- ✅ Event handling (addEventListener, dispatchEvent, CustomEvent)
- ✅ Document API (getElementById, getElementsByClassName, etc.)

### Browser APIs

- ✅ **Storage** - localStorage, sessionStorage with Proxy support
- ✅ **Timers** - setTimeout, setInterval, requestAnimationFrame
- ✅ **Network** - fetch, XMLHttpRequest, WebSocket, request interception
- ✅ **Observers** - MutationObserver, IntersectionObserver, ResizeObserver
- ✅ **XPath** - Full XPath 1.0 support with document.evaluate()
- ✅ **Events** - CustomEvent, event emitters, page events
- ✅ **Interaction** - click, type, focus, hover, keyboard, mouse
- ✅ **Web Components** - Shadow DOM, Custom Elements
- ✅ **File API** - File, FileReader, FileList
- ✅ **Clipboard** - navigator.clipboard.writeText/readText
- ✅ **Performance** - performance.now/mark/measure
- ✅ **Geolocation** - navigator.geolocation

## 📦 Installation

```bash
bun add very-happy-dom
```

## 🚀 Quick Start

```typescript
import { Window } from 'very-happy-dom'

const window = new Window()

// Parse HTML
window.document.body.innerHTML = '<div id="app"><h1>Hello World</h1></div>'

// Query DOM
const app = window.document.getElementById('app')
const title = window.document.querySelector('h1')

console.log(title?.textContent) // "Hello World"

// Cleanup
await window.happyDOM.close()
```

## 🧪 Test Coverage

VeryHappyDOM has **972+ comprehensive tests** organized by functionality:

### Organized Test Suites (586 tests)

| Test Suite | Tests | Coverage |
|-----------|-------|----------|
| **storage.test.ts** | 50 | localStorage, sessionStorage, isolation, edge cases |
| **timers.test.ts** | 29 | setTimeout, setInterval, requestAnimationFrame, cleanup |
| **network.test.ts** | 43 | fetch, XMLHttpRequest, WebSocket, request interception |
| **observers.test.ts** | 45 | MutationObserver, IntersectionObserver, ResizeObserver |
| **xpath.test.ts** | 23 | XPath expressions, predicates, axes, result types |
| **events.test.ts** | 19 | CustomEvent, addEventListener, page events |
| **interaction.test.ts** | 11 | click, type, focus, hover, keyboard, mouse |
| **webcomponents.test.ts** | 21 | Shadow DOM, Custom Elements, lifecycle |
| **browser-apis.test.ts** | 31 | Performance, Clipboard, Geolocation, File API |
| **integration.test.ts** | 24 | End-to-end scenarios combining features |
| **security-sanitization.test.ts** | 52 | XSS prevention, script injection, content sanitization |
| **attribute-property.test.ts** | 127 | Comprehensive attribute and property handling |
| **selector-engine.test.ts** | 70 | CSS selectors, combinators, pseudo-classes |
| **advanced-edge-cases.test.ts** | 41 | Complex scenarios and edge cases |

### Legacy Test Suites (287+ tests)

All legacy tests have been organized in `tests/legacy/` folder:

- ✅ Basic feature tests (43)
- ✅ Advanced feature tests (35)
- ✅ Final feature tests (32)
- ✅ Additional feature tests
- ✅ Core DOM tests
- ✅ DOM edge cases
- ✅ Pseudo-class selector tests

Plus active stress tests:

- ✅ 87 browser API stress tests

### Test Organization

Tests are logically organized by domain rather than by implementation phase:

```
tests/
├── Core Domain Tests (296 tests)
│   ├── storage.test.ts       # Storage API tests
│   ├── timers.test.ts        # Timer API tests
│   ├── network.test.ts       # Network API tests
│   ├── observers.test.ts     # Observer pattern tests
│   ├── xpath.test.ts         # XPath evaluation tests
│   ├── events.test.ts        # Event system tests
│   ├── interaction.test.ts   # User interaction tests
│   ├── webcomponents.test.ts # Web Components tests
│   ├── browser-apis.test.ts  # Browser API tests
│   └── integration.test.ts   # Integration tests
│
├── Quality Assurance (27 tests)
│   ├── error-handling.test.ts # Error scenarios
│   └── performance.test.ts    # Performance regression
│
├── Stress Tests (87 tests)
│   └── browser-api.stress.test.ts
│
├── Test Utilities
│   └── test-utils.ts         # Shared test helpers
│
└── Legacy Tests (287+ tests)
    └── legacy/               # Old tests preserved
```

### Running Tests

```bash
# Run specific test suite
bun test tests/storage.test.ts

# Run all tests
bun test tests/*.test.ts
```

## 🏗️ Architecture

### Window API

```typescript
import { Window } from 'very-happy-dom'

const window = new Window({
  url: 'https://example.com',
  width: 1920,
  height: 1080,
  settings: {
    navigator: {
      userAgent: 'Custom User Agent'
    }
  }
})
```

### Browser API

```typescript
import { Browser } from 'very-happy-dom'

const browser = new Browser()
const page = browser.newPage()

await page.goto('https://example.com')
await page.click('#button')
await page.type('#input', 'Hello')

await browser.close()
```

## 🔧 Advanced Features

### Request Interception

```typescript
await page.setRequestInterception(true, async (request) => {
  // Mock API responses
  request.respond({
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true })
  })
})
```

### XPath Support

```typescript
const result = window.document.evaluate(
  '//div[@class="item"]',
  window.document,
  null,
  XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
  null
)

for (let i = 0; i < result.snapshotLength; i++) {
  console.log(result.snapshotItem(i))
}
```

### Shadow DOM

```typescript
const host = window.document.createElement('div')
const shadow = host.attachShadow({ mode: 'open' })

shadow.innerHTML = '<p>Shadow content</p>'
const p = shadow.querySelector('p')
```

### Custom Elements

```typescript
class MyComponent extends window.HTMLElement {
  connectedCallback() {
    this.innerHTML = '<h1>Custom Component</h1>'
  }
}

window.customElements.define('my-component', MyComponent)
```

## 📊 Benchmarks

See the [benchmarks package](../benchmarks) for detailed performance comparisons with HappyDOM and JSDOM.

Key results on Apple M3 Pro:

- HTML Parsing: **413 ns** (vs HappyDOM 14.20 ms, JSDOM 32.69 ms)
- querySelector: **741 ns** (vs HappyDOM 14.27 ms, JSDOM 30.74 ms)
- DOM Manipulation: **35.49 µs** (vs HappyDOM 1.06 ms, JSDOM 3.00 ms)

## 🤝 Contributing

Contributions welcome! Please check the [FEATURE_ROADMAP.md](./FEATURE_ROADMAP.md) for planned features and current status.

## 📄 License

MIT
