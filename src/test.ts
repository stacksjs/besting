import { expect as bunExpect, test as bunTest, describe as bunDescribe, beforeAll as bunBeforeAll, afterAll as bunAfterAll, beforeEach as bunBeforeEach, afterEach as bunAfterEach, mock as bunMock, spyOn as bunSpyOn } from 'bun:test';

/**
 * Besting - A Pest-inspired testing utility for Bun
 */

type TestCallback = () => void | Promise<void>;
type ExpectCallback<T> = (value: T) => void;

// Define test function types with their modifiers
interface TestFn {
  (description: string, callback: TestCallback): void;
  skip: (description: string, callback: TestCallback) => void;
  only: (description: string, callback: TestCallback) => void;
  todo: (description: string, callback?: TestCallback) => void;
  each: (cases: any[]) => (description: string, ...rest: any[]) => void;
  if: (condition: any) => (description: string, callback: TestCallback, timeout?: number) => void;
  skipIf: (condition: any) => (description: string, callback: TestCallback, timeout?: number) => void;
  todoIf: (condition: any) => (description: string, callback: TestCallback, timeout?: number) => void;
}

// Define describe function types with their modifiers
interface DescribeFn {
  (description: string, callback: () => void): void;
  skip: (description: string, callback: () => void) => void;
  only: (description: string, callback: () => void) => void;
  each: (cases: any[]) => (description: string, ...rest: any[]) => void;
  if: (condition: any) => (description: string, callback: () => void) => void;
  skipIf: (condition: any) => (description: string, callback: () => void) => void;
  todoIf: (condition: any) => (description: string, callback: () => void) => void;
}

/**
 * Represents a test case with fluent assertions
 */
class TestCase<T = any> {
  private _value: T;
  private _negated = false;
  private _customMessage?: string;

  constructor(value: T) {
    this._value = value;
  }

  /**
   * Negates the next assertion
   */
  get not(): this {
    this._negated = !this._negated;
    return this;
  }

  /**
   * Add a custom message to the next assertion
   */
  withMessage(message: string): this {
    this._customMessage = message;
    return this;
  }

  /**
   * Assert that the value is truthy
   */
  toBeTruthy(): this {
    if (this._negated) {
      bunExpect(this._value).not.toBeTruthy();
    } else {
      bunExpect(this._value).toBeTruthy();
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that the value is falsy
   */
  toBeFalsy(): this {
    if (this._negated) {
      bunExpect(this._value).not.toBeFalsy();
    } else {
      bunExpect(this._value).toBeFalsy();
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that the value equals the expected value
   */
  toEqual(expected: any): this {
    if (this._negated) {
      bunExpect(this._value).not.toEqual(expected);
    } else {
      bunExpect(this._value).toEqual(expected);
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that the value is strictly equal to the expected value
   */
  toBe(expected: any): this {
    if (this._negated) {
      bunExpect(this._value).not.toBe(expected);
    } else {
      bunExpect(this._value).toBe(expected);
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that the value is greater than the expected value
   */
  toBeGreaterThan(expected: number): this {
    if (this._negated) {
      bunExpect(this._value).not.toBeGreaterThan(expected);
    } else {
      bunExpect(this._value).toBeGreaterThan(expected);
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that the value is greater than or equal to the expected value
   */
  toBeGreaterThanOrEqual(expected: number): this {
    if (this._negated) {
      bunExpect(this._value).not.toBeGreaterThanOrEqual(expected);
    } else {
      bunExpect(this._value).toBeGreaterThanOrEqual(expected);
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that the value is less than the expected value
   */
  toBeLessThan(expected: number): this {
    if (this._negated) {
      bunExpect(this._value).not.toBeLessThan(expected);
    } else {
      bunExpect(this._value).toBeLessThan(expected);
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that the value is less than or equal to the expected value
   */
  toBeLessThanOrEqual(expected: number): this {
    if (this._negated) {
      bunExpect(this._value).not.toBeLessThanOrEqual(expected);
    } else {
      bunExpect(this._value).toBeLessThanOrEqual(expected);
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that the value contains the expected substring or item
   */
  toContain(expected: any): this {
    if (this._negated) {
      bunExpect(this._value).not.toContain(expected);
    } else {
      bunExpect(this._value).toContain(expected);
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that the value matches a regular expression
   */
  toMatch(pattern: RegExp | string): this {
    if (this._negated) {
      bunExpect(this._value).not.toMatch(pattern);
    } else {
      bunExpect(this._value).toMatch(pattern);
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that the function throws when called
   */
  toThrow(expected?: any): this {
    if (typeof this._value !== 'function') {
      throw new Error('toThrow() can only be used on functions');
    }

    if (this._negated) {
      if (expected !== undefined) {
        bunExpect(this._value).not.toThrow(expected);
      } else {
        bunExpect(this._value).not.toThrow();
      }
    } else {
      if (expected !== undefined) {
        bunExpect(this._value).toThrow(expected);
      } else {
        bunExpect(this._value).toThrow();
      }
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that the value is an instance of the expected constructor
   */
  toBeInstanceOf(constructor: any): this {
    if (this._negated) {
      bunExpect(this._value).not.toBeInstanceOf(constructor);
    } else {
      bunExpect(this._value).toBeInstanceOf(constructor);
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that the object has a property with the given name
   */
  toHaveProperty(name: string, value?: any): this {
    if (this._negated) {
      if (value !== undefined) {
        bunExpect(this._value).not.toHaveProperty(name, value);
      } else {
        bunExpect(this._value).not.toHaveProperty(name);
      }
    } else {
      if (value !== undefined) {
        bunExpect(this._value).toHaveProperty(name, value);
      } else {
        bunExpect(this._value).toHaveProperty(name);
      }
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that the value has the expected length
   */
  toHaveLength(length: number): this {
    if (this._negated) {
      bunExpect(this._value).not.toHaveLength(length);
    } else {
      bunExpect(this._value).toHaveLength(length);
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that the value is null
   */
  toBeNull(): this {
    if (this._negated) {
      bunExpect(this._value).not.toBeNull();
    } else {
      bunExpect(this._value).toBeNull();
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that the value is undefined
   */
  toBeUndefined(): this {
    if (this._negated) {
      bunExpect(this._value).not.toBeUndefined();
    } else {
      bunExpect(this._value).toBeUndefined();
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that the value is defined (not undefined)
   */
  toBeDefined(): this {
    if (this._negated) {
      bunExpect(this._value).not.toBeDefined();
    } else {
      bunExpect(this._value).toBeDefined();
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that the value is NaN
   */
  toBeNaN(): this {
    if (this._negated) {
      bunExpect(this._value).not.toBeNaN();
    } else {
      bunExpect(this._value).toBeNaN();
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that the value approximately equals the expected value
   */
  toBeCloseTo(expected: number, precision?: number): this {
    if (this._negated) {
      if (precision !== undefined) {
        bunExpect(this._value).not.toBeCloseTo(expected, precision);
      } else {
        bunExpect(this._value).not.toBeCloseTo(expected);
      }
    } else {
      if (precision !== undefined) {
        bunExpect(this._value).toBeCloseTo(expected, precision);
      } else {
        bunExpect(this._value).toBeCloseTo(expected);
      }
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Add a custom assertion
   */
  assert(callback: ExpectCallback<T>): this {
    callback(this._value);
    return this;
  }

  /**
   * Get the raw value
   */
  get value(): T {
    return this._value;
  }

  // Added Pest-style alias methods

  /**
   * Assert that a string begins with the given prefix (Pest-style alias)
   */
  toStartWith(prefix: string): this {
    if (typeof this._value !== 'string') {
      throw new Error('toStartWith() can only be used on strings');
    }

    if (this._negated) {
      bunExpect(this._value).not.toMatch(new RegExp(`^${escapeRegExp(prefix)}`));
    } else {
      bunExpect(this._value).toMatch(new RegExp(`^${escapeRegExp(prefix)}`));
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that a string ends with the given suffix (Pest-style alias)
   */
  toEndWith(suffix: string): this {
    if (typeof this._value !== 'string') {
      throw new Error('toEndWith() can only be used on strings');
    }

    if (this._negated) {
      bunExpect(this._value).not.toMatch(new RegExp(`${escapeRegExp(suffix)}$`));
    } else {
      bunExpect(this._value).toMatch(new RegExp(`${escapeRegExp(suffix)}$`));
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that the value is empty (Pest-style alias)
   */
  toBeEmpty(): this {
    const isEmpty =
      (this._value === '') ||
      (Array.isArray(this._value) && this._value.length === 0) ||
      (typeof this._value === 'object' && this._value !== null && Object.keys(this._value).length === 0);

    if (this._negated) {
      bunExpect(isEmpty).toBeFalsy();
    } else {
      bunExpect(isEmpty).toBeTruthy();
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }

  /**
   * Assert that the value passes a custom validation function (Pest-style pass)
   */
  toPass(validator: (value: T) => boolean, message?: string): this {
    const passes = validator(this._value);
    const assertionMessage = message || 'Expected value to pass validation';

    if (this._negated) {
      bunExpect(passes).toBeFalsy();
    } else {
      bunExpect(passes).toBeTruthy();
    }
    this._negated = false;
    this._customMessage = undefined;
    return this;
  }
}

// Helper function to escape special characters for RegExp
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Create a test with a description and callback
 */
export const test: TestFn = Object.assign(
  (description: string, callback: TestCallback): void => {
    bunTest(description, callback);
  },
  {
    skip: bunTest.skip,
    only: bunTest.only,
    todo: bunTest.todo,
    each: bunTest.each,
    if: bunTest.if,
    skipIf: bunTest.skipIf,
    todoIf: bunTest.todoIf,
  }
);

/**
 * Create a test that focuses on a specific value
 */
export const it: TestFn = Object.assign(
  (description: string, callback: () => any): void => {
    bunTest(description, () => {
      callback();
    });
  },
  {
    skip: bunTest.skip,
    only: bunTest.only,
    todo: bunTest.todo,
    each: bunTest.each,
    if: bunTest.if,
    skipIf: bunTest.skipIf,
    todoIf: bunTest.todoIf,
  }
);

/**
 * Create a test suite with a description
 */
export const describe: DescribeFn = Object.assign(
  (description: string, callback: () => void): void => {
    bunDescribe(description, callback);
  },
  {
    skip: bunDescribe.skip,
    only: bunDescribe.only,
    each: bunDescribe.each,
    if: bunDescribe.if,
    skipIf: bunDescribe.skipIf,
    todoIf: bunDescribe.todoIf,
  }
);

/**
 * Create a test case that focuses on a specific value
 */
export function expect<T>(value: T): TestCase<T> {
  return new TestCase(value);
}

// Lifecycle hooks
export const beforeAll: typeof bunBeforeAll = bunBeforeAll;
export const afterAll: typeof bunAfterAll = bunAfterAll;
export const beforeEach: typeof bunBeforeEach = bunBeforeEach;
export const afterEach: typeof bunAfterEach = bunAfterEach;

// Mocking utilities
export const mock: typeof bunMock = bunMock;
export const spyOn: typeof bunSpyOn = bunSpyOn;

/**
 * Pest-style assertion helpers
 */

// Create a Pest-inspired "expect" function that wraps a value for testing
export function expectValue<T>(value: T): TestCase<T> {
  return new TestCase(value);
}

// Define types for PestSuite skip and only
interface PestSkip {
  test: (description: string, callback: TestCallback) => PestSuite;
}

interface PestOnly {
  test: (description: string, callback: TestCallback) => PestSuite;
}

export class PestSuite {
  // Keep track of the "it" value to test
  private currentValue: any = undefined;

  // Create a new test
  test(description: string, callback: TestCallback): this {
    bunTest(description, callback);
    return this;
  }

  // Test modifiers
  get skip(): PestSkip {
    return {
      test: (description: string, callback: TestCallback): PestSuite => {
        bunTest.skip(description, callback);
        return this;
      }
    };
  }

  get only(): PestOnly {
    return {
      test: (description: string, callback: TestCallback): PestSuite => {
        bunTest.only(description, callback);
        return this;
      }
    };
  }

  // Set a value for testing
  expect<T>(value: T): TestCase<T> {
    this.currentValue = value;
    return new TestCase(value);
  }

  // Fluent "it" API like Pest
  it<T>(value: T): TestCase<T> {
    this.currentValue = value;
    return new TestCase(value);
  }

  // Sugar for describing test suites
  describe(description: string, callback: () => void): this {
    bunDescribe(description, callback);
    return this;
  }

  // Lifecycle hooks
  beforeAll(callback: TestCallback): this {
    bunBeforeAll(callback);
    return this;
  }

  afterAll(callback: TestCallback): this {
    bunAfterAll(callback);
    return this;
  }

  beforeEach(callback: TestCallback): this {
    bunBeforeEach(callback);
    return this;
  }

  afterEach(callback: TestCallback): this {
    bunAfterEach(callback);
    return this;
  }
}

// Create a new Pest-style test suite
export function pest(): PestSuite {
  return new PestSuite();
}

// Additional Pest-inspired features

/**
 * Group related tests with a shared "it" value
 */
export function testGroup<T>(value: T, callback: (tc: TestCase<T>) => void): void {
  const testCase = new TestCase(value);
  callback(testCase);
}