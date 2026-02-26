# Test Suites

Besting provides a powerful test suite system inspired by Jest and Pest, allowing you to organize tests logically and run them efficiently.

## Basic Structure

### Creating Test Suites

```typescript
import { describe, it, expect } from 'besting'

describe('Calculator', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(add(2, 3)).toBe(5)
    })

    it('should handle negative numbers', () => {
      expect(add(-1, 1)).toBe(0)
    })
  })

  describe('subtract', () => {
    it('should subtract numbers', () => {
      expect(subtract(5, 3)).toBe(2)
    })
  })
})
```

### Flat Structure

```typescript
import { test, expect } from 'besting'

test('adds numbers correctly', () => {
  expect(1 + 1).toBe(2)
})

test('subtracts numbers correctly', () => {
  expect(5 - 3).toBe(2)
})
```

## Setup and Teardown

### Before/After Each

```typescript
describe('Database tests', () => {
  let db: Database

  beforeEach(async () => {
    db = await Database.connect()
    await db.seed()
  })

  afterEach(async () => {
    await db.cleanup()
    await db.disconnect()
  })

  it('should insert records', async () => {
    await db.insert({ name: 'Test' })
    expect(await db.count()).toBe(1)
  })
})
```

### Before/After All

```typescript
describe('API tests', () => {
  let server: Server

  beforeAll(async () => {
    server = await startServer()
  })

  afterAll(async () => {
    await server.close()
  })

  it('should respond to requests', async () => {
    const res = await fetch(`${server.url}/api/health`)
    expect(res.ok).toBe(true)
  })
})
```

## Test Modifiers

### Skip Tests

```typescript
describe('Feature', () => {
  it.skip('should work eventually', () => {
    // This test is skipped
  })

  it('should work now', () => {
    expect(true).toBe(true)
  })
})

// Skip entire suite
describe.skip('Pending Feature', () => {
  it('test 1', () => {})
  it('test 2', () => {})
})
```

### Focus Tests

```typescript
describe('Feature', () => {
  it.only('only this test runs', () => {
    expect(true).toBe(true)
  })

  it('this test is skipped', () => {
    // Won't run when .only is present
  })
})
```

### Todo Tests

```typescript
it.todo('should implement this feature')

it.todo('should handle edge case', () => {
  // Implementation pending
})
```

## Async Tests

### Promises

```typescript
it('should fetch data', async () => {
  const data = await fetchData()
  expect(data).toHaveProperty('id')
})
```

### Callbacks

```typescript
it('should call back', (done) => {
  asyncOperation((result) => {
    expect(result).toBe('success')
    done()
  })
})
```

### Timeouts

```typescript
it('should complete within timeout', async () => {
  await expect(slowOperation()).resolves.toBe('done')
}, 10000) // 10 second timeout
```

## Parameterized Tests

### Each

```typescript
it.each([
  [1, 1, 2],
  [2, 3, 5],
  [5, 5, 10],
])('adds %i + %i = %i', (a, b, expected) => {
  expect(add(a, b)).toBe(expected)
})
```

### With Objects

```typescript
it.each([
  { a: 1, b: 2, sum: 3 },
  { a: 5, b: 5, sum: 10 },
])('adds $a + $b = $sum', ({ a, b, sum }) => {
  expect(add(a, b)).toBe(sum)
})
```

### Describe Each

```typescript
describe.each([
  ['mobile', 375],
  ['tablet', 768],
  ['desktop', 1024],
])('Responsive %s (%ipx)', (device, width) => {
  it('should render correctly', () => {
    setViewport(width)
    expect(render()).toMatchSnapshot()
  })
})
```

## Concurrent Tests

### Run in Parallel

```typescript
describe('Concurrent tests', () => {
  it.concurrent('test 1', async () => {
    await delay(100)
  })

  it.concurrent('test 2', async () => {
    await delay(100)
  })

  it.concurrent('test 3', async () => {
    await delay(100)
  })
})
// All three run simultaneously
```

### Limit Concurrency

```typescript
describe('Limited concurrency', { concurrent: true, maxConcurrency: 2 }, () => {
  // Max 2 tests run at once
})
```

## Test Context

### Shared Context

```typescript
describe('With context', () => {
  const context = {
    user: null as User | null,
  }

  beforeEach(async () => {
    context.user = await createUser()
  })

  it('has access to user', () => {
    expect(context.user).toBeDefined()
  })
})
```

### Test-Specific Data

```typescript
it('uses test context', ({ meta }) => {
  console.log('Test name:', meta.name)
  console.log('File:', meta.file)
})
```

## Grouping and Tags

### Tags

```typescript
it('integration test', { tags: ['integration', 'slow'] }, async () => {
  // Run with: besting --tags integration
})

it('unit test', { tags: ['unit', 'fast'] }, () => {
  // Run with: besting --tags unit
})
```

### Run by Tag

```bash
# Run only integration tests
besting --tags integration

# Run fast tests
besting --tags fast

# Exclude slow tests
besting --exclude-tags slow
```

## Retry Logic

### Retry Failed Tests

```typescript
it('flaky test', { retries: 3 }, async () => {
  const result = await flakyApi()
  expect(result).toBe('success')
})
```

### Global Retry

```typescript
// besting.config.ts
export default {
  retries: 2,
  retryDelay: 1000,
}
```

## Test Isolation

### Isolated Context

```typescript
describe('Isolated tests', { isolated: true }, () => {
  // Each test runs in isolation
  it('test 1', () => {})
  it('test 2', () => {})
})
```

### Reset Between Tests

```typescript
describe('State tests', () => {
  beforeEach(() => {
    resetState()
  })

  it('starts fresh', () => {
    expect(getState()).toEqual({})
  })
})
```

## Reporting

### Custom Reporters

```typescript
// besting.config.ts
export default {
  reporters: [
    'default',
    ['junit', { outputFile: './reports/junit.xml' }],
    ['html', { outputDir: './reports/html' }],
  ],
}
```

### Inline Reporting

```typescript
describe('With custom output', () => {
  afterEach(({ meta, status }) => {
    console.log(`${meta.name}: ${status}`)
  })
})
```

## Best Practices

1. **One assertion focus**: Each test should verify one behavior
2. **Descriptive names**: Use clear, readable test names
3. **Arrange-Act-Assert**: Follow AAA pattern
4. **Avoid dependencies**: Tests should be independent
5. **Clean up**: Always clean up in afterEach/afterAll

## Related

- [Matchers](/features/matchers) - Assertion matchers
- [Mocking](/features/mocking) - Mock functions and modules
- [Configuration](/advanced/configuration) - Test configuration
