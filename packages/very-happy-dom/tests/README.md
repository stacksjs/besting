# VeryHappyDOM Tests

## Running Tests

```bash
# Run stress tests
bun tests/browser-api.stress.test.ts
```

## Test Files

- **`browser-api.stress.test.ts`** - Comprehensive stress tests for the Browser API
  - 87 tests covering all aspects of the Browser API
  - Edge cases, security, lifecycle, concurrency
  - Attempts to break the implementation

## Test Results

See [../TEST_RESULTS.md](../TEST_RESULTS.md) for detailed test results and analysis.

## Adding New Tests

When adding new tests to `browser-api.stress.test.ts`:

1. Use the `assert()` function for positive tests
2. Use `assertThrows()` for error cases
3. Always clean up resources (await browser.close())
4. Group related tests together with descriptive names
5. Update TEST_RESULTS.md with findings

## Test Categories

1. **Lifecycle Management** - Browser/page/context creation and cleanup
2. **Context Isolation** - Cookie and state isolation between contexts
3. **Cookie Container** - Domain, path, security filtering
4. **Page Management** - Multiple pages, concurrent operations
5. **URL Handling** - Invalid URLs, location updates
6. **Content Handling** - HTML parsing, document.write()
7. **Frame Relationships** - Parent/child frame hierarchy
8. **Viewport Management** - Dimension changes
9. **Settings** - Configuration and runtime modification
10. **Code Evaluation** - String and function evaluation
11. **Async Operations** - Abort, waitUntilComplete
12. **GlobalWindow** - Global scope integration
13. **Custom Console** - Console injection and capture
