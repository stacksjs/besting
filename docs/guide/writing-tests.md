# Writing Tests

Besting provides a fluent, Pest-like API for writing tests with zero external dependencies.

## Basic Test Structure

### Simple Test

```typescript
import { expect, test } from 'besting'

test('basic addition', () => {
  expect(1 + 1).toBe(2)
})
```

### Test Suites

Group related tests:

```typescript
import { describe, expect, test } from 'besting'

describe('Math operations', () => {
  test('addition works', () => {
    expect(1 + 1).toBe(2)
  })

  test('subtraction works', () => {
    expect(3 - 1).toBe(2)
  })
})
```

## Pest-Style API

Use the Pest-inspired syntax:

```typescript
import { best } from 'besting'

const p = best()

p.describe('Calculator', () => {
  p.test('addition works', () => {
    p.it(1 + 1).toBe(2)
  })

  p.test('subtraction works', () => {
    p.it(3 - 1).toBe(2)
  })
})
```

## Chainable Assertions

Make multiple assertions on the same value:

```typescript
import { expect, test } from 'besting'

test('multiple assertions on same value', () => {
  expect('Hello World')
    .toContain('Hello')
    .toContain('World')
    .toHaveLength(11)
    .toStartWith('Hello')
    .toEndWith('World')
})
```

## Lifecycle Hooks

### beforeEach / afterEach

```typescript
import { afterEach, beforeEach, describe, expect, test } from 'besting'

describe('User', () => {
  let user

  beforeEach(() => {
    user = { name: 'John', email: 'john@example.com' }
  })

  afterEach(() => {
    user = null
  })

  test('has correct properties', () => {
    expect(user.name).toBe('John')
    expect(user.email).toBe('john@example.com')
  })
})
```

### beforeAll / afterAll

```typescript
import { afterAll, beforeAll, describe, test } from 'besting'

describe('Database tests', () => {
  let db

  beforeAll(async () => {
    db = await connectToDatabase()
  })

  afterAll(async () => {
    await db.close()
  })

  test('can query data', async () => {
    const users = await db.query('SELECT * FROM users')
    expect(users.length).toBeGreaterThan(0)
  })
})
```

## Test Groups

Create focused test groups:

```typescript
import { testGroup } from 'besting'

testGroup('Hello World', (str) => {
  str.toContain('Hello')
    .toContain('World')
    .toStartWith('Hello')
    .toEndWith('World')
    .not
    .toBeEmpty()
})
```

## Async Tests

### Async/Await

```typescript
import { expect, test } from 'besting'

test('async operation', async () => {
  const result = await fetchData()
  expect(result).toBeDefined()
})
```

### Promises

```typescript
test('returns promise', () => {
  return fetchData().then(result => {
    expect(result).toBeDefined()
  })
})
```

## Skipping and Focusing

### Skip Tests

```typescript
import { test } from 'besting'

test.skip('this test is skipped', () => {
  // Not executed
})
```

### Focus Tests

```typescript
test.only('only this test runs', () => {
  // Only this test executes
})
```

### Todo Tests

```typescript
test.todo('implement this later')
```

## Test Context

Access test context for utilities:

```typescript
import { test } from 'besting'

test('with context', (ctx) => {
  console.log(ctx.name) // Test name

  // Cleanup function
  ctx.onCleanup(() => {
    // Runs after test
  })
})
```

## Parameterized Tests

### Using test.each

```typescript
import { test } from 'besting'

test.each([
  [1, 1, 2],
  [1, 2, 3],
  [2, 2, 4],
])('adds %i + %i to equal %i', (a, b, expected) => {
  expect(a + b).toBe(expected)
})
```

### Named Parameters

```typescript
test.each([
  { a: 1, b: 1, expected: 2 },
  { a: 1, b: 2, expected: 3 },
  { a: 2, b: 2, expected: 4 },
])('$a + $b = $expected', ({ a, b, expected }) => {
  expect(a + b).toBe(expected)
})
```

## Error Testing

### Expect Throws

```typescript
import { expect, test } from 'besting'

test('throws an error', () => {
  expect(() => {
    throw new Error('Something went wrong')
  }).toThrow()
})

test('throws specific error', () => {
  expect(() => {
    throw new Error('Invalid input')
  }).toThrow('Invalid input')
})
```

### Async Errors

```typescript
test('async throws', async () => {
  await expect(async () => {
    await failingAsyncFunction()
  }).rejects.toThrow()
})
```

## Mocking

### Mock Functions

```typescript
import { expect, mock, test } from 'besting'

test('mock function', () => {
  const mockFn = mock(() => 42)

  expect(mockFn()).toBe(42)
  expect(mockFn).toHaveBeenCalled()
  expect(mockFn).toHaveBeenCalledTimes(1)
})
```

### Mock Implementation

```typescript
const mockFn = mock((x: number) => x * 2)

mockFn.mockImplementation((x) => x * 3)
expect(mockFn(2)).toBe(6)

mockFn.mockImplementationOnce((x) => x * 4)
expect(mockFn(2)).toBe(8)
expect(mockFn(2)).toBe(6) // Back to regular implementation
```

## Snapshots

### Inline Snapshots

```typescript
import { expect, test } from 'besting'

test('inline snapshot', () => {
  expect({ name: 'John', age: 30 }).toMatchInlineSnapshot(`
    {
      "age": 30,
      "name": "John",
    }
  `)
})
```

### File Snapshots

```typescript
test('file snapshot', () => {
  expect(renderComponent()).toMatchSnapshot()
})
```

## Timeouts

### Test Timeout

```typescript
test('slow operation', async () => {
  await slowOperation()
}, 10000) // 10 second timeout
```

### Global Timeout

```typescript
import { configure } from 'besting'

configure({
  timeout: 5000 // 5 seconds for all tests
})
```

## Running Tests

```bash
# Run all tests
bun test

# Run specific file
bun test path/to/test.ts

# Run with pattern matching
bun test --grep "Calculator"

# Watch mode
bun test --watch

# Debug mode
bun run test:debug
```

## Best Practices

1. **One assertion per test** - Keep tests focused
2. **Descriptive names** - Explain what's being tested
3. **Arrange-Act-Assert** - Structure tests clearly
4. **Avoid test interdependence** - Tests should be independent
5. **Use beforeEach for setup** - Keep tests DRY
6. **Test edge cases** - Empty inputs, nulls, boundaries

## Next Steps

- Learn about [Assertions](/guide/assertions)
- Explore [DOM Testing](/guide/dom-testing)
- See [API Testing](/guide/api-testing)
