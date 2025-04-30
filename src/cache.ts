import type { CacheStore, CacheTestCase } from './types'
import { expect } from './test'

/**
 * Default in-memory cache store implementation
 */
class MemoryCacheStore implements CacheStore {
  private cache: Map<string, { value: any, expires: number | null }> = new Map()

  async get(key: string): Promise<any> {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    if (item.expires !== null && item.expires < Date.now()) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expires = ttl ? Date.now() + ttl * 1000 : null
    this.cache.set(key, { value, expires })
  }

  async has(key: string): Promise<boolean> {
    const item = this.cache.get(key)

    if (!item) {
      return false
    }

    if (item.expires !== null && item.expires < Date.now()) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }
}

/**
 * Collection of registered cache stores
 */
const cacheStores: Record<string, CacheStore> = {
  memory: new MemoryCacheStore(),
}

/**
 * Cache testing implementation
 */
class CacheTest implements CacheTestCase {
  private _store: CacheStore

  constructor(storeName: string = 'memory') {
    if (!cacheStores[storeName]) {
      throw new Error(`Cache store '${storeName}' not found`)
    }
    this._store = cacheStores[storeName]
  }

  /**
   * Switch to a different cache store
   */
  store(name: string = 'memory'): CacheTestCase {
    if (!cacheStores[name]) {
      throw new Error(`Cache store '${name}' not found`)
    }
    const clone = new CacheTest(name)
    return clone
  }

  /**
   * Assert that a key exists in the cache
   */
  async assertHas(key: string): Promise<CacheTestCase> {
    const exists = await this._store.has(key)
    expect(exists).toBeTruthy()
    return this
  }

  /**
   * Assert that a key does not exist in the cache
   */
  async assertMissing(key: string): Promise<CacheTestCase> {
    const exists = await this._store.has(key)
    expect(exists).toBeFalsy()
    return this
  }

  /**
   * Alias for assertHas
   */
  async assertExists(key: string): Promise<CacheTestCase> {
    return this.assertHas(key)
  }

  /**
   * Alias for assertMissing
   */
  async assertNotExists(key: string): Promise<CacheTestCase> {
    return this.assertMissing(key)
  }

  /**
   * Get a value from the cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    return this._store.get(key)
  }

  /**
   * Set a value in the cache
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    return this._store.set(key, value, ttl)
  }

  /**
   * Check if a key exists in the cache
   */
  async has(key: string): Promise<boolean> {
    return this._store.has(key)
  }

  /**
   * Delete a key from the cache
   */
  async delete(key: string): Promise<boolean> {
    return this._store.delete(key)
  }

  /**
   * Clear the cache
   */
  async clear(): Promise<void> {
    return this._store.clear()
  }
}

/**
 * Register a custom cache store
 */
export function registerCacheStore(name: string, store: CacheStore): void {
  cacheStores[name] = store
}

/**
 * Get a cache test instance
 */
export function cache(storeName?: string): CacheTestCase {
  return new CacheTest(storeName)
}
