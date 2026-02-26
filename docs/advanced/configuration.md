# Configuration Deep-Dive

Besting supports comprehensive configuration through config files, CLI options, and programmatic setup. This guide covers all configuration options.

## Configuration File

Create a `besting.config.ts` in your project root:

```typescript
import type { BestingConfig } from 'besting'

export default {
  // Test file patterns
  include: ['**/*.test.ts', '**/*.spec.ts'],
  exclude: ['node_modules', 'dist'],

  // Test environment
  environment: 'happy-dom', // 'node' | 'happy-dom' | 'jsdom'

  // Globals
  globals: true, // Make describe/it/expect global

  // Coverage
  coverage: {
    enabled: false,
    provider: 'v8',
    reporter: ['text', 'html'],
    include: ['src/**'],
    exclude: ['**/*.test.ts'],
  },

  // Timeouts
  testTimeout: 5000,
  hookTimeout: 10000,

  // Parallelization
  pool: 'threads', // 'threads' | 'forks' | 'vmThreads'
  poolOptions: {
    threads: {
      maxThreads: 4,
      minThreads: 1,
    },
  },

  // Reporters
  reporters: ['default', 'html'],

  // Setup files
  setupFiles: ['./setup.ts'],
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',

  // Retry failed tests
  retry: 0,
} satisfies BestingConfig
```

## Test Patterns

### Include/Exclude

```typescript
export default {
  include: [
    'src/**/*.test.ts',
    'tests/**/*.spec.ts',
  ],
  exclude: [
    'node_modules/**',
    'dist/**',
    '**/*.d.ts',
  ],
}
```

### Root Directory

```typescript
export default {
  root: './src',
  testMatch: ['**/__tests__/**/*.ts'],
}
```

## Environment Configuration

### DOM Environment

```typescript
export default {
  environment: 'happy-dom',
  environmentOptions: {
    happyDOM: {
      settings: {
        disableCSSFileLoading: true,
      },
    },
  },
}
```

### Node Environment

```typescript
export default {
  environment: 'node',
  environmentOptions: {
    node: {
      globals: true,
    },
  },
}
```

### Per-File Environment

```typescript
// In test file
/**
 * @besting-environment happy-dom
 */

import { it, expect } from 'besting'

it('uses DOM', () => {
  document.createElement('div')
})
```

## Coverage Configuration

```typescript
export default {
  coverage: {
    enabled: true,
    provider: 'v8', // 'v8' | 'istanbul'
    reporter: ['text', 'html', 'lcov', 'json'],
    reportsDirectory: './coverage',

    // Thresholds
    thresholds: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },

    // File filtering
    include: ['src/**/*.ts'],
    exclude: [
      '**/*.test.ts',
      '**/*.d.ts',
      '**/types.ts',
    ],

    // Options
    all: true, // Include uncovered files
    clean: true, // Clean before collecting
    skipFull: false, // Skip 100% covered files
  },
}
```

## Reporter Configuration

### Built-in Reporters

```typescript
export default {
  reporters: [
    'default', // Console output
    'verbose', // Detailed console output
    'dot', // Minimal dots
    'json', // JSON output
    'html', // HTML report
    'junit', // JUnit XML
  ],
}
```

### Custom Reporter

```typescript
export default {
  reporters: [
    'default',
    ['./custom-reporter.ts', { outputFile: './report.txt' }],
  ],
}
```

### Reporter Options

```typescript
export default {
  reporters: [
    ['default', { summary: true }],
    ['html', { outputFile: './reports/index.html' }],
    ['junit', { outputFile: './reports/junit.xml', suiteName: 'My Tests' }],
  ],
}
```

## Timeout Configuration

```typescript
export default {
  // Global timeouts
  testTimeout: 5000, // Per-test timeout
  hookTimeout: 10000, // Setup/teardown timeout

  // Slow test threshold
  slowTestThreshold: 300, // Mark as slow if > 300ms
}
```

### Per-Test Timeout

```typescript
it('slow test', async () => {
  // ...
}, 30000) // 30 second timeout
```

## Parallelization

### Thread Pool

```typescript
export default {
  pool: 'threads',
  poolOptions: {
    threads: {
      maxThreads: 8,
      minThreads: 2,
      isolate: true,
    },
  },
}
```

### Fork Pool

```typescript
export default {
  pool: 'forks',
  poolOptions: {
    forks: {
      maxForks: 4,
      minForks: 1,
    },
  },
}
```

### Sequential Execution

```typescript
export default {
  pool: 'threads',
  poolOptions: {
    threads: {
      singleThread: true,
    },
  },
}
```

## Setup and Teardown

### Setup Files

```typescript
export default {
  setupFiles: [
    './test/setup.ts', // Runs before each test file
  ],
  setupFilesAfterEnv: [
    './test/setup-after-env.ts', // Runs after environment setup
  ],
}
```

### Global Setup

```typescript
// global-setup.ts
export default async () => {
  // Start services, databases, etc.
  console.log('Starting test database...')

  // Return teardown function
  return async () => {
    console.log('Stopping test database...')
  }
}
```

```typescript
export default {
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',
}
```

## Module Resolution

### Aliases

```typescript
export default {
  resolve: {
    alias: {
      '@': './src',
      '@test': './test',
    },
  },
}
```

### Extensions

```typescript
export default {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
}
```

## Snapshot Configuration

```typescript
export default {
  snapshotDir: '__snapshots__',
  snapshotFormat: {
    escapeString: false,
    printBasicPrototype: false,
  },
  snapshotSerializers: [
    './test/serializers/html-serializer.ts',
  ],
}
```

## Retry Configuration

```typescript
export default {
  retry: 2, // Retry failed tests twice

  // Conditional retry
  onFailure: async ({ error, testName, retryCount }) => {
    if (error.message.includes('timeout')) {
      return true // Retry timeout errors
    }
    return false
  },
}
```

## Watch Mode

```typescript
export default {
  watch: true,
  watchExclude: ['node_modules', 'dist'],
  watchTrigger: 'any', // 'any' | 'all' | 'manual'

  // Keyboard shortcuts in watch mode
  watchShortcuts: {
    quit: 'q',
    rerun: 'r',
    filter: 'f',
    update: 'u',
  },
}
```

## CLI Options

Override config via CLI:

```bash
# Run specific files
besting src/utils.test.ts

# Update snapshots
besting -u

# Watch mode
besting --watch

# Coverage
besting --coverage

# Specific reporter
besting --reporter=json

# Timeout
besting --timeout=10000

# Run sequentially
besting --sequence

# Filter by name
besting -t "user tests"
```

## Environment Variables

```bash
# CI mode
CI=true besting

# Coverage
COVERAGE=true besting

# Debug mode
DEBUG=besting:* besting

# No colors
NO_COLOR=1 besting
```

## Workspace Configuration

For monorepos:

```typescript
// besting.config.ts
export default {
  workspace: ['packages/*'],
  workspaceOptions: {
    parallel: true,
    isolate: true,
  },
}
```

## Best Practices

1. **Start minimal**: Add configuration as needed
2. **Use TypeScript**: Type-safe configuration
3. **Environment per need**: Use appropriate test environment
4. **CI optimization**: Enable coverage in CI only
5. **Parallel by default**: Use thread pool for speed

## Related

- [Test Suites](/features/test-suites) - Organizing tests
- [Custom Matchers](/advanced/custom-matchers) - Extending assertions
- [CI/CD Integration](/advanced/ci-cd) - CI configuration
