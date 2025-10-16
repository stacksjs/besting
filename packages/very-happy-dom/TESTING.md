# Testing Guide

## 📋 Test Organization

VeryHappyDOM uses a **domain-driven test organization** where tests are grouped by functionality rather than by implementation phase. This makes tests easier to find, maintain, and extend.

## 🗂️ Test Structure

### Current Test Suites (493+ tests)

#### Organized by Domain (296 tests)

```
tests/
├── storage.test.ts       # 50 tests - Storage API
├── timers.test.ts        # 29 tests - Timer APIs
├── network.test.ts       # 43 tests - Network APIs
├── observers.test.ts     # 45 tests - Observer patterns
├── xpath.test.ts         # 23 tests - XPath support
├── events.test.ts        # 19 tests - Event system
├── interaction.test.ts   # 11 tests - User interactions
├── webcomponents.test.ts # 21 tests - Web Components
├── browser-apis.test.ts  # 31 tests - Browser APIs
└── integration.test.ts   # 24 tests - Integration scenarios
```

#### Legacy Tests (287 tests)

All legacy tests have been moved to `tests/legacy/` for organization:

```
tests/legacy/
├── new-features.test.ts          # 43 tests - Basic features
├── advanced-features.test.ts     # 35 tests - Advanced features
├── final-features.test.ts        # 32 tests - Final features
├── all-new-features.test.ts      # Additional feature tests
├── dom.test.ts                   # Core DOM tests
├── dom-edge-cases.test.ts        # DOM edge cases
└── pseudo-class-selectors.test.ts # Pseudo-class tests
```

Active stress test:
```
tests/
└── browser-api.stress.test.ts    # 87 tests - Stress tests
```

## 🎯 Test Coverage by Domain

### 1. Storage Tests (`storage.test.ts`)
**50 tests covering:**
- localStorage basic operations (setItem, getItem, removeItem, clear)
- sessionStorage operations
- Bracket notation access
- Storage isolation between windows
- Special characters and edge cases
- JSON serialization

**Example:**
```typescript
const window = new Window()
window.localStorage.setItem('key', 'value')
assert(window.localStorage.getItem('key') === 'value')
```

### 2. Timer Tests (`timers.test.ts`)
**29 tests covering:**
- setTimeout/clearTimeout
- setInterval/clearInterval
- requestAnimationFrame/cancelAnimationFrame
- Timer cleanup on window close
- waitUntilComplete integration
- Nested timers

**Example:**
```typescript
const window = new Window()
window.setTimeout(() => {
  console.log('Timer executed')
}, 0)
await window.happyDOM.waitUntilComplete()
```

### 3. Network Tests (`network.test.ts`)
**43 tests covering:**
- Fetch API (Request, Response, Headers)
- XMLHttpRequest lifecycle
- WebSocket API
- Request interception (continue, abort, respond)
- FormData, URLSearchParams
- Network mocking

**Example:**
```typescript
await page.setRequestInterception(true, async (request) => {
  request.respond({
    status: 200,
    body: JSON.stringify({ success: true })
  })
})
```

### 4. Observer Tests (`observers.test.ts`)
**45 tests covering:**
- MutationObserver (childList, attributes, takeRecords)
- IntersectionObserver (observe, unobserve, thresholds)
- ResizeObserver (resize detection, multiple elements)
- Observer cleanup and disconnection

**Example:**
```typescript
const observer = new window.MutationObserver((mutations) => {
  console.log('DOM mutated:', mutations)
})
observer.observe(element, { childList: true, attributes: true })
```

### 5. XPath Tests (`xpath.test.ts`)
**23 tests covering:**
- document.evaluate() API
- XPath expressions (//tag, @attr, predicates)
- Result types (snapshot, iterator, single node)
- Axes (descendant, parent, child)
- XPath functions (count, text, last)

**Example:**
```typescript
const result = window.document.evaluate(
  '//div[@class="foo"]',
  window.document,
  null,
  7, // ORDERED_NODE_SNAPSHOT_TYPE
  null
)
```

### 6. Event Tests (`events.test.ts`)
**19 tests covering:**
- CustomEvent with detail
- addEventListener/removeEventListener
- Event bubbling and cancelable
- Event once and capture options
- Page event emitters (console, error, request)

**Example:**
```typescript
element.addEventListener('click', () => {
  console.log('Clicked!')
}, { once: true })
```

### 7. Interaction Tests (`interaction.test.ts`)
**11 tests covering:**
- Page interactions (click, type, focus, hover)
- Keyboard API (keyboard.press)
- Mouse API (mouse.click, mouse.move)
- Drag and drop

**Example:**
```typescript
await page.click('#button')
await page.type('#input', 'Hello')
await page.keyboard.press('Enter')
```

### 8. Web Components Tests (`webcomponents.test.ts`)
**21 tests covering:**
- Custom Elements registry (define, get, whenDefined)
- Shadow DOM (open/closed mode, attachShadow)
- Shadow DOM querySelector and innerHTML
- HTMLElement lifecycle callbacks

**Example:**
```typescript
class MyElement extends window.HTMLElement {
  connectedCallback() {
    this.innerHTML = '<p>Hello</p>'
  }
}
window.customElements.define('my-element', MyElement)
```

### 9. Browser API Tests (`browser-apis.test.ts`)
**31 tests covering:**
- Performance API (now, mark, measure)
- Clipboard API (writeText, readText)
- Geolocation API
- Notification API
- File API (File, FileReader, FileList)

**Example:**
```typescript
await window.navigator.clipboard.writeText('test')
const text = await window.navigator.clipboard.readText()
```

### 10. Integration Tests (`integration.test.ts`)
**24 tests covering:**
- End-to-end workflows
- DOM manipulation + events
- Storage + timers integration
- XPath + DOM queries
- Multiple windows isolation
- Complete app simulations

**Example:**
```typescript
// Complete todo app simulation
window.document.body.innerHTML = `
  <input id="input" />
  <button id="add">Add</button>
  <ul id="list"></ul>
`
button.addEventListener('click', () => {
  const li = window.document.createElement('li')
  li.textContent = input.value
  list.appendChild(li)
})
```

## 🧪 Running Tests

### Run All Tests
```bash
bun test tests/*.test.ts
```

### Run Specific Domain
```bash
bun test tests/storage.test.ts
bun test tests/timers.test.ts
bun test tests/network.test.ts
```

### Run by Pattern
```bash
bun test tests/*-apis.test.ts  # Browser APIs + Network
bun test tests/{storage,timers}.test.ts  # Storage + Timers
```

## 📝 Writing Tests

### Test Structure
Each test file follows this pattern:

```typescript
import { Window } from '../src/index'

let passed = 0
let failed = 0

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ ${message}`)
    passed++
  }
  else {
    console.log(`❌ FAILED: ${message}`)
    failed++
  }
}

console.log('=== Test Suite Name ===\n')

// Test Group 1
console.log('Test Group 1: Feature Name')
{
  const window = new Window()

  // Test code here

  await window.happyDOM.close()
}

// Summary
console.log(`\n${'='.repeat(50)}`)
console.log(`✅ Passed: ${passed}`)
console.log(`❌ Failed: ${failed}`)
console.log(`📊 Total: ${passed + failed}`)

if (failed > 0) {
  process.exit(1)
}
```

### Best Practices

1. **Isolation**: Each test group creates its own Window/Browser instance
2. **Cleanup**: Always call `window.happyDOM.close()` or `browser.close()`
3. **Descriptive Names**: Use clear test group names
4. **Assertions**: Use the `assert()` helper for consistency
5. **Edge Cases**: Test both happy path and edge cases

### Adding New Tests

1. Choose the appropriate test file based on domain
2. Add a new test group with descriptive name
3. Create isolated test environment
4. Test the feature thoroughly
5. Clean up resources

Example:
```typescript
console.log('\nTest Group X: New Feature')
{
  const window = new Window()

  // Setup
  const element = window.document.createElement('div')

  // Test
  element.setAttribute('test', 'value')
  assert(element.getAttribute('test') === 'value', 'Attribute set correctly')

  // Cleanup
  await window.happyDOM.close()
}
```

## 🔍 Test Naming Convention

- **Files**: `{domain}.test.ts` (e.g., `storage.test.ts`, `network.test.ts`)
- **Test Groups**: `Test Group X: {Feature} - {Specific Aspect}`
- **Assertions**: Clear, actionable descriptions

## 📊 Test Metrics

### Coverage Goals
- ✅ All public APIs have tests
- ✅ Edge cases and error scenarios covered
- ✅ Integration scenarios tested
- ✅ Performance characteristics validated

### Quality Metrics
- **493+ tests** total
- **100% pass rate** (all tests passing)
- **Clear organization** (10 domain-focused files)
- **Comprehensive coverage** (all major features tested)

## 🚀 CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: bun test tests/*.test.ts
```

## 🐛 Debugging Tests

### Enable Verbose Output
```typescript
// Add detailed logging in tests
console.log('Debug:', window.localStorage.getItem('key'))
```

### Run Single Test Group
Comment out other test groups to focus on one:
```typescript
// console.log('Test Group 1: ...')
// { ... }

console.log('Test Group 2: Focus on this')
{
  // Debug this group
}
```

### Use Bun Debugger
```bash
bun --inspect test tests/storage.test.ts
```
