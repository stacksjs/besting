import { describe, expect, test } from '../src/test'

// Helper for creating a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('Error handling in tests', () => {
  // Test try/catch patterns
  test('can catch and test for specific errors', () => {
    // Function that throws a specific error
    const throwSpecificError = () => {
      throw new TypeError('This is a type error')
    }

    // We expect this to throw
    try {
      throwSpecificError()
      // If we get here, the function didn't throw and the test should fail
      expect(false).toBeTruthy()
    }
    catch (error: any) {
      expect(error).toBeInstanceOf(TypeError)
      expect(error.message).toBe('This is a type error')
    }
  })

  // Test async error handling
  test('can handle promise rejections', async () => {
    // Function that returns a rejected promise
    const rejectPromise = async () => {
      await delay(1)
      throw new Error('Promise rejected')
    }

    // We expect this to reject
    try {
      await rejectPromise()
      // If we get here, the promise didn't reject and the test should fail
      expect(false).toBeTruthy()
    }
    catch (error: any) {
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Promise rejected')
    }
  })

  // Test error assertions
  test('can test for error properties', () => {
    class CustomError extends Error {
      code: string

      constructor(message: string, code: string) {
        super(message)
        this.code = code
      }
    }

    const throwCustomError = () => {
      throw new CustomError('Custom error', 'ERR_CUSTOM')
    }

    expect(throwCustomError).toThrow()

    try {
      throwCustomError()
    }
    catch (error: any) {
      expect(error).toBeInstanceOf(CustomError)
      expect(error.message).toBe('Custom error')
      expect(error).toHaveProperty('code', 'ERR_CUSTOM')
    }
  })

  // Test error boundary patterns
  test('can verify error boundaries', () => {
    function divide(a: number, b: number): number {
      if (b === 0) {
        throw new Error('Division by zero')
      }
      return a / b
    }

    // Valid case
    expect(divide(10, 2)).toBe(5)

    // Error case
    expect(() => divide(10, 0)).toThrow('Division by zero')

    // Validate that the error contains expected information
    try {
      divide(10, 0)
    }
    catch (error: any) {
      expect(error.message).toContain('zero')
    }
  })
})

// Test exception stack traces
test('errors include stack traces', () => {
  function level3() {
    throw new Error('Deep error')
  }

  function level2() {
    level3()
  }

  function level1() {
    level2()
  }

  try {
    level1()
  }
  catch (error: any) {
    expect(error.message).toBe('Deep error')
    expect(error.stack).toBeDefined()
    expect(error.stack).toContain('level3')
  }
})

// Test error recovery
test('can recover from errors and continue testing', () => {
  let steps = []

  try {
    steps.push('step 1')
    throw new Error('Recoverable error')
  }
  catch (error) {
    steps.push('error caught')
  }

  steps.push('step 2')

  expect(steps).toEqual(['step 1', 'error caught', 'step 2'])
  expect(steps.length).toBe(3)
})
