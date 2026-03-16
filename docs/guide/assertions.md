---
title: Assertions
description: Complete reference for besting assertions and matchers.
---

test('string assertions', () => {
  expect('Hello World').toContain('World')
  expect('Hello World').toMatch(/Hello/)
  expect('Hello World').toHaveLength(11)
})

```ts

### Extended String Matchers

```ts

test('extended string assertions', () => {
  expect('Hello World').toStartWith('Hello')
  expect('Hello World').toEndWith('World')
  expect('').toBeEmpty()
  expect('  ').not.toBeEmpty()
})

```ts

## Array Assertions

```ts

test('array assertions', () => {
  const arr = [1, 2, 3]

  expect(arr).toContain(2)
  expect(arr).toHaveLength(3)
  expect(arr).toEqual([1, 2, 3])
  expect([]).toBeEmpty()
})

```ts

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

```ts

## Object Assertions

```ts

test('object assertions', () => {
  const user = { name: 'John', age: 30, email: 'john@example.com' }

  expect(user).toHaveProperty('name')
  expect(user).toHaveProperty('name', 'John')
  expect(user).toMatchObject({ name: 'John' })
  expect({}).toBeEmpty()
})

```ts

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

```ts

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

```ts

## Custom Validators

Use `toPass` for custom validation:

```ts

test('custom validation', () => {
  const isEven = (n: number) => n % 2 === 0

  expect(4).toPass(isEven)
  expect(4).toPass(isEven, 'Expected an even number')
})

```ts

## Negation

Use `.not` to negate any assertion:

```ts

test('negation', () => {
  expect(1).not.toBe(2)
  expect('hello').not.toContain('world')
  expect([1, 2, 3]).not.toBeEmpty()
  expect({ a: 1 }).not.toHaveProperty('b')
})

```ts

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

```ts

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

```ts

## Related

- [Getting Started](./getting-started.md) - Installation and setup
- [DOM Testing](./dom-testing.md) - Virtual DOM testing
- [API Testing](./api-testing.md) - HTTP endpoint testing
