<p align="center"><img src=".github/art/cover.jpg" alt="Social Card of this repo"></p>

[![npm version][npm-version-src]][npm-version-href]
[![GitHub Actions][github-actions-src]][github-actions-href]
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
<!-- [![npm downloads][npm-downloads-src]][npm-downloads-href] -->
<!-- [![Codecov][codecov-src]][codecov-href] -->

# Besting

A Jest & Pest inspired testing utilities for Bun. _UI coming soon!_

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
- **API Testing** - Laravel-inspired API testing utilities for testing HTTP endpoints.
- **Database Testing** - Laravel-inspired database testing with migrations, seeders, and factories.
- **Authentication Testing** - Laravel-inspired authentication testing.
- **Event Testing** - Laravel-inspired event testing with event dispatching and assertions.
- **Command Testing** - Laravel-inspired command testing for terminal commands.
- **Cache Testing** - Utilities for testing cache operations.
- **Cookie Testing** - Utilities for testing cookies.
- **URL Testing** - Utilities for testing URL components.

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

## API Testing

Besting includes Laravel-inspired API testing utilities for testing HTTP endpoints.

### Basic API Testing

```typescript
import { api, assertResponse, test } from 'besting'

test('Basic API test', async () => {
  // Make a GET request to an API
  const response = await api('https://api.example.com')
    .get('/users/1')

  // Assert on the response
  const assertion = await assertResponse(response).assertOk()
  await assertion.assertStatus(200)
  await assertion.assertHeader('content-type')

  // Get and assert on JSON data
  const data = await response.json()
  expect(data).toHaveProperty('id', 1)
})
```

### HTTP Methods

```typescript
import { api, assertResponse, test } from 'besting'

test('Testing different HTTP methods', async () => {
  const baseApi = api('https://api.example.com')

  // GET with query parameters
  const getResponse = await baseApi
    .withQuery({ filter: 'active' })
    .get('/users')

  // POST with JSON data
  const postResponse = await baseApi
    .post('/users', { name: 'John', email: 'john@example.com' })

  // PUT to update a resource
  const putResponse = await baseApi
    .put('/users/1', { name: 'Updated Name' })

  // DELETE a resource
  const deleteResponse = await baseApi
    .delete('/users/1')
})
```

### Authentication

```typescript
import { api, test } from 'besting'

test('Authenticated API requests', async () => {
  // Using Bearer token
  const tokenResponse = await api('https://api.example.com')
    .withToken('your-auth-token')
    .get('/secured-endpoint')

  // Using Basic Authentication
  const basicAuthResponse = await api('https://api.example.com')
    .withBasicAuth('username', 'password')
    .get('/secured-endpoint')
})
```

### JSON Assertions

```typescript
import { api, assertResponse, test } from 'besting'

test('Testing JSON responses', async () => {
  const response = await api('https://api.example.com')
    .get('/users/1')

  // Assert on specific JSON paths
  const assertion = await assertResponse(response)
  await assertion.assertJsonPath('name', 'John Doe')
  await assertion.assertJsonPath('email')
  await assertion.assertJsonPath('address.city', 'New York')

  // Assert on the entire JSON structure
  await assertion.assertJson({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  })
})
```

### Configuration

```typescript
import { api, test } from 'besting'

test('Configuring API requests', async () => {
  const response = await api('https://api.example.com')
    .withHeaders({
      'X-Custom-Header': 'Value',
      'Accept-Language': 'en-US'
    })
    .withTimeout(5000) // 5 seconds timeout
    .withJson() // Ensure JSON content type
    .get('/endpoint')
})
```

## Cache Testing

Besting includes utilities for testing cache operations, inspired by Laravel's cache assertions.

### Basic Cache Testing

```typescript
import { cache, test } from 'besting'

test('Basic cache operations', async () => {
  const cacheStore = cache()

  // Store a value in cache
  await cacheStore.set('user_id', 1)

  // Assert that the key exists
  await cacheStore.assertHas('user_id')

  // Get a value from cache
  const userId = await cacheStore.get('user_id')

  // Delete a key
  await cacheStore.delete('user_id')

  // Assert that the key is gone
  await cacheStore.assertMissing('user_id')
})
```

### Expiration Testing

```typescript
import { cache, test } from 'besting'

test('Cache expiration', async () => {
  const cacheStore = cache()

  // Set a value with a 1 second TTL
  await cacheStore.set('temp', 'value', 1)

  // Value should exist initially
  await cacheStore.assertExists('temp')

  // Wait for expiration
  await new Promise(resolve => setTimeout(resolve, 1100))

  // Value should be gone after TTL expires
  await cacheStore.assertNotExists('temp')
})
```

## Cookie Testing

Besting includes utilities for testing cookies, compatible with both browser and server environments.

### Basic Cookie Testing

```typescript
import { cookie, test } from 'besting'

test('Basic cookie operations', () => {
  const cookieJar = cookie()

  // Set cookies
  cookieJar
    .set('session_id', '123456789')
    .set('theme', 'dark')

  // Assert cookies exist
  cookieJar
    .assertHas('session_id')
    .assertHas('theme')

  // Assert cookie values
  cookieJar
    .assertValue('session_id', '123456789')
    .assertValue('theme', 'dark')

  // Remove a cookie
  cookieJar.remove('theme')

  // Assert cookie is gone
  cookieJar.assertMissing('theme')
})
```

## URL Testing

Besting includes utilities for testing URL components.

### Basic URL Testing

```typescript
import { test, url } from 'besting'

test('URL component testing', () => {
  const testUrl = url('https://example.com/users?sort=asc&page=1#profile')

  // Assert URL components
  testUrl
    .hasProtocol('https')
    .hasHost('example.com')
    .hasPath('/users')
    .hasQuery('sort', 'asc')
    .hasQuery('page', '1')
    .hasFragment('profile')

  // Check for absence of query parameters
  testUrl.doesntHaveQuery('filter')

  // Get URL components
  console.log(testUrl.path) // '/users'
  console.log(testUrl.queryParams) // { sort: 'asc', page: '1' }
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

## Database Testing

Besting includes Laravel-inspired database testing utilities with migrations, seeders, and factories.

### Basic Database Testing

```typescript
import { db, migration, seeder, test } from 'besting'

// Define a migration
migration(async (connection) => {
  await connection.raw('CREATE TABLE users (id INT, name TEXT, email TEXT)')
})

// Define a seeder
seeder(async (connection) => {
  await connection.table('users').insert([
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' },
  ])
})

test('Basic database operations', async () => {
  const database = db().register(yourDatabaseConnection)

  // Run migrations and seeders
  await database.migrate()
  await database.seed()

  // Query data
  const users = await database.select('users')
  expect(users.length).toBe(2)

  // Insert data
  await database.insert('users', { id: 3, name: 'Alice', email: 'alice@example.com' })

  // Make assertions
  await database.assertExists('users', { id: 3 })
  await database.assertSame('users', { id: 3 }, { name: 'Alice' })
})
```

### Database Transactions

```typescript
import { db, test, useTransaction } from 'besting'

test('Database transactions', async () => {
  const database = db().register(yourDatabaseConnection)

  // Use transactions to isolate tests
  await database.beginTransaction()

  // Make changes
  await database.insert('users', { id: 3, name: 'Alice', email: 'alice@example.com' })

  // Rollback changes
  await database.rollbackTransaction()

  // Use the transaction helper
  const transactionTest = useTransaction(async (db) => {
    // This code runs within a transaction
    await db.insert('users', { id: 4, name: 'Bob', email: 'bob@example.com' })
  })

  await transactionTest()
})
```

### Database Factories

```typescript
import { db, test } from 'besting'

test('Database factories', async () => {
  const database = db().register(yourDatabaseConnection)

  // Create a user factory
  const userFactory = database.factory('users')
    .define({
      name: 'Default User',
      email: 'user@example.com',
    })
    .state('admin', user => ({
      ...user,
      name: 'Admin User',
      email: 'admin@example.com',
    }))

  // Create a default user
  await userFactory.create({ id: 10 })

  // Create an admin user
  await userFactory.has('admin').create({ id: 11 })

  // Create multiple users
  await userFactory.count(3).create()

  // Make model instances without persisting
  const user = userFactory.make()
})
```

## Event Testing

Besting includes Laravel-inspired event testing utilities for testing event dispatching.

### Basic Event Testing

```typescript
import { defineEvent, events, fakeEvents, test } from 'besting'

// Define event classes
class UserCreated {
  constructor(public id: number, public name: string) {}
}

// Define an event using the helper
const OrderShipped = defineEvent({
  id: 0,
  trackingNumber: '',
})

test('Basic event testing', () => {
  const fake = fakeEvents()

  // Dispatch events
  events().dispatch(new UserCreated(1, 'John'))
  events().dispatch(new UserCreated(2, 'Jane'))

  // Make assertions
  fake.assertDispatched('UserCreated')
  fake.assertDispatchedTimes('UserCreated', 2)
  fake.assertNotDispatched('OrderShipped')

  // Check specific events
  fake.assertDispatched('UserCreated', event => event.id === 1)
})
```

### Event Listeners

```typescript
import { events, listener, test } from 'besting'

class UserCreated {
  constructor(public id: number, public name: string) {}
}

class EventListener {
  events: any[] = []

  @listener(UserCreated.name)
  handleUserCreated(event: UserCreated) {
    this.events.push(event)
  }
}

test('Event listeners', () => {
  const listener = new EventListener()

  // Dispatch an event
  events().dispatch(new UserCreated(1, 'John'))

  // Check that the listener received it
  expect(listener.events.length).toBe(1)
  expect(listener.events[0].name).toBe('John')
})
```

## Authentication Testing

Besting includes Laravel-inspired authentication testing utilities.

### Basic Authentication Testing

```typescript
import { auth, test } from 'besting'

test('Authentication testing', () => {
  // Define a user
  const user = {
    id: 1,
    name: 'Test User',
    email: 'user@example.com',
  }

  // Set the authenticated user
  auth().actingAs(user)

  // Make assertions
  auth().assertAuthenticated()
  expect(auth().user().id).toBe(1)

  // Act as guest
  auth().actingAsGuest()
  auth().assertGuest()
})
```

### With Auth Helper

```typescript
import { auth, test, withAuth } from 'besting'

test('With auth helper', () => {
  const user = {
    id: 1,
    name: 'Test User',
    email: 'user@example.com',
  }

  // Create request with auth context
  const request = withAuth(user)

  expect(request.user).toBe(user)
  expect(request.auth.check()).toBe(true)
})
```

## Command Testing

Besting includes utilities for testing terminal commands, including Laravel-inspired Artisan command testing.

### Basic Command Testing

```typescript
import { command, test } from 'besting'

test('Command testing', async () => {
  const cmd = command()

  // Execute a command
  const result = await cmd.execute('echo', ['Hello, World!'])

  // Make assertions
  cmd
    .assertExitCode(0)
    .assertOutputContains('Hello')
    .assertOutputNotContains('error')
})
```

### Artisan Command Testing

```typescript
import { artisan, test } from 'besting'

test('Artisan command testing', async () => {
  // This example shows how it would work in a Laravel project
  const result = await artisan('migrate', ['--seed'])

  expect(result.exitCode).toBe(0)
  expect(result.output).toContain('Migration')
})
```
