import { defaultConfig, loadConfig } from '../src/config'
import { afterEach, beforeEach, best, describe, expect, it, test, testGroup } from '../src/test'

// Test basic assertion functionality
test('basic assertions work', () => {
  expect(true).toBeTruthy()
  expect(false).toBeFalsy()
  expect(1 + 1).toBe(2)
  expect({ a: 1 }).toEqual({ a: 1 })
  expect([1, 2, 3]).toContain(2)
  expect('hello world').toMatch(/world/)
})

// Test the negation functionality
test('negated assertions work', () => {
  expect(false).not.toBeTruthy()
  expect(true).not.toBeFalsy()
  expect(1 + 1).not.toBe(3)
  expect({ a: 1 }).not.toEqual({ a: 2 })
  expect([1, 2, 3]).not.toContain(4)
  expect('hello world').not.toMatch(/universe/)
})

// Test numeric assertions
test('numeric assertions work', () => {
  expect(5).toBeGreaterThan(3)
  expect(5).toBeGreaterThanOrEqual(5)
  expect(3).toBeLessThan(5)
  expect(3).toBeLessThanOrEqual(3)
  expect(0.1 + 0.2).toBeCloseTo(0.3)
})

// Test string assertions
test('string assertions work', () => {
  expect('hello world').toContain('world')
  expect('hello world').toStartWith('hello')
  expect('hello world').toEndWith('world')
  expect('').toBeEmpty()
  expect('hello').toHaveLength(5)
})

// Test object and array assertions
test('object and array assertions work', () => {
  expect({}).toBeEmpty()
  expect({ name: 'test' }).toHaveProperty('name')
  expect({ name: 'test' }).toHaveProperty('name', 'test')
  expect([]).toBeEmpty()
  expect([1, 2, 3]).toHaveLength(3)
})

// Test exception assertions
test('exception assertions work', () => {
  const throwingFn = () => { throw new Error('boom!') }
  expect(throwingFn).toThrow()
  expect(throwingFn).toThrow('boom!')

  const nonThrowingFn = () => { return 'safe' }
  expect(nonThrowingFn).not.toThrow()
})

// Test type assertions
test('type assertions work', () => {
  expect(null).toBeNull()
  expect(undefined).toBeUndefined()
  expect('defined').toBeDefined()
  expect(Number.NaN).toBeNaN()
  expect(new Date()).toBeInstanceOf(Date)
})

// Test custom assertions
test('custom assertions work', () => {
  expect(42).toPass(value => value === 42, 'Value should be 42')

  expect(42).assert((value) => {
    if (value !== 42) {
      throw new Error('Value is not 42!')
    }
  })
})

// Test describe blocks
describe('describe blocks', () => {
  let counter = 0

  beforeEach(() => {
    counter = 0
  })

  test('counter starts at 0', () => {
    expect(counter).toBe(0)
  })

  test('counter can be incremented', () => {
    counter += 1
    expect(counter).toBe(1)
  })

  afterEach(() => {
    // Verify counter was reset between tests
    expect(counter).toBeLessThanOrEqual(1)
  })
})

// Test the best() API
describe('best API', () => {
  const p = best()

  p.test('it works with the best API', () => {
    p.it(1 + 1).toBe(2)
    p.it('hello').toHaveLength(5)
  })

  p.describe('nested in best API', () => {
    p.test('it supports nested describes', () => {
      p.it(true).toBeTruthy()
    })
  })
})

// Test the testGroup API
test('testGroup API works', () => {
  testGroup('hello world', (str) => {
    str.toContain('hello')
      .toContain('world')
      .toHaveLength(11)
      .toStartWith('hello')
      .toEndWith('world')
  })
})

// Test the config functionality
test('config API works', () => {
  // Default config
  expect(defaultConfig.verbose).toBe(true)

  // Custom config
  const customConfig = loadConfig({ verbose: false })
  expect(customConfig.verbose).toBe(false)
})

// Test chaining assertions
test('assertion chaining works', () => {
  expect('hello world')
    .toContain('hello')
    .toContain('world')
    .toHaveLength(11)
    .toStartWith('hello')
    .toEndWith('world')
    .not
    .toBeEmpty()
})

// Test async functionality
test('async tests work', async () => {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Wait for a small delay
  await delay(1)

  expect(true).toBeTruthy()
})

// Test skip functionality
test.skip('this test should be skipped', () => {
  // This shouldn't run
  expect(false).toBeTruthy()
})

// Test conditional test execution
const condition = false
test.if(condition)('this test should not run based on condition', () => {
  // This shouldn't run because condition is false
  expect(false).toBeTruthy()
})

test.skipIf(condition)('this test should run based on skip condition', () => {
  // This should run because skipIf condition is false
  expect(true).toBeTruthy()
})

// Test withMessage for custom failure messages
test('custom failure messages work', () => {
  expect(42).withMessage('The answer should be 42').toBe(42)
})

// Test mock functions
test('mock functions work', () => {
  // Create a simple object with methods
  class Calculator {
    add(a: number, b: number) {
      return a + b
    }

    multiply(a: number, b: number) {
      return a * b
    }
  }

  const calc = new Calculator()

  // Test the real implementation
  expect(calc.add(2, 3)).toBe(5)

  // Mock the add method
  const originalAdd = calc.add
  calc.add = function (a, b) { return 42 }

  expect(calc.add(2, 3)).toBe(42)

  // Restore the original method
  calc.add = originalAdd
  expect(calc.add(2, 3)).toBe(5)
})
