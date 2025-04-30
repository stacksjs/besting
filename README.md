<p align="center"><img src=".github/art/cover.jpg" alt="Social Card of this repo"></p>

[![npm version][npm-version-src]][npm-version-href]
[![GitHub Actions][github-actions-src]][github-actions-href]
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
<!-- [![npm downloads][npm-downloads-src]][npm-downloads-href] -->
<!-- [![Codecov][codecov-src]][codecov-href] -->

# Besting

A Pest & Jest inspired testing utilities for Bun.

## Overview

Besting is a lightweight wrapper around Bun's built-in test runner that provides a more fluent, Pest-like API for writing tests. It builds on Bun's Jest-compatible test runner and adds a more expressive, chainable API for assertions.

## Installation

```bash
bun add -d besting
```

## Features

- **Fluent, chainable assertions** - Make multiple assertions on the same value with a chainable API.
- **Pest-style syntax** - Use a similar style to PHP's Pest testing framework.
- **Zero overhead** - Built directly on Bun's native test runner for maximum performance.
- **Full compatibility** - Works with all of Bun's testing features including lifecycle hooks, snapshots, and more.

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

## Special Matchers

Besting includes all matchers from Bun's test runner, plus additional Pest-inspired matchers:

- `toStartWith(prefix)` - Assert that a string starts with a prefix
- `toEndWith(suffix)` - Assert that a string ends with a suffix
- `toBeEmpty()` - Assert that a string, array, or object is empty
- `toPass(validator, message?)` - Assert that a value passes a custom validation function

## Running Tests

Use Bun's built-in test runner to run your tests:

```bash
bun test
```

## License

MIT

## Get Started

It's rather simple to get your package development started:

```bash
# you may use this GitHub template or the following command:
bunx degit stacksjs/besting my-pkg
cd my-pkg

bun i # install all deps
bun run build # builds the library for production-ready use

# after you have successfully committed, you may create a "release"
bun run release # automates git commits, versioning, and changelog generations
```

_Check out the package.json scripts for more commands._

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
