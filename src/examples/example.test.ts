import { best, describe, expect, it, test } from '../test'

// Example 1: Using the basic Jest-like API
test('basic addition using test', () => {
  expect(1 + 1).toBe(2)
})

// Example 2: Using describe for test grouping
describe('Math operations', () => {
  test('addition works', () => {
    expect(1 + 1).toBe(2)
  })

  test('subtraction works', () => {
    expect(3 - 1).toBe(2)
  })

  test('multiplication works', () => {
    expect(2 * 1).toBe(2)
  })
})

// Example 3: Using the Pest-like fluent API
test('using Pest-like fluent assertions', () => {
  // Chain assertions on the same value
  expect(2 + 2)
    .toBe(4)
    .toBeGreaterThan(3)
    .toBeLessThan(5)

  // Negated assertions
  expect('hello world')
    .toContain('hello')
    .not
    .toContain('goodbye')

  // Function testing
  const throwingFn = () => { throw new Error('boom!') }
  expect(throwingFn).toThrow()
})

// Example 4: Using the more Pest-like API with best()
const p = best()

p.test('using the full Pest-style API', () => {
  p.it(2 + 2)
    .toBe(4)
    .toBeGreaterThan(3)
    .toBeLessThan(5)

  p.it('hello world')
    .toContain('hello')
    .not
    .toContain('goodbye')
})

// Example 5: Nested describe blocks
p.describe('String operations', () => {
  p.test('concatenation works', () => {
    p.it('hello ' + 'world').toBe('hello world')
  })

  p.test('length calculation works', () => {
    p.it('hello'.length).toBe(5)
  })
})

// Example 6: Using custom assertion
test('custom assertions', () => {
  expect(42).assert((value) => {
    if (value !== 42) {
      throw new Error('Value is not the answer to everything!')
    }
  })
})
