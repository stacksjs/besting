# Mocking

Besting provides comprehensive mocking capabilities for functions, modules, and timers, allowing you to isolate code under test.

## Mock Functions

### Creating Mocks

```typescript
import { fn, mock } from 'besting'

// Create a mock function
const mockFn = fn()

// With implementation
const mockAdd = fn((a: number, b: number) => a + b)

// Call the mock
mockFn('arg1', 'arg2')
mockAdd(1, 2) // Returns 3
```

### Mock Return Values

```typescript
const mockFn = fn()

// Single return value
mockFn.mockReturnValue('default')

// Return once
mockFn.mockReturnValueOnce('first')
mockFn.mockReturnValueOnce('second')

mockFn() // 'first'
mockFn() // 'second'
mockFn() // 'default'
```

### Mock Implementations

```typescript
const mockFn = fn()

// Set implementation
mockFn.mockImplementation((x) => x * 2)

// Implementation once
mockFn.mockImplementationOnce(() => 'special')

mockFn(5) // 'special'
mockFn(5) // 10
```

### Async Mocks

```typescript
const mockAsync = fn()

mockAsync.mockResolvedValue('success')
mockAsync.mockResolvedValueOnce('first success')

mockAsync.mockRejectedValue(new Error('fail'))
mockAsync.mockRejectedValueOnce(new Error('first fail'))

await mockAsync() // 'first success'
await mockAsync() // 'success'
```

## Inspecting Calls

```typescript
const mockFn = fn()

mockFn('a', 'b')
mockFn('c', 'd')

// Check calls
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledTimes(2)
expect(mockFn).toHaveBeenCalledWith('a', 'b')
expect(mockFn).toHaveBeenLastCalledWith('c', 'd')
expect(mockFn).toHaveBeenNthCalledWith(1, 'a', 'b')

// Access call data
mockFn.mock.calls // [['a', 'b'], ['c', 'd']]
mockFn.mock.lastCall // ['c', 'd']
mockFn.mock.results // [{ type: 'return', value: undefined }, ...]
```

## Spying

### Spy on Object Methods

```typescript
import { spyOn } from 'besting'

const obj = {
  method: (x: number) => x * 2,
}

const spy = spyOn(obj, 'method')

obj.method(5) // Still returns 10

expect(spy).toHaveBeenCalledWith(5)
```

### Replace Implementation

```typescript
const spy = spyOn(obj, 'method').mockImplementation(() => 'mocked')

obj.method(5) // 'mocked'
```

### Restore Original

```typescript
const spy = spyOn(obj, 'method')

spy.mockRestore() // Restore original implementation
```

## Module Mocking

### Mock Entire Module

```typescript
import { mock } from 'besting'

// Mock before importing
mock.module('./utils', () => ({
  fetchData: fn().mockResolvedValue({ id: 1 }),
  processData: fn().mockReturnValue('processed'),
}))

// Now import the module
import { fetchData, processData } from './utils'

// Uses mocked implementations
await fetchData() // { id: 1 }
```

### Partial Module Mocks

```typescript
mock.module('./utils', async (original) => {
  const actual = await original()
  return {
    ...actual,
    fetchData: fn().mockResolvedValue({ id: 'mocked' }),
    // Other exports remain unchanged
  }
})
```

### Mock Node Modules

```typescript
mock.module('axios', () => ({
  default: {
    get: fn().mockResolvedValue({ data: 'mocked' }),
    post: fn().mockResolvedValue({ data: 'created' }),
  },
}))

import axios from 'axios'

await axios.get('/api') // { data: 'mocked' }
```

### Unmock Module

```typescript
mock.unmock('./utils')
```

## Timer Mocks

### Fake Timers

```typescript
import { useFakeTimers, useRealTimers } from 'besting'

beforeEach(() => {
  useFakeTimers()
})

afterEach(() => {
  useRealTimers()
})

it('handles timeouts', () => {
  const callback = fn()

  setTimeout(callback, 1000)

  expect(callback).not.toHaveBeenCalled()

  advanceTimersByTime(1000)

  expect(callback).toHaveBeenCalled()
})
```

### Timer Controls

```typescript
import {
  advanceTimersByTime,
  advanceTimersToNextTimer,
  runAllTimers,
  runOnlyPendingTimers,
  clearAllTimers,
  getTimerCount,
} from 'besting'

// Advance by specific time
advanceTimersByTime(5000)

// Run next timer
advanceTimersToNextTimer()

// Run all timers
runAllTimers()

// Run only pending (not newly scheduled)
runOnlyPendingTimers()

// Clear all timers
clearAllTimers()

// Check pending timer count
getTimerCount()
```

### Mock Date

```typescript
import { setSystemTime, getRealSystemTime } from 'besting'

beforeEach(() => {
  useFakeTimers()
  setSystemTime(new Date('2024-01-15'))
})

it('uses mocked date', () => {
  expect(new Date().toISOString()).toContain('2024-01-15')
})
```

## Class Mocking

### Mock Class

```typescript
import { fn } from 'besting'

class Database {
  connect() { /* ... */ }
  query(sql: string) { /* ... */ }
}

const MockDatabase = fn().mockImplementation(() => ({
  connect: fn().mockResolvedValue(true),
  query: fn().mockResolvedValue([]),
}))

const db = new MockDatabase()
await db.connect()
```

### Auto-Mock Class

```typescript
mock.module('./database', () => ({
  Database: fn().mockImplementation(() => ({
    connect: fn(),
    query: fn(),
    disconnect: fn(),
  })),
}))
```

## Clearing and Resetting

```typescript
const mockFn = fn()

// Clear call history
mockFn.mockClear()

// Reset mock (clear + remove implementations)
mockFn.mockReset()

// Restore original (for spies)
mockFn.mockRestore()

// Clear all mocks
clearAllMocks()

// Reset all mocks
resetAllMocks()

// Restore all mocks
restoreAllMocks()
```

## Mock Factories

### Reusable Mocks

```typescript
// mocks/api.ts
export function createApiMock() {
  return {
    get: fn().mockResolvedValue({ data: [] }),
    post: fn().mockResolvedValue({ data: { id: 1 } }),
    put: fn().mockResolvedValue({ data: { updated: true } }),
    delete: fn().mockResolvedValue({ status: 204 }),
  }
}

// In tests
import { createApiMock } from './mocks/api'

const api = createApiMock()
api.get.mockResolvedValueOnce({ data: [{ id: 1 }] })
```

## Global Mocks

### Setup File

```typescript
// setup.ts
import { mock, fn } from 'besting'

// Mock globals
globalThis.fetch = fn()

// Mock environment
mock.module('./config', () => ({
  config: {
    apiUrl: 'http://test-api',
    debug: false,
  },
}))
```

## Best Practices

1. **Clear mocks**: Reset between tests for isolation
2. **Minimal mocking**: Only mock what's necessary
3. **Restore spies**: Always restore in afterEach
4. **Type safety**: Type mock implementations
5. **Avoid over-mocking**: Test real behavior when possible

## Related

- [Test Suites](/features/test-suites) - Organizing tests
- [Matchers](/features/matchers) - Mock assertions
- [Configuration](/advanced/configuration) - Mock configuration
