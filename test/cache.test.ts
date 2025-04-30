import type { CacheStore } from '../src/types'
import { beforeEach, describe, expect, test } from 'besting'
import { cache, registerCacheStore } from '../src/cache'

// Create a mock cache store for testing
class MockCacheStore implements CacheStore {
  private cache: Map<string, any> = new Map()

  async get(key: string): Promise<any> {
    return this.cache.get(key) || null
  }

  async set(key: string, value: any): Promise<void> {
    this.cache.set(key, value)
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key)
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }
}

describe('Cache Testing', () => {
  beforeEach(async () => {
    // Register a mock cache store for testing
    registerCacheStore('mock', new MockCacheStore())

    // Clear the default memory store
    await cache().clear()
  })

  test('can store and retrieve values', async () => {
    const cacheStore = cache()

    // Set a value
    await cacheStore.set('key', 'value')

    // Check that the key exists
    const exists = await cacheStore.has('key')
    expect(exists).toBeTruthy()

    // Get the value
    const value = await cacheStore.get('key')
    expect(value).toBe('value')
  })

  test('can store and retrieve complex values', async () => {
    const cacheStore = cache()
    const complexValue = { user: { id: 1, name: 'Test', roles: ['admin', 'user'] } }

    // Set a complex value
    await cacheStore.set('complex', complexValue)

    // Get the complex value
    const value = await cacheStore.get<typeof complexValue>('complex')

    expect(value).toEqual(complexValue)
    expect(value?.user.id).toBe(1)
    expect(value?.user.name).toBe('Test')
    expect(value?.user.roles).toEqual(['admin', 'user'])
  })

  test('can use time-to-live for values', async () => {
    const cacheStore = cache()

    // Set a value with TTL of 50ms
    await cacheStore.set('ttl-key', 'temporary', 0.05)

    // Initially the value should exist
    expect(await cacheStore.has('ttl-key')).toBeTruthy()

    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 60))

    // After TTL expires, the value should be gone
    expect(await cacheStore.has('ttl-key')).toBeFalsy()
  })

  test('can delete values', async () => {
    const cacheStore = cache()

    // Set a value
    await cacheStore.set('delete-me', 'value')

    // Confirm it exists
    expect(await cacheStore.has('delete-me')).toBeTruthy()

    // Delete the value
    await cacheStore.delete('delete-me')

    // Confirm it's gone
    expect(await cacheStore.has('delete-me')).toBeFalsy()
  })

  test('can clear all values', async () => {
    const cacheStore = cache()

    // Set multiple values
    await cacheStore.set('key1', 'value1')
    await cacheStore.set('key2', 'value2')

    // Confirm they exist
    expect(await cacheStore.has('key1')).toBeTruthy()
    expect(await cacheStore.has('key2')).toBeTruthy()

    // Clear all values
    await cacheStore.clear()

    // Confirm they're gone
    expect(await cacheStore.has('key1')).toBeFalsy()
    expect(await cacheStore.has('key2')).toBeFalsy()
  })

  test('can use different cache stores', async () => {
    // Use the mock store
    const mockStore = cache('mock')

    // Set a value in the mock store
    await mockStore.set('mock-key', 'mock-value')

    // Value should exist in mock store
    expect(await mockStore.has('mock-key')).toBeTruthy()

    // Value should not exist in default memory store
    const memoryStore = cache()
    expect(await memoryStore.has('mock-key')).toBeFalsy()
  })

  test('assertHas passes when key exists', async () => {
    const cacheStore = cache()

    // Set a value
    await cacheStore.set('assert-has', 'value')

    // Assert should pass
    await cacheStore.assertHas('assert-has')
  })

  test('assertMissing passes when key does not exist', async () => {
    const cacheStore = cache()

    // Assert should pass for non-existent key
    await cacheStore.assertMissing('non-existent')
  })

  test('assertExists is an alias for assertHas', async () => {
    const cacheStore = cache()

    // Set a value
    await cacheStore.set('assert-exists', 'value')

    // Assert should pass
    await cacheStore.assertExists('assert-exists')
  })

  test('assertNotExists is an alias for assertMissing', async () => {
    const cacheStore = cache()

    // Assert should pass for non-existent key
    await cacheStore.assertNotExists('non-existent')
  })
})
