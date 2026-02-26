---
title: Assertions
description: Complete reference for besting assertions and matchers.
---

# Assertions

Besting provides a comprehensive set of assertions inspired by Jest and Pest.

## Basic Assertions

### Equality

```ts
import { expect, test } from 'besting'

test('equality assertions', () => {
  expect(1 + 1).toBe(2)
  expect({ a: 1 }).toEqual({ a: 1 })
  expect('hello').not.toBe('world')
})
```

### Truthiness

```ts
test('truthiness assertions', () => {
  expect(true).toBeTruthy()
  expect(false).toBeFalsy()
  expect(null).toBeNull()
  expect(undefined).toBeUndefined()
  expect('value').toBeDefined()
})
```

### Numbers

```ts
test('number assertions', () => {
  expect(10).toBeGreaterThan(5)
  expect(10).toBeGreaterThanOrEqual(10)
  expect(5).toBeLessThan(10)
  expect(5).toBeLessThanOrEqual(5)
  expect(0.1 + 0.2).toBeCloseTo(0.3, 5)
})
```

## Chainable Assertions

Besting supports fluent, chainable assertions:

```ts
test('chainable assertions', () => {
  expect('Hello World')
    .toContain('Hello')
    .toContain('World')
    .toHaveLength(11)
    .toStartWith('Hello')
    .toEndWith('World')
    .not.toBeEmpty()
})
```

## String Assertions

### Basic String Matchers

```ts
test('string assertions', () => {
  expect('Hello World').toContain('World')
  expect('Hello World').toMatch(/Hello/)
  expect('Hello World').toHaveLength(11)
})
```

### Extended String Matchers

```ts
test('extended string assertions', () => {
  expect('Hello World').toStartWith('Hello')
  expect('Hello World').toEndWith('World')
  expect('').toBeEmpty()
  expect('  ').not.toBeEmpty()
})
```

## Array Assertions

```ts
test('array assertions', () => {
  const arr = [1, 2, 3]

  expect(arr).toContain(2)
  expect(arr).toHaveLength(3)
  expect(arr).toEqual([1, 2, 3])
  expect([]).toBeEmpty()
})
```

### Array of Objects

```ts
test('array of objects', () => {
  const users = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ]

  expect(users).toContainEqual({ id: 1, name: 'John' })
  expect(users).toHaveLength(2)
})
```

## Object Assertions

```ts
test('object assertions', () => {
  const user = { name: 'John', age: 30, email: 'john@example.com' }

  expect(user).toHaveProperty('name')
  expect(user).toHaveProperty('name', 'John')
  expect(user).toMatchObject({ name: 'John' })
  expect({}).toBeEmpty()
})
```

## Exception Assertions

```ts
test('exception assertions', () => {
  const throwError = () => {
    throw new Error('Something went wrong')
  }

  expect(throwError).toThrow()
  expect(throwError).toThrow('Something went wrong')
  expect(throwError).toThrow(/wrong/)
  expect(throwError).toThrow(Error)
})
```

## Async Assertions

```ts
test('async assertions', async () => {
  const fetchData = async () => ({ data: 'value' })

  await expect(fetchData()).resolves.toEqual({ data: 'value' })
})

test('async rejection', async () => {
  const failingFetch = async () => {
    throw new Error('Network error')
  }

  await expect(failingFetch()).rejects.toThrow('Network error')
})
```

## Custom Validators

Use `toPass` for custom validation:

```ts
test('custom validation', () => {
  const isEven = (n: number) => n % 2 === 0

  expect(4).toPass(isEven)
  expect(4).toPass(isEven, 'Expected an even number')
})
```

## Negation

Use `.not` to negate any assertion:

```ts
test('negation', () => {
  expect(1).not.toBe(2)
  expect('hello').not.toContain('world')
  expect([1, 2, 3]).not.toBeEmpty()
  expect({ a: 1 }).not.toHaveProperty('b')
})
```

## Test Groups

Group multiple assertions on the same value:

```ts
import { testGroup } from 'besting'

testGroup('Hello World', (str) => {
  str.toContain('Hello')
    .toContain('World')
    .toStartWith('Hello')
    .toEndWith('World')
    .not.toBeEmpty()
})
```

## Special Matchers

Besting includes additional Pest-inspired matchers:

| Matcher | Description |
|---------|-------------|
| `toStartWith(prefix)` | Assert string starts with prefix |
| `toEndWith(suffix)` | Assert string ends with suffix |
| `toBeEmpty()` | Assert string, array, or object is empty |
| `toPass(validator, message?)` | Assert value passes custom validation |

## Snapshot Testing

Besting supports snapshot testing via Bun's built-in features:

```ts
test('snapshot', () => {
  const user = { name: 'John', email: 'john@example.com' }
  expect(user).toMatchSnapshot()
})
```

## Related

- [Getting Started](./getting-started.md) - Installation and setup
- [DOM Testing](./dom-testing.md) - Virtual DOM testing
- [API Testing](./api-testing.md) - HTTP endpoint testing
