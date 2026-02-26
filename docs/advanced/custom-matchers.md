# Custom Matchers

Besting allows you to extend the default matchers with custom assertions tailored to your application's needs.

## Creating Custom Matchers

### Basic Matcher

```typescript
import { expect, addMatcher } from 'besting'

addMatcher('toBeEven', (received: number) => {
  const pass = received % 2 === 0
  return {
    pass,
    message: () =>
      pass
        ? `expected ${received} not to be even`
        : `expected ${received} to be even`,
  }
})

// Usage
expect(4).toBeEven() // Passes
expect(3).toBeEven() // Fails
```

### Matcher with Arguments

```typescript
addMatcher('toBeWithinRange', (received: number, floor: number, ceiling: number) => {
  const pass = received >= floor && received <= ceiling
  return {
    pass,
    message: () =>
      pass
        ? `expected ${received} not to be within range ${floor} - ${ceiling}`
        : `expected ${received} to be within range ${floor} - ${ceiling}`,
  }
})

// Usage
expect(50).toBeWithinRange(0, 100)
expect(150).not.toBeWithinRange(0, 100)
```

## TypeScript Support

### Declare Types

```typescript
// types.d.ts or in test file
declare module 'besting' {
  interface Matchers<R> {
    toBeEven(): R
    toBeWithinRange(floor: number, ceiling: number): R
    toBeValidEmail(): R
  }
}
```

### Typed Implementation

```typescript
import type { MatcherResult, MatcherContext } from 'besting'

function toBeEven(this: MatcherContext, received: number): MatcherResult {
  const pass = received % 2 === 0
  return {
    pass,
    message: () =>
      this.isNot
        ? `expected ${received} not to be even`
        : `expected ${received} to be even`,
  }
}

addMatcher('toBeEven', toBeEven)
```

## Matcher Context

### Access Context

```typescript
addMatcher('toMatchCustom', function (received, expected) {
  // Access matcher context
  console.log(this.isNot) // true if using .not
  console.log(this.equals) // Deep equality function
  console.log(this.utils) // Utility functions

  const pass = this.equals(received, expected)
  return { pass, message: () => 'Custom message' }
})
```

### Utility Functions

```typescript
addMatcher('toContainUser', function (received: User[], expected: Partial<User>) {
  const found = received.find((user) =>
    Object.entries(expected).every(([key, value]) =>
      this.equals(user[key], value)
    )
  )

  return {
    pass: found !== undefined,
    message: () =>
      this.isNot
        ? `expected array not to contain user matching ${this.utils.printExpected(expected)}`
        : `expected array to contain user matching ${this.utils.printExpected(expected)}\n` +
          `Received: ${this.utils.printReceived(received)}`,
  }
})
```

## Async Matchers

```typescript
addMatcher('toResolveWithin', async (received: Promise<unknown>, timeout: number) => {
  try {
    await Promise.race([
      received,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), timeout)
      ),
    ])
    return {
      pass: true,
      message: () => `expected promise to not resolve within ${timeout}ms`,
    }
  } catch (error) {
    return {
      pass: false,
      message: () => `expected promise to resolve within ${timeout}ms`,
    }
  }
})

// Usage
await expect(fetchData()).toResolveWithin(1000)
```

## Domain-Specific Matchers

### API Response Matchers

```typescript
interface ApiResponse {
  status: number
  data: unknown
  headers: Record<string, string>
}

addMatcher('toBeSuccessfulResponse', (received: ApiResponse) => {
  const pass = received.status >= 200 && received.status < 300
  return {
    pass,
    message: () =>
      pass
        ? `expected response not to be successful, got status ${received.status}`
        : `expected response to be successful, got status ${received.status}`,
  }
})

addMatcher('toHaveJsonContentType', (received: ApiResponse) => {
  const contentType = received.headers['content-type'] || ''
  const pass = contentType.includes('application/json')
  return {
    pass,
    message: () =>
      pass
        ? `expected content-type not to be JSON`
        : `expected content-type to be JSON, got ${contentType}`,
  }
})
```

### Date Matchers

```typescript
addMatcher('toBeToday', (received: Date) => {
  const today = new Date()
  const pass =
    received.getFullYear() === today.getFullYear() &&
    received.getMonth() === today.getMonth() &&
    received.getDate() === today.getDate()

  return {
    pass,
    message: () =>
      pass
        ? `expected ${received} not to be today`
        : `expected ${received} to be today`,
  }
})

addMatcher('toBeWithinDays', (received: Date, days: number, referenceDate = new Date()) => {
  const diff = Math.abs(received.getTime() - referenceDate.getTime())
  const dayMs = 24 * 60 * 60 * 1000
  const pass = diff <= days * dayMs

  return {
    pass,
    message: () =>
      pass
        ? `expected ${received} not to be within ${days} days of ${referenceDate}`
        : `expected ${received} to be within ${days} days of ${referenceDate}`,
  }
})
```

### DOM Matchers

```typescript
addMatcher('toHaveAttribute', (received: Element, attr: string, value?: string) => {
  const hasAttr = received.hasAttribute(attr)
  const attrValue = received.getAttribute(attr)
  const pass = hasAttr && (value === undefined || attrValue === value)

  return {
    pass,
    message: () => {
      if (!hasAttr) {
        return `expected element to have attribute "${attr}"`
      }
      if (value !== undefined && attrValue !== value) {
        return `expected attribute "${attr}" to have value "${value}", got "${attrValue}"`
      }
      return `expected element not to have attribute "${attr}"${value ? ` with value "${value}"` : ''}`
    },
  }
})
```

## Matcher Libraries

### Organize Matchers

```typescript
// matchers/api.ts
export const apiMatchers = {
  toBeSuccessfulResponse(received: ApiResponse) { /* ... */ },
  toHaveStatus(received: ApiResponse, status: number) { /* ... */ },
  toContainHeader(received: ApiResponse, header: string) { /* ... */ },
}

// matchers/dom.ts
export const domMatchers = {
  toBeVisible(received: Element) { /* ... */ },
  toHaveClass(received: Element, className: string) { /* ... */ },
}

// matchers/index.ts
export * from './api'
export * from './dom'
```

### Register All

```typescript
// setup.ts
import { addMatchers } from 'besting'
import { apiMatchers, domMatchers } from './matchers'

addMatchers({
  ...apiMatchers,
  ...domMatchers,
})
```

## Asymmetric Matchers

### Custom Asymmetric

```typescript
class IsEven {
  asymmetricMatch(received: unknown) {
    return typeof received === 'number' && received % 2 === 0
  }

  toString() {
    return 'IsEven'
  }
}

const isEven = new IsEven()

// Usage
expect({ count: 4 }).toEqual({ count: isEven })
```

### Factory Function

```typescript
function isWithinRange(min: number, max: number) {
  return {
    asymmetricMatch(received: unknown) {
      return typeof received === 'number' && received >= min && received <= max
    },
    toString() {
      return `isWithinRange(${min}, ${max})`
    },
  }
}

// Usage
expect({ score: 75 }).toEqual({ score: isWithinRange(0, 100) })
```

## Error Messages

### Rich Error Messages

```typescript
addMatcher('toMatchUser', function (received: User, expected: Partial<User>) {
  const mismatches: string[] = []

  for (const [key, value] of Object.entries(expected)) {
    if (!this.equals(received[key], value)) {
      mismatches.push(
        `  ${key}: expected ${this.utils.printExpected(value)}, ` +
          `received ${this.utils.printReceived(received[key])}`
      )
    }
  }

  const pass = mismatches.length === 0

  return {
    pass,
    message: () =>
      pass
        ? `expected user not to match\n${this.utils.printReceived(received)}`
        : `expected user to match expected values\n\nMismatches:\n${mismatches.join('\n')}`,
  }
})
```

### Diff Output

```typescript
addMatcher('toEqualObject', function (received: object, expected: object) {
  const pass = this.equals(received, expected)

  return {
    pass,
    message: () => {
      const diff = this.utils.diff(expected, received)
      return (
        `expected objects to be equal\n\n` +
        `Expected: ${this.utils.printExpected(expected)}\n` +
        `Received: ${this.utils.printReceived(received)}\n\n` +
        `Difference:\n${diff}`
      )
    },
  }
})
```

## Best Practices

1. **Clear messages**: Write helpful error messages
2. **Handle negation**: Consider `.not` usage
3. **Type safety**: Add TypeScript declarations
4. **Test matchers**: Test your custom matchers
5. **Document**: Document custom matchers

## Related

- [Matchers](/features/matchers) - Built-in matchers
- [Configuration](/advanced/configuration) - Setup files
- [Test Suites](/features/test-suites) - Organizing tests
