---
title: Assertions
description: Complete reference for besting assertions and matchers.
---
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
