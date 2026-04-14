---
title: Database Testing
description: Laravel-inspired database testing with migrations, seeders, and factories.
---
  // The insert was rolled back
  await database.assertNotExists('users', { id: 3 })
})

```ts

### Transaction Helper

```ts

import { useTransaction } from 'besting'

test('use transaction helper', async () => {
  const transactionTest = useTransaction(async (db) => {
    // This code runs within a transaction
    await db.insert('users', {
      id: 4,
      name: 'Bob',
      email: 'bob@example.com'
    })

    // Assert within the transaction
    await db.assertExists('users', { id: 4 })
  })

  await transactionTest()
  // Transaction is automatically rolled back after the test
})

```ts

## Database Factories

Create test data easily with factories:

```ts

import { db, test } from 'besting'

test('database factories', async () => {
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

  // Create an admin user using state
  await userFactory.has('admin').create({ id: 11 })

  // Create multiple users
  await userFactory.count(3).create()

  // Make model instances without persisting
  const user = userFactory.make()
  expect(user.name).toBe('Default User')
})

```ts

### Factory States

```ts

const userFactory = database.factory('users')
  .define({
    name: 'Default User',
    email: 'user@example.com',
    status: 'pending'
  })
  .state('active', user => ({
    ...user,
    status: 'active',
    verified_at: new Date()
  }))
  .state('admin', user => ({
    ...user,
    role: 'admin'
  }))

// Create an active admin user
await userFactory
  .has('active')
  .has('admin')
  .create({ id: 1 })

```ts

## Migrations

Define migrations to set up your test database schema:

```ts

import { migration } from 'besting'

// Define table migrations
migration(async (connection) => {
  await connection.raw(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
})

migration(async (connection) => {
  await connection.raw(`
    CREATE TABLE posts (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)
})

```ts

## Seeders

Seed your database with test data:

```ts

import { seeder } from 'besting'

seeder(async (connection) => {
  await connection.table('users').insert([
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', status: 'pending' },
  ])
})

seeder(async (connection) => {
  await connection.table('posts').insert([
    { id: 1, user_id: 1, title: 'First Post', content: 'Hello World' },
    { id: 2, user_id: 1, title: 'Second Post', content: 'More content' },
  ])
})

```ts

## Complete Example

```ts

import { db, describe, migration, seeder, test, useTransaction } from 'besting'

// Setup migrations
migration(async (connection) => {
  await connection.raw(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
    )
  `)
})

migration(async (connection) => {
  await connection.raw(`
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)
})

// Setup seeders
seeder(async (connection) => {
  await connection.table('users').insert([
    { id: 1, name: 'Test User', email: 'test@example.com' }
  ])
})

describe('Order System', () => {
  test('user can create order', async () => {
    const database = db().register(yourDatabaseConnection)
    await database.migrate()
    await database.seed()

    // Create an order
    await database.insert('orders', {
      id: 1,
      user_id: 1,
      total: 99.99
    })

    // Assert order was created
    await database.assertExists('orders', { id: 1, user_id: 1 })
    await database.assertSame('orders', { id: 1 }, { total: 99.99 })
  })

  test('user cannot create order with invalid user', async () => {
    const database = db().register(yourDatabaseConnection)
    await database.migrate()

    // This should fail due to foreign key constraint
    try {
      await database.insert('orders', {
        id: 1,
        user_id: 999, // Non-existent user
        total: 50.00
      })
      expect(true).toBe(false) // Should not reach here
    }
    catch (error) {
      expect(error).toBeDefined()
    }
  })
})

```ts

## Related

- [Getting Started](./getting-started.md) - Installation and setup
- [API Testing](./api-testing.md) - HTTP endpoint testing
- [Assertions](./assertions.md) - Assertion reference
