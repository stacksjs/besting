# Performance Optimization

Besting is designed for speed, but there are many ways to optimize test performance for large test suites.

## Benchmarks

Besting performance compared to alternatives:

| Framework | 1000 Tests | Memory | Startup |
|-----------|-----------|--------|---------|
| Besting | ~2s | ~50MB | ~100ms |
| Jest | ~8s | ~200MB | ~500ms |
| Vitest | ~3s | ~80MB | ~200ms |

## Parallelization

### Thread Pool

```typescript
// besting.config.ts
export default {
  pool: 'threads',
  poolOptions: {
    threads: {
      maxThreads: 8,
      minThreads: 2,
    },
  },
}
```

### Optimal Thread Count

```typescript
import { cpus } from 'os'

export default {
  poolOptions: {
    threads: {
      maxThreads: Math.max(1, cpus().length - 1),
    },
  },
}
```

### Isolate Expensive Tests

```typescript
// Mark test file as isolated
/**

 * @besting-environment node
 * @besting-pool forks

 */

describe('Database tests', () => {
  // Runs in separate process
})
```

## Test Organization

### Group Related Tests

```typescript
// Instead of many small files
// Combine related tests

describe('User Module', () => {
  describe('creation', () => { /* ... */ })
  describe('validation', () => { /* ... */ })
  describe('authentication', () => { /* ... */ })
})
```

### Lazy Imports

```typescript
describe('Heavy module tests', () => {
  let heavyModule: typeof import('./heavy-module')

  beforeAll(async () => {
    heavyModule = await import('./heavy-module')
  })

  it('uses module', () => {
    heavyModule.doSomething()
  })
})
```

## Setup Optimization

### Global Setup

Move expensive setup to global:

```typescript
// global-setup.ts
let database: Database

export default async () => {
  database = await Database.connect()
  await database.migrate()

  return async () => {
    await database.disconnect()
  }
}
```

### Shared Fixtures

```typescript
// fixtures.ts
export const testUsers = createTestUsers()
export const testProducts = createTestProducts()

// In tests
import { testUsers } from './fixtures'

it('uses shared fixtures', () => {
  expect(testUsers[0]).toHaveProperty('id')
})
```

### Connection Pooling

```typescript
// setup.ts
import { pool } from './database'

beforeAll(async () => {
  await pool.connect()
})

afterAll(async () => {
  await pool.end()
})
```

## Mock Optimization

### Mock Once

```typescript
// setup.ts - mock globally
mock.module('heavy-dependency', () => ({
  default: fn(),
}))
```

### Avoid Over-Mocking

```typescript
// Instead of mocking everything
// Mock only external dependencies

// Bad
mock.module('./utils')
mock.module('./helpers')
mock.module('./formatters')

// Good - mock only external
mock.module('axios')
```

## Timeout Optimization

### Appropriate Timeouts

```typescript
export default {
  testTimeout: 5000, // 5s default
  hookTimeout: 10000, // 10s for setup
}
```

### Fast-Fail Strategy

```typescript
export default {
  bail: 1, // Stop after first failure
  maxFailures: 5, // Stop after 5 failures
}
```

## Coverage Optimization

### Selective Coverage

```typescript
export default {
  coverage: {
    // Only collect for changed files
    all: false,

    // Exclude test files
    exclude: ['**/*.test.ts', '**/**mocks**/**'],
  },
}
```

### Coverage in CI Only

```typescript
export default {
  coverage: {
    enabled: process.env.CI === 'true',
  },
}
```

## Watch Mode Optimization

### Filter Tests

```bash
# Run only matching tests
besting -t "user"

# Run only changed files
besting --changed
```

### Targeted Watch

```typescript
export default {
  watchExclude: [
    'node*modules/**',
    'dist/**',
    'coverage/**',
  ],
}
```

## Memory Management

### Cleanup Between Tests

```typescript
afterEach(() => {
  // Clear caches
  cache.clear()

  // Reset mocks
  fn.mockClear()
})
```

### Limit Concurrent Tests

```typescript
export default {
  poolOptions: {
    threads: {
      maxThreads: 2, // Limit for memory
    },
  },
  maxConcurrency: 5, // Limit concurrent tests per thread
}
```

### Handle Large Data

```typescript
describe('Large data tests', () => {
  let largeData: LargeData

  beforeEach(() => {
    largeData = generateLargeData()
  })

  afterEach(() => {
    largeData = null! // Release memory
  })
})
```

## Snapshot Optimization

### Inline Snapshots

Faster than file snapshots:

```typescript
expect(result).toMatchInlineSnapshot(`
  {
    "id": 1,
    "name": "Test",
  }
`)
```

### Smaller Snapshots

```typescript
// Instead of full object
expect(response).toMatchSnapshot()

// Snapshot specific parts
expect(response.data).toMatchSnapshot()
```

## CI/CD Optimization

### Parallel Jobs

```yaml
# GitHub Actions
jobs:
  test:
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:

      - run: besting --shard=${{ matrix.shard }}/4

```

### Cache Dependencies

```yaml

- uses: actions/cache@v4

  with:
    path: ~/.bun/install/cache
    key: bun-${{ hashFiles('bun.lockb') }}
```

### Incremental Testing

```yaml

- name: Test changed files

  run: besting --changed --since=origin/main
```

## Profiling

### Enable Profiling

```bash
besting --profile
```

Output:

```
Profile Results:
  Setup: 500ms
  Tests: 2000ms
  Teardown: 200ms

Slowest Tests:

  1. user.test.ts (800ms)
  2. api.test.ts (600ms)
  3. database.test.ts (400ms)

```

### Find Slow Tests

```bash
besting --reporter=verbose --slow=100
```

### Heap Snapshot

```bash
NODE*OPTIONS="--heap-prof" besting
```

## Best Practices

1. **Parallelize**: Use thread pool for independent tests
2. **Global setup**: Move expensive setup to global
3. **Mock wisely**: Only mock external dependencies
4. **Cleanup**: Release resources after tests
5. **Profile regularly**: Find and fix slow tests
6. **CI sharding**: Split tests across jobs

## Related

* [Configuration](/advanced/configuration) - Full configuration
* [CI/CD Integration](/advanced/ci-cd) - CI optimization
* [Test Suites](/features/test-suites) - Test organization
