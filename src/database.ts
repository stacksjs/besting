import type { DatabaseConfig, DatabaseConnection, DatabaseFactory, MigrationFunction, SeederFunction } from './types'
import { expect } from './test'

/**
 * Database testing utilities for the Besting framework
 */

// Database connections cache
const connections: Record<string, DatabaseConnection> = {}

// Pending migrations and seeders
const migrations: Record<string, MigrationFunction[]> = {}
const seeders: Record<string, SeederFunction[]> = {}

/**
 * Create a new database testing instance
 */
export function db(name: string = 'default'): DatabaseTestCase {
  return new DatabaseTestCase(name)
}

/**
 * Define a migration for a specific database
 */
export function migration(callback: MigrationFunction, connectionName: string = 'default'): void {
  if (!migrations[connectionName]) {
    migrations[connectionName] = []
  }
  migrations[connectionName].push(callback)
}

/**
 * Define a seeder for a specific database
 */
export function seeder(callback: SeederFunction, connectionName: string = 'default'): void {
  if (!seeders[connectionName]) {
    seeders[connectionName] = []
  }
  seeders[connectionName].push(callback)
}

/**
 * DatabaseTestCase implementation
 */
export class DatabaseTestCase {
  private _connectionName: string
  private _connection: DatabaseConnection | null = null
  private _trx: any = null

  constructor(connectionName: string = 'default') {
    this._connectionName = connectionName
  }

  /**
   * Get the database connection
   */
  async getConnection(): Promise<DatabaseConnection> {
    if (!this._connection) {
      if (connections[this._connectionName]) {
        this._connection = connections[this._connectionName]
      }
      else {
        throw new Error(`No connection defined for "${this._connectionName}". Please register a connection first.`)
      }
    }
    return this._connection
  }

  /**
   * Register a database connection
   */
  register(connection: DatabaseConnection): this {
    connections[this._connectionName] = connection
    this._connection = connection
    return this
  }

  /**
   * Begin a database transaction
   */
  async beginTransaction(): Promise<this> {
    const connection = await this.getConnection()
    if (this._trx) {
      throw new Error('Transaction already in progress')
    }

    this._trx = await connection.beginTransaction()
    return this
  }

  /**
   * Commit the current transaction
   */
  async commitTransaction(): Promise<this> {
    if (!this._trx) {
      throw new Error('No transaction in progress')
    }

    await this._trx.commit()
    this._trx = null
    return this
  }

  /**
   * Rollback the current transaction
   */
  async rollbackTransaction(): Promise<this> {
    if (!this._trx) {
      throw new Error('No transaction in progress')
    }

    await this._trx.rollback()
    this._trx = null
    return this
  }

  /**
   * Run database migrations
   */
  async migrate(): Promise<this> {
    const connection = await this.getConnection()

    // Run pending migrations for this connection
    if (migrations[this._connectionName]) {
      for (const migrationFn of migrations[this._connectionName]) {
        await migrationFn(connection)
      }
    }

    return this
  }

  /**
   * Run database seeders
   */
  async seed(): Promise<this> {
    const connection = await this.getConnection()

    // Run pending seeders for this connection
    if (seeders[this._connectionName]) {
      for (const seederFn of seeders[this._connectionName]) {
        await seederFn(connection)
      }
    }

    return this
  }

  /**
   * Reset the database (migrate:fresh)
   */
  async reset(): Promise<this> {
    const connection = await this.getConnection()

    // Drop all tables
    await connection.dropAllTables()

    // Run migrations again
    await this.migrate()

    return this
  }

  /**
   * Refresh the database (migrate:refresh)
   */
  async refresh(): Promise<this> {
    const connection = await this.getConnection()

    // Rollback all migrations
    await connection.rollbackMigrations()

    // Run migrations again
    await this.migrate()

    return this
  }

  /**
   * Execute raw SQL query
   */
  async raw(sql: string, params: any[] = []): Promise<any> {
    const connection = await this.getConnection()

    if (this._trx) {
      return this._trx.raw(sql, params)
    }

    return connection.raw(sql, params)
  }

  /**
   * Select data from the database
   */
  async select(table: string, columns: string[] = ['*'], where: Record<string, any> = {}): Promise<any[]> {
    const connection = await this.getConnection()
    const queryBuilder = this._trx ? this._trx(table) : connection.table(table)

    return queryBuilder.select(columns).where(where)
  }

  /**
   * Insert data into the database
   */
  async insert(table: string, data: Record<string, any> | Record<string, any>[]): Promise<any> {
    const connection = await this.getConnection()
    const queryBuilder = this._trx ? this._trx(table) : connection.table(table)

    return queryBuilder.insert(data)
  }

  /**
   * Update data in the database
   */
  async update(table: string, data: Record<string, any>, where: Record<string, any>): Promise<number> {
    const connection = await this.getConnection()
    const queryBuilder = this._trx ? this._trx(table) : connection.table(table)

    return queryBuilder.update(data).where(where)
  }

  /**
   * Delete data from the database
   */
  async delete(table: string, where: Record<string, any>): Promise<number> {
    const connection = await this.getConnection()
    const queryBuilder = this._trx ? this._trx(table) : connection.table(table)

    return queryBuilder.delete().where(where)
  }

  /**
   * Assert that a record exists in the database
   */
  async assertExists(table: string, where: Record<string, any>): Promise<this> {
    const results = await this.select(table, ['*'], where)
    expect(results.length).toBeGreaterThan(0)
    return this
  }

  /**
   * Assert that a record does not exist in the database
   */
  async assertMissing(table: string, where: Record<string, any>): Promise<this> {
    const results = await this.select(table, ['*'], where)
    expect(results.length).toBe(0)
    return this
  }

  /**
   * Assert that a record has specific column values
   */
  async assertSame(table: string, where: Record<string, any>, values: Record<string, any>): Promise<this> {
    const results = await this.select(table, Object.keys(values), where)

    if (results.length === 0) {
      throw new Error(`No matching record found in table "${table}"`)
    }

    const record = results[0]
    for (const [key, value] of Object.entries(values)) {
      expect(record[key]).toEqual(value)
    }

    return this
  }

  /**
   * Count records in a table
   */
  async count(table: string, where: Record<string, any> = {}): Promise<number> {
    const connection = await this.getConnection()
    const queryBuilder = this._trx ? this._trx(table) : connection.table(table)

    const result = await queryBuilder.count('* as total').where(where).first()
    return result.total
  }

  /**
   * Assert the count of records in a table
   */
  async assertCount(table: string, expected: number, where: Record<string, any> = {}): Promise<this> {
    const count = await this.count(table, where)
    expect(count).toBe(expected)
    return this
  }

  /**
   * Create a factory for a model
   */
  factory<T>(model: string): DatabaseFactory<T> {
    return new Factory<T>(this, model)
  }
}

/**
 * Factory class for creating database records
 */
class Factory<T> implements DatabaseFactory<T> {
  private _db: DatabaseTestCase
  private _model: string
  private _states: Record<string, (data: Record<string, any>) => Record<string, any>> = {}
  private _defaultState: Record<string, any> = {}
  private _count: number = 1
  private _appliedStates: string[] = []

  constructor(db: DatabaseTestCase, model: string) {
    this._db = db
    this._model = model
  }

  /**
   * Define the default state for the factory
   */
  define(attributes: Record<string, any>): this {
    this._defaultState = attributes
    return this
  }

  /**
   * Define a state transformation for the factory
   */
  state(name: string, callback: (data: Record<string, any>) => Record<string, any>): this {
    this._states[name] = callback
    return this
  }

  /**
   * Apply a state to the factory
   */
  has(state: string): this {
    this._appliedStates.push(state)
    return this
  }

  /**
   * Set the number of models to create
   */
  count(n: number): this {
    this._count = n
    return this
  }

  /**
   * Create and persist model(s) to the database
   */
  async create(attributes: Partial<T> = {}): Promise<T | T[]> {
    const data = this._makeAttributes(attributes)

    if (this._count === 1) {
      await this._db.insert(this._model, data as Record<string, any>)
      return data as T
    }

    const items: T[] = []
    for (let i = 0; i < this._count; i++) {
      const item = this._makeAttributes(attributes)
      items.push(item as T)
    }

    await this._db.insert(this._model, items as Record<string, any>[])
    return items
  }

  /**
   * Make model attributes but don't persist to database
   */
  make(attributes: Partial<T> = {}): T | T[] {
    if (this._count === 1) {
      return this._makeAttributes(attributes) as T
    }

    const items: T[] = []
    for (let i = 0; i < this._count; i++) {
      const item = this._makeAttributes(attributes)
      items.push(item as T)
    }

    return items
  }

  /**
   * Generate attributes based on the factory definition and states
   */
  private _makeAttributes(overrides: Partial<T>): Record<string, any> {
    let attributes = { ...this._defaultState }

    // Apply states
    for (const state of this._appliedStates) {
      if (this._states[state]) {
        attributes = this._states[state](attributes)
      }
    }

    // Apply overrides
    return { ...attributes, ...overrides }
  }
}

/**
 * Database transaction wrapper for tests
 */
export function useTransaction(
  callback: (db: DatabaseTestCase) => Promise<void>,
  connectionName: string = 'default',
): () => Promise<void> {
  return async () => {
    const database = db(connectionName)

    try {
      await database.beginTransaction()
      await callback(database)
    }
    finally {
      // Always try to rollback the transaction
      try {
        await database.rollbackTransaction()
      }
      catch (rollbackError) {
        // If we can't rollback, just log it
        console.error('Failed to rollback transaction:', rollbackError)
      }
    }
  }
}
