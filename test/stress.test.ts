import { loadConfig } from '../src/config'
import { describe, expect, test } from '../src/test'

// Simple function to test performance
function fibonacci(n: number): number {
  if (n <= 1)
    return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

// Helper for creating a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('Performance testing', () => {
  test('fibonacci function completes for small values', () => {
    const result = fibonacci(10)
    expect(result).toBe(55)
  })

  test('multiple operations can be executed in sequence', async () => {
    // Simulate a series of operations
    for (let i = 0; i < 5; i++) {
      const result = fibonacci(i)
      expect(result).toBeGreaterThanOrEqual(0)
      await delay(1) // Small delay to simulate work
    }
  })

  test('can handle object creation and manipulation', () => {
    const objects = []

    // Create a series of objects
    for (let i = 0; i < 100; i++) {
      objects.push({
        id: i,
        name: `Item ${i}`,
        value: Math.random(),
      })
    }

    expect(objects.length).toBe(100)

    // Perform operations on the objects
    const filtered = objects.filter(obj => obj.id % 2 === 0)
    expect(filtered.length).toBe(50)

    const mapped = filtered.map(obj => obj.value)
    expect(mapped.length).toBe(50)

    // Sort the values
    const sorted = [...mapped].sort((a, b) => a - b)
    expect(sorted.length).toBe(mapped.length)
    expect(sorted[0]).toBeLessThanOrEqual(sorted[sorted.length - 1])
  })
})

describe('Configuration for stress testing', () => {
  test('custom config can disable verbose mode', () => {
    const stressConfig = loadConfig({ verbose: false })
    expect(stressConfig.verbose).toBe(false)
  })
})

// Test async operations under load
test('handles multiple async operations', async () => {
  const promises = []

  // Create multiple promises
  for (let i = 0; i < 10; i++) {
    promises.push(delay(Math.random() * 5).then(() => i))
  }

  // Wait for all promises to resolve
  const results = await Promise.all(promises)

  // Verify results
  expect(results.length).toBe(10)
  expect(results.every(r => typeof r === 'number')).toBeTruthy()
})

// Test performance boundaries
test('can complete moderately complex operations', () => {
  // Create a large array
  const array = Array.from({ length: 1000 }, (_, i) => i)

  // Perform operations
  const sum = array.reduce((acc, val) => acc + val, 0)
  const expected = (999 * 1000) / 2 // Sum of 0 to 999

  expect(sum).toBe(expected)
})
