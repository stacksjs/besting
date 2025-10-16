/**
 * Testing Utilities
 *
 * Enhanced testing utilities built on top of Bun's test runner.
 * Provides additional assertion methods and testing patterns.
 */

import { expect as bunExpect, describe, test } from 'bun:test'

// Extend Bun's expect with custom matchers
// We override all Matchers methods to return CustomMatchers for chaining
interface CustomMatchers<T = any> {
  // Override Bun's methods to return CustomMatchers for chaining
  toBe: (expected: T) => CustomMatchers<T>
  toEqual: (expected: T) => CustomMatchers<T>
  toStrictEqual: (expected: T) => CustomMatchers<T>
  toContain: (item: any) => CustomMatchers<T>
  toMatch: (pattern: string | RegExp) => CustomMatchers<T>
  toBeTruthy: () => CustomMatchers<T>
  toBeFalsy: () => CustomMatchers<T>
  toBeNull: () => CustomMatchers<T>
  toBeUndefined: () => CustomMatchers<T>
  toBeDefined: () => CustomMatchers<T>
  toBeNaN: () => CustomMatchers<T>
  toBeGreaterThan: (expected: number | bigint) => CustomMatchers<T>
  toBeGreaterThanOrEqual: (expected: number | bigint) => CustomMatchers<T>
  toBeLessThan: (expected: number | bigint) => CustomMatchers<T>
  toBeLessThanOrEqual: (expected: number | bigint) => CustomMatchers<T>
  toBeCloseTo: (expected: number, numDigits?: number) => CustomMatchers<T>
  toHaveLength: (length: number) => CustomMatchers<T>
  toHaveProperty: (keyPath: string | string[], value?: any) => CustomMatchers<T>
  toBeInstanceOf: (expected: any) => CustomMatchers<T>
  toThrow: (expected?: string | RegExp | Error) => CustomMatchers<T>

  // Negation support
  not: CustomMatchers<T>

  // Custom methods
  toPass: (fn: (value: T) => boolean, message?: string) => CustomMatchers<T>
  assert: (fn: (value: T) => void) => CustomMatchers<T>
  withMessage: (message: string) => CustomMatchers<T>
  toStartWith: (substring: string) => CustomMatchers<T>
  toEndWith: (substring: string) => CustomMatchers<T>
  toBeEmpty: () => CustomMatchers<T>
}

// Create a custom expect that returns chainable assertions
export function customExpect<T>(value: T, isNegated = false): CustomMatchers<T> {
  const baseExpect = bunExpect(value) as any
  let customMessage: string | undefined

  // Create a proxy to intercept all method calls
  const handler: ProxyHandler<any> = {
    get(target, prop: string) {
      // Handle 'not' property specially to maintain chaining
      if (prop === 'not') {
        // Create a new customExpect with negation flag
        return customExpect(value, !isNegated)
      }

      // Handle custom methods
      if (prop === 'toPass') {
        return (fn: (value: T) => boolean, message?: string): CustomMatchers<T> => {
          const result = fn(value)
          const msg = customMessage || message || 'Custom validation failed'
          if (!result) {
            throw new Error(msg)
          }
          return customExpect(value, isNegated)
        }
      }

      if (prop === 'assert') {
        return (fn: (value: T) => void): CustomMatchers<T> => {
          try {
            fn(value)
          }
          catch (error) {
            if (customMessage) {
              throw new Error(customMessage)
            }
            throw error
          }
          return customExpect(value, isNegated)
        }
      }

      if (prop === 'withMessage') {
        return (message: string): CustomMatchers<T> => {
          customMessage = message
          return new Proxy(target, handler)
        }
      }

      if (prop === 'toStartWith') {
        return (substring: string): CustomMatchers<T> => {
          if (typeof value !== 'string') {
            throw new TypeError('toStartWith can only be used with strings')
          }
          const result = (value as string).startsWith(substring)
          if (isNegated) {
            bunExpect(result).toBe(false)
          }
          else {
            bunExpect(result).toBe(true)
          }
          return customExpect(value, isNegated) as CustomMatchers<T>
        }
      }

      if (prop === 'toEndWith') {
        return (substring: string): CustomMatchers<T> => {
          if (typeof value !== 'string') {
            throw new TypeError('toEndWith can only be used with strings')
          }
          const result = (value as string).endsWith(substring)
          if (isNegated) {
            bunExpect(result).toBe(false)
          }
          else {
            bunExpect(result).toBe(true)
          }
          return customExpect(value, isNegated) as CustomMatchers<T>
        }
      }

      if (prop === 'toBeEmpty') {
        return (): CustomMatchers<T> => {
          let length: number
          if (typeof value === 'string' || Array.isArray(value)) {
            length = (value as any).length
          }
          else if (typeof value === 'object' && value !== null) {
            length = Object.keys(value as object).length
          }
          else {
            throw new Error('toBeEmpty can only be used with strings, arrays, or objects')
          }

          if (isNegated) {
            bunExpect(length).not.toBe(0)
          }
          else {
            bunExpect(length).toBe(0)
          }
          return customExpect(value, isNegated) as CustomMatchers<T>
        }
      }

      // For all existing Bun expect methods, wrap them to return customExpect for chaining
      const originalMethod = target[prop]
      if (typeof originalMethod === 'function') {
        return (...args: any[]): CustomMatchers<T> => {
          originalMethod.apply(target, args)
          // Return customExpect for chaining (maintaining current negation state)
          return customExpect(value, isNegated)
        }
      }

      return originalMethod
    },
  }

  // If negated, start with the baseExpect.not
  const startTarget = isNegated ? baseExpect.not : baseExpect
  return new Proxy(startTarget, handler)
}

/**
 * Best API - Alternative testing syntax
 *
 * Provides a fluent API for writing tests:
 * const p = best()
 * p.test('test name', () => {
 *   p.it(value).toBe(expected)
 * })
 */
export function best(): {
  test: (name: string, fn: () => void | Promise<void>) => void
  describe: (name: string, fn: () => void) => void
  it: <T>(value: T) => CustomMatchers<T>
} {
  return {
    test: (name: string, fn: () => void | Promise<void>): void => {
      return test(name, fn)
    },
    describe: (name: string, fn: () => void): void => {
      return describe(name, fn)
    },
    it: <T>(value: T): CustomMatchers<T> => {
      return customExpect(value)
    },
  }
}

/**
 * Test Group API - Focus testing on a specific value
 *
 * Provides a way to run multiple assertions on the same value:
 * testGroup(value, (v) => {
 *   v.toBe(expected)
 *   v.toHaveLength(5)
 * })
 */
export function testGroup<T>(value: T, fn: (expect: CustomMatchers<T>) => void): void {
  const expectValue = customExpect(value)
  fn(expectValue)
}

// Export custom utilities
export { customExpect as expect }

// Note: Import test utilities directly from 'bun:test' in your test files
// Do not re-export them here to avoid conflicts
