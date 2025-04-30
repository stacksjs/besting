import { afterEach, beforeEach, db, describe, expect, migration, seeder, test, useTransaction } from 'besting'

// Mock database connection
class MockDatabaseConnection {
  private tables: Record<string, any[]> = {}
  private transactionMode = false

  table(name: string) {
    if (!this.tables[name]) {
      this.tables[name] = []
    }

    return {
      select: (columns: string[] = ['*']) => ({
        where: (where: Record<string, any> = {}) => {
          return this.tables[name]
            .filter((row) => {
              return Object.entries(where).every(([key, value]) => row[key] === value)
            })
            .map((row) => {
              if (columns[0] === '*')
                return { ...row }

              const result: Record<string, any> = {}
              columns.forEach((col) => {
                result[col] = row[col]
              })
              return result
            })
        },
        first: () => {
          const rows = this.tables[name]
          return rows.length > 0 ? rows[0] : null
        },
      }),
      insert: (data: Record<string, any> | Record<string, any>[]) => {
        if (Array.isArray(data)) {
          data.forEach(item => this.tables[name].push(item))
        }
        else {
          this.tables[name].push(data)
        }
        return { id: this.tables[name].length }
      },
      update: (data: Record<string, any>) => ({
        where: (where: Record<string, any> = {}) => {
          let count = 0
          this.tables[name] = this.tables[name].map((row) => {
            if (Object.entries(where).every(([key, value]) => row[key] === value)) {
              count++
              return { ...row, ...data }
            }
            return row
          })
          return count
        },
      }),
      delete: () => ({
        where: (where: Record<string, any> = {}) => {
          const initialLength = this.tables[name].length
          this.tables[name] = this.tables[name].filter((row) => {
            return !Object.entries(where).every(([key, value]) => row[key] === value)
          })
          return initialLength - this.tables[name].length
        },
      }),
      count: (column = '*') => ({
        where: (where: Record<string, any> = {}) => {
          const count = this.tables[name].filter((row) => {
            return Object.entries(where).every(([key, value]) => row[key] === value)
          }).length
          return { first: () => ({ total: count }) }
        },
        first: () => ({ total: this.tables[name].length }),
      }),
    }
  }

  beginTransaction() {
    this.transactionMode = true
    return this
  }

  commit() {
    this.transactionMode = false
    return Promise.resolve()
  }

  rollback() {
    this.transactionMode = false
    return Promise.resolve()
  }

  dropAllTables() {
    this.tables = {}
    return Promise.resolve()
  }

  rollbackMigrations() {
    this.tables = {}
    return Promise.resolve()
  }

  raw(sql: string, params: any[] = []) {
    console.log('Executing raw SQL:', sql, params)
    return Promise.resolve({ rows: [] })
  }
}

// Define some migrations
migration(async (connection) => {
  // Create users table
  await connection.raw('CREATE TABLE users (id INT, name TEXT, email TEXT)')
})

migration(async (connection) => {
  // Create posts table
  await connection.raw('CREATE TABLE posts (id INT, user_id INT, title TEXT, content TEXT)')
})

// Define some seeders
seeder(async (connection) => {
  // Seed users
  await connection.table('users').insert([
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' },
  ])
})

seeder(async (connection) => {
  // Seed posts
  await connection.table('posts').insert([
    { id: 1, user_id: 1, title: 'First Post', content: 'Hello World' },
    { id: 2, user_id: 1, title: 'Second Post', content: 'Another post' },
    { id: 3, user_id: 2, title: 'Jane\'s Post', content: 'Hi there' },
  ])
})

describe('Database Testing', () => {
  let connection: any

  beforeEach(() => {
    // Create a fresh database connection for each test
    connection = new MockDatabaseConnection()
  })

  afterEach(async () => {
    // Clean up after each test
    await connection.dropAllTables()
  })

  test('can register and use a database connection', async () => {
    const database = db().register(connection)

    await database.migrate()
    await database.seed()

    // Verify seeded data
    const users = await database.select('users')
    expect(users.length).toBe(2)

    const posts = await database.select('posts')
    expect(posts.length).toBe(3)
  })

  test('can insert and select data', async () => {
    const database = db().register(connection)

    // Insert a new user
    await database.insert('users', { id: 3, name: 'Alice', email: 'alice@example.com' })

    // Find the user
    const user = await database.select('users', ['*'], { id: 3 })
    expect(user[0].name).toBe('Alice')
  })

  test('can update data', async () => {
    const database = db().register(connection)

    // Insert a user first
    await database.insert('users', { id: 3, name: 'Alice', email: 'alice@example.com' })

    // Update the user
    await database.update('users', { name: 'Alicia' }, { id: 3 })

    // Find the user
    const user = await database.select('users', ['*'], { id: 3 })
    expect(user[0].name).toBe('Alicia')
  })

  test('can delete data', async () => {
    const database = db().register(connection)

    // Insert a user first
    await database.insert('users', { id: 3, name: 'Alice', email: 'alice@example.com' })

    // Delete the user
    await database.delete('users', { id: 3 })

    // Check that the user is gone
    const user = await database.select('users', ['*'], { id: 3 })
    expect(user.length).toBe(0)
  })

  test('can make assertions on database state', async () => {
    const database = db().register(connection)

    // Insert a user
    await database.insert('users', { id: 3, name: 'Alice', email: 'alice@example.com' })

    // Assert that the user exists
    await database.assertExists('users', { id: 3 })

    // Assert a specific value
    await database.assertSame('users', { id: 3 }, { name: 'Alice' })

    // Delete the user
    await database.delete('users', { id: 3 })

    // Assert that the user is gone
    await database.assertMissing('users', { id: 3 })
  })

  test('can use transactions', async () => {
    const database = db().register(connection)

    // Start a transaction
    await database.beginTransaction()

    // Insert a user within the transaction
    await database.insert('users', { id: 3, name: 'Alice', email: 'alice@example.com' })

    // Rollback the transaction
    await database.rollbackTransaction()

    // The user should not exist
    await database.assertMissing('users', { id: 3 })
  })

  test('can use the transaction helper', async () => {
    // Register the connection
    db().register(connection)

    const transactionTest = useTransaction(async (database) => {
      // Insert a user within the transaction
      await database.insert('users', { id: 3, name: 'Alice', email: 'alice@example.com' })

      // User should exist within the transaction
      await database.assertExists('users', { id: 3 })
    })

    // Run the test with transaction
    await transactionTest()

    // The transaction should have been rolled back
    await db().assertMissing('users', { id: 3 })
  })

  test('can use database factories', async () => {
    const database = db().register(connection)

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

    // Assert that both users exist
    await database.assertExists('users', { id: 10 })
    await database.assertExists('users', { id: 11 })

    // Assert their specific values
    await database.assertSame('users', { id: 10 }, { name: 'Default User' })
    await database.assertSame('users', { id: 11 }, { name: 'Admin User' })
  })

  test('can create multiple records with count', async () => {
    const database = db().register(connection)

    // Create a user factory
    const userFactory = database.factory('users')
      .define({
        name: 'Default User',
        email: 'user@example.com',
      })

    // Create 3 users
    await userFactory.count(3).create()

    // Count the users
    await database.assertCount('users', 3)
  })

  test('can make model instances without persisting', () => {
    const database = db().register(connection)

    // Create a user factory
    const userFactory = database.factory('users')
      .define({
        id: 1,
        name: 'Default User',
        email: 'user@example.com',
      })

    // Make a user without saving to the database
    const user = userFactory.make()

    // Assert on the user object
    expect(user).toHaveProperty('name', 'Default User')

    // The user should not exist in the database
    database.assertMissing('users', { id: 1 })
  })
})
