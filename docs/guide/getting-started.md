---
title: Getting Started
description: Learn how to install and use besting for testing your applications.
---

# Getting Started

Besting is a Jest and Pest inspired testing framework for Bun with **zero external dependencies**.

## Prerequisites

- [Bun](https://bun.sh) v1.0.0 or higher

## Installation

```bash
bun add -d besting
```

## Quick Start

### Basic Test

```ts
import { expect, test } from 'besting'

test('basic addition', () => {
  expect(1 + 1).toBe(2)
})
```

### Chainable Assertions

Besting supports fluent, chainable assertions:

```ts
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

### Pest-Style API

Use the Pest-like syntax for a familiar experience:

```ts
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

### Test Suites

Organize tests with describe blocks:

```ts
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

### Lifecycle Hooks

Use lifecycle hooks for setup and teardown:

```ts
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

## Running Tests

```bash
# Run all tests
bun test

# Run a specific test file
bun test path/to/test.ts

# Run with custom runner (ensures all test files are executed)
bun run test:custom
```

## Key Features

- **Zero Dependencies** - Lightweight with no external dependencies
- **Virtual DOM** - Lightning-fast DOM testing without browser downloads
- **Fluent API** - Chainable assertions for expressive tests
- **Laravel-Inspired** - Familiar API for database, API, and browser testing
- **Full Bun Integration** - Works with all Bun test features

## Next Steps

- Learn about [Assertions](./assertions.md)
- Explore [DOM Testing](./dom-testing.md)
- Discover [API Testing](./api-testing.md)
- Set up [Database Testing](./database-testing.md)
- Try [Browser Testing](./browser-testing.md)

## Ecosystem Integration

Besting is part of the Stacks ecosystem:

- **[Stacks Framework](https://stacksjs.org)** - Full-stack framework
- **[clapp](https://clapp.stacksjs.org)** - CLI framework
- **[BunPress](https://bunpress.sh)** - Documentation generator
