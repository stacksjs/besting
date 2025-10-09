/**
 * Testing Utilities
 *
 * Enhanced testing utilities built on top of Bun's test runner.
 * Provides additional assertion methods and testing patterns.
 */

import { describe, expect as bunExpect, test } from 'bun:test'
import type { Matchers } from 'bun:test'

// Extend Bun's expect with custom matchers
interface CustomMatchers<T = any> extends Matchers<T> {
  toPass(fn: (value: T) => boolean, message?: string): void
  assert(fn: (value: T) => void): void
  withMessage(message: string): CustomMatchers<T>
  toStartWith(substring: string): void
  toEndWith(substring: string): void
  toBeEmpty(): void
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
        return (fn: (value: T) => boolean, message?: string) => {
          const result = fn(value)
          const msg = customMessage || message || 'Custom validation failed'
          if (!result) {
            throw new Error(msg)
          }
        }
      }

      if (prop === 'assert') {
        return (fn: (value: T) => void) => {
          try {
            fn(value)
          }
          catch (error) {
            if (customMessage) {
              throw new Error(customMessage)
            }
            throw error
          }
        }
      }

      if (prop === 'withMessage') {
        return (message: string) => {
          customMessage = message
          return new Proxy(target, handler)
        }
      }

      if (prop === 'toStartWith') {
        return (substring: string) => {
          if (typeof value !== 'string') {
            throw new Error('toStartWith can only be used with strings')
          }
          const result = value.startsWith(substring)
          if (isNegated) {
            bunExpect(result).toBe(false)
          }
          else {
            bunExpect(result).toBe(true)
          }
          return customExpect(value, isNegated)
        }
      }

      if (prop === 'toEndWith') {
        return (substring: string) => {
          if (typeof value !== 'string') {
            throw new Error('toEndWith can only be used with strings')
          }
          const result = value.endsWith(substring)
          if (isNegated) {
            bunExpect(result).toBe(false)
          }
          else {
            bunExpect(result).toBe(true)
          }
          return customExpect(value, isNegated)
        }
      }

      if (prop === 'toBeEmpty') {
        return () => {
          let length: number
          if (typeof value === 'string' || Array.isArray(value)) {
            length = value.length
          }
          else if (typeof value === 'object' && value !== null) {
            length = Object.keys(value).length
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
          return customExpect(value, isNegated)
        }
      }

      // For all existing Bun expect methods, wrap them to return customExpect for chaining
      const originalMethod = target[prop]
      if (typeof originalMethod === 'function') {
        return (...args: any[]) => {
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
export function best() {
  return {
    test: (name: string, fn: () => void | Promise<void>) => {
      return test(name, fn)
    },
    describe: (name: string, fn: () => void) => {
      return describe(name, fn)
    },
    it: <T>(value: T) => {
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
export function testGroup<T>(value: T, fn: (expect: CustomMatchers<T>) => void) {
  const expectValue = customExpect(value)
  fn(expectValue)
}

// Export custom utilities
export { customExpect as expect }

// Note: Import test utilities directly from 'bun:test' in your test files
// Do not re-export them here to avoid conflicts
