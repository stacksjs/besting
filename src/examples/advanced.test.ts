import { pest, test, expect, describe, beforeEach, afterEach, testGroup } from '../test';

// Create a basic User class for testing
class User {
  name: string;
  email: string;
  verified: boolean = false;

  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }

  verify(): void {
    this.verified = true;
  }

  getProfile(): Record<string, any> {
    return {
      name: this.name,
      email: this.email,
      verified: this.verified
    };
  }
}

// Example 1: Using Pest-style fluent API
describe('User (using standard API with pest-like assertions)', () => {
  let user: User;

  beforeEach(() => {
    user = new User('John Doe', 'john@example.com');
  });

  test('user has correct properties', () => {
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
    expect(user.verified).toBeFalsy();
  });

  test('user can be verified', () => {
    // Fluent API for multiple assertions on the same subject
    expect(user.verified)
      .toBeFalsy()
      .not.toBeTruthy();

    // Verify the user
    user.verify();

    // Chained assertions on the resulting state
    expect(user.verified)
      .toBeTruthy()
      .not.toBeFalsy();
  });

  test('user profile contains correct information', () => {
    const profile = user.getProfile();

    expect(profile)
      .toHaveProperty('name', 'John Doe')
      .toHaveProperty('email', 'john@example.com')
      .toHaveProperty('verified', false);
  });
});

// Example 2: Using full Pest-style API with the pest() function
const p = pest();

p.describe('User (using pest API)', () => {
  let user: User;

  p.beforeEach(() => {
    user = new User('Jane Smith', 'jane@example.com');
  });

  p.test('it has correct properties', () => {
    // Very Pest-like "it" syntax
    p.it(user.name).toBe('Jane Smith');
    p.it(user.email).toBe('jane@example.com');
    p.it(user.verified).toBeFalsy();
  });

  p.test('it can be verified', () => {
    p.it(user.verified).toBeFalsy();

    user.verify();

    p.it(user.verified).toBeTruthy();
  });

  p.test('profile contains expected data', () => {
    const profile = user.getProfile();

    p.it(profile)
      .toHaveProperty('name')
      .toHaveProperty('email')
      .toBeInstanceOf(Object);
  });

  p.skip.test('this test is skipped', () => {
    // This test will be skipped
    p.it(true).toBeFalsy();
  });
});

// Example 3: Using testGroup to group related tests on the same subject
testGroup('Hello World', (str) => {
  // All assertions are against the string 'Hello World'
  str.toContain('Hello')
    .toContain('World')
    .toStartWith('Hello')
    .toEndWith('World')
    .toHaveLength(11)
    .not.toBeEmpty();

  // Use custom validators
  str.toPass(value => value.split(' ').length === 2, 'String should have exactly two words');
});

// Example 4: Testing with Pest-style special string matchers
test('string matchers', () => {
  const email = 'test@example.com';
  const url = 'https://bun.sh';

  expect(email)
    .toContain('@')
    .toEndWith('.com')
    .toPass(value => /^[^@]+@[^@]+\.[^@]+$/.test(value), 'Should be a valid email');

  expect(url)
    .toStartWith('https://')
    .toEndWith('.sh')
    .toPass(value => value.includes('bun'), 'URL should contain bun');
});

// Example 5: Testing arrays and objects with Pest-style empty check
test('collections', () => {
  const emptyArray: string[] = [];
  const fullArray = [1, 2, 3];
  const emptyObject = {};
  const fullObject = { name: 'test' };

  // Test emptiness
  expect(emptyArray).toBeEmpty();
  expect(emptyObject).toBeEmpty();
  expect(fullArray).not.toBeEmpty();
  expect(fullObject).not.toBeEmpty();

  // Array specific tests
  expect(fullArray)
    .toHaveLength(3)
    .toContain(1)
    .toContain(2)
    .toContain(3);

  // Object specific tests
  expect(fullObject)
    .toHaveProperty('name')
    .toHaveProperty('name', 'test');
});