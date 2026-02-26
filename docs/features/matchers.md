# Matchers

Besting provides a comprehensive set of matchers for assertions, inspired by Jest and Chai. This guide covers all available matchers.

## Basic Matchers

### Equality

```typescript
expect(value).toBe(expected)        // Strict equality (===)
expect(value).toEqual(expected)     // Deep equality
expect(value).toStrictEqual(expected) // Strict deep equality
```

### Truthiness

```typescript
expect(value).toBeTruthy()          // Truthy value
expect(value).toBeFalsy()           // Falsy value
expect(value).toBeNull()            // Exactly null
expect(value).toBeUndefined()       // Exactly undefined
expect(value).toBeDefined()         // Not undefined
expect(value).toBeNaN()             // NaN
```

### Numbers

```typescript
expect(value).toBeGreaterThan(3)
expect(value).toBeGreaterThanOrEqual(3)
expect(value).toBeLessThan(5)
expect(value).toBeLessThanOrEqual(5)
expect(value).toBeCloseTo(0.3, 5)   // Float comparison with precision
expect(value).toBePositive()
expect(value).toBeNegative()
expect(value).toBeInteger()
expect(value).toBeFinite()
```

## String Matchers

```typescript
expect(str).toMatch(/pattern/)      // Regex match
expect(str).toMatch('substring')    // Contains substring
expect(str).toContain('text')       // Contains text
expect(str).toStartWith('Hello')
expect(str).toEndWith('World')
expect(str).toHaveLength(10)
expect(str).toBeEmpty()             // Empty string
```

## Array Matchers

```typescript
expect(arr).toContain(item)         // Contains item
expect(arr).toContainEqual(obj)     // Contains equal object
expect(arr).toHaveLength(3)
expect(arr).toBeEmpty()
expect(arr).toInclude(item)
expect(arr).toIncludeAllMembers([1, 2])
expect(arr).toIncludeAnyMembers([1, 5])
expect(arr).toSatisfyAll(fn)        // All items satisfy predicate
expect(arr).toSatisfyAny(fn)        // Any item satisfies predicate
```

## Object Matchers

```typescript
expect(obj).toHaveProperty('key')
expect(obj).toHaveProperty('key', value)
expect(obj).toHaveProperty('nested.key')
expect(obj).toMatchObject({ key: value })
expect(obj).toContainKey('key')
expect(obj).toContainKeys(['a', 'b'])
expect(obj).toContainValue(value)
expect(obj).toContainEntry(['key', value])
expect(obj).toBeInstanceOf(Class)
```

## Function Matchers

### Thrown Errors

```typescript
expect(() => fn()).toThrow()
expect(() => fn()).toThrow('message')
expect(() => fn()).toThrow(/pattern/)
expect(() => fn()).toThrow(ErrorClass)
expect(() => fn()).toThrowErrorMatchingSnapshot()
```

### Async Errors

```typescript
await expect(asyncFn()).rejects.toThrow()
await expect(asyncFn()).rejects.toThrow('error')
```

## Promise Matchers

```typescript
await expect(promise).resolves.toBe(value)
await expect(promise).resolves.toEqual(obj)
await expect(promise).rejects.toThrow()
await expect(promise).rejects.toMatch(/error/)
```

## Mock Function Matchers

```typescript
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledTimes(3)
expect(mockFn).toHaveBeenCalledWith(arg1, arg2)
expect(mockFn).toHaveBeenLastCalledWith(arg)
expect(mockFn).toHaveBeenNthCalledWith(2, arg)
expect(mockFn).toHaveReturned()
expect(mockFn).toHaveReturnedTimes(2)
expect(mockFn).toHaveReturnedWith(value)
expect(mockFn).toHaveLastReturnedWith(value)
expect(mockFn).toHaveNthReturnedWith(2, value)
```

## Snapshot Matchers

```typescript
expect(value).toMatchSnapshot()
expect(value).toMatchSnapshot('snapshot name')
expect(value).toMatchInlineSnapshot(`"expected"`)
expect(fn).toThrowErrorMatchingSnapshot()
```

## Asymmetric Matchers

Use within expect calls:

```typescript
expect(obj).toEqual({
  id: expect.any(Number),
  name: expect.any(String),
  data: expect.anything(),
})

expect(arr).toEqual(
  expect.arrayContaining([1, 2])
)

expect(obj).toEqual(
  expect.objectContaining({ key: 'value' })
)

expect(str).toEqual(
  expect.stringContaining('substring')
)

expect(str).toEqual(
  expect.stringMatching(/pattern/)
)
```

## Negation

Negate any matcher with `.not`:

```typescript
expect(value).not.toBe(other)
expect(value).not.toContain(item)
expect(fn).not.toThrow()
expect(mockFn).not.toHaveBeenCalled()
```

## Custom Asymmetric Matchers

```typescript
const isPositive = {
  asymmetricMatch: (received: unknown) => {
    return typeof received === 'number' && received > 0
  },
  toString: () => 'isPositive',
}

expect({ count: 5 }).toEqual({ count: isPositive })
```

## Type Matchers

```typescript
expect(value).toBeTypeOf('string')
expect(value).toBeTypeOf('number')
expect(value).toBeTypeOf('boolean')
expect(value).toBeTypeOf('object')
expect(value).toBeTypeOf('function')
expect(value).toBeTypeOf('undefined')
```

## DOM Matchers

```typescript
expect(element).toBeInTheDocument()
expect(element).toBeVisible()
expect(element).toBeDisabled()
expect(element).toBeEnabled()
expect(element).toHaveClass('class-name')
expect(element).toHaveAttribute('attr', 'value')
expect(element).toHaveTextContent('text')
expect(element).toHaveValue('input value')
expect(element).toBeChecked()
expect(element).toBeFocused()
expect(element).toContainElement(child)
expect(element).toContainHTML('<span>text</span>')
```

## Date Matchers

```typescript
expect(date).toBeBefore(otherDate)
expect(date).toBeAfter(otherDate)
expect(date).toBeSameDay(otherDate)
expect(date).toBeWithin(1000, otherDate) // Within 1 second
```

## Error Matchers

```typescript
expect(error).toBeError()
expect(error).toBeError(ErrorClass)
expect(error).toBeError('message')
expect(error).toHaveMessage('error message')
expect(error).toHaveCode('ERR_CODE')
```

## Extending Matchers

### Add Custom Matchers

```typescript
import { expect, addMatcher } from 'besting'

addMatcher('toBeWithinRange', (received, floor, ceiling) => {
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
```

### TypeScript Support

```typescript
declare module 'besting' {
  interface Matchers<R> {
    toBeWithinRange(floor: number, ceiling: number): R
  }
}
```

## Soft Assertions

Continue after failures:

```typescript
it('collects all failures', () => {
  expect.soft(1).toBe(2) // Continues
  expect.soft(2).toBe(3) // Continues
  expect.soft(3).toBe(3) // Passes
  // Reports all failures at end
})
```

## Assertion Counts

```typescript
it('expects specific assertion count', () => {
  expect.assertions(2)

  expect(fn()).toBe('result')
  expect(obj).toHaveProperty('key')
})

it('expects at least one assertion', () => {
  expect.hasAssertions()

  if (condition) {
    expect(value).toBe(expected)
  }
})
```

## Best Practices

1. **Be specific**: Use the most specific matcher available
2. **Clear messages**: Custom matchers should have clear failure messages
3. **Avoid negation overuse**: Prefer positive assertions
4. **Type safety**: Use TypeScript for better matcher suggestions
5. **Asymmetric when needed**: Use asymmetric matchers for partial matching

## Related

- [Test Suites](/features/test-suites) - Organizing tests
- [Custom Matchers](/advanced/custom-matchers) - Creating custom matchers
- [Assertions](/guide/assertions) - Assertion guide
