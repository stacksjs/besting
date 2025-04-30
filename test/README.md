# Besting Test Suite

This directory contains the test suite for the Besting framework. These tests ensure that all components of the framework are working correctly.

## Test Files

- `index.test.ts`: Core tests for the main API, assertions, and utility functions
- `error-handling.test.ts`: Tests focusing on error handling capabilities
- `stress.test.ts`: Tests for performance and handling more complex operations

## Running Tests

You can run the tests using the following commands:

```bash
# Run all tests
bun run test:all

# Run only core tests
bun run test:core

# Run only stress tests
bun run test:stress

# Run only error handling tests
bun run test:errors

# Run default test suite (using Bun's test runner)
bun test
```

## Adding New Tests

When adding new tests, follow these guidelines:

1. Keep test files organized by purpose (core functionality, error handling, stress testing, etc.)
2. Use descriptive test names that explain what aspect is being tested
3. Follow the existing patterns of testing (using `describe`, `test`, etc.)
4. Use the fluent API to demonstrate its usage in the tests

## Test Structure

Each test file is structured to test a specific part of the Besting framework:

- Core tests validate the basic functionality of assertions and test organization
- Error handling tests verify proper error catching and handling
- Stress tests ensure the framework performs well under more intensive operations

## Expected Output

When all tests pass, you should see output similar to:

```
✓ Test name [time]
```

If a test is skipped, it will be marked with:

```
» Test name
```

Any failing tests will be marked with:

```
✗ Test name
```
