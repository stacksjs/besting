# Snapshots

Besting supports snapshot testing for capturing and comparing output over time. Snapshots are useful for testing complex data structures and UI components.

## Basic Snapshot Testing

### Create Snapshot

```typescript
import { expect, it } from 'besting'

it('matches snapshot', () => {
  const data = {
    name: 'John',
    age: 30,
    email: 'john@example.com',
  }

  expect(data).toMatchSnapshot()
})
```

First run creates the snapshot file. Subsequent runs compare against it.

### Named Snapshots

```typescript
it('has multiple snapshots', () => {
  expect(user).toMatchSnapshot('user object')
  expect(profile).toMatchSnapshot('profile data')
})
```

## Inline Snapshots

### Auto-Generated

```typescript
it('matches inline snapshot', () => {
  const result = formatDate(new Date('2024-01-15'))

  expect(result).toMatchInlineSnapshot()
  // After first run, becomes:
  // expect(result).toMatchInlineSnapshot(`"January 15, 2024"`)
})
```

### Manual Inline

```typescript
it('matches inline', () => {
  expect(getData()).toMatchInlineSnapshot(`
    {
      "id": 1,
      "name": "Test",
    }
  `)
})
```

## Updating Snapshots

### CLI Update

```bash
# Update all snapshots
besting --update-snapshots

# Or short flag
besting -u
```

### Interactive Update

```bash
# Review and update interactively
besting --update-snapshots --interactive
```

## Snapshot Serializers

### Custom Serializers

```typescript
// besting.config.ts
export default {
  snapshotSerializers: [
    {
      test: (value: unknown) => value instanceof Date,
      serialize: (value: Date) => `Date<${value.toISOString()}>`,
    },
  ],
}
```

### Built-in Serializers

```typescript
import { addSerializer } from 'besting'

// Pretty print HTML
addSerializer({
  test: (val) => typeof val === 'string' && val.includes('<'),
  print: (val, serialize) => prettyHtml(val as string),
})
```

## Property Matchers

### Dynamic Values

```typescript
it('handles dynamic data', () => {
  const user = createUser()

  expect(user).toMatchSnapshot({
    id: expect.any(String),
    createdAt: expect.any(Date),
  })
})
```

### Partial Matching

```typescript
expect(response).toMatchSnapshot({
  timestamp: expect.any(Number),
  requestId: expect.any(String),
  data: {
    count: expect.any(Number),
  },
})
```

## File Snapshots

### Large Data

```typescript
it('creates file snapshot', () => {
  const largeData = generateReport()

  expect(largeData).toMatchFileSnapshot('./snapshots/report.json')
})
```

### Binary Snapshots

```typescript
it('matches image', async () => {
  const screenshot = await takeScreenshot()

  expect(screenshot).toMatchFileSnapshot('./snapshots/screen.png')
})
```

## Snapshot Configuration

### File Location

```typescript
// besting.config.ts
export default {
  snapshotDir: '__snapshots__',
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: false,
  },
}
```

### Resolver

```typescript
export default {
  snapshotResolver: {
    resolveSnapshotPath: (testPath, extension) =>
      testPath.replace('src/', 'snapshots/') + extension,
    resolveTestPath: (snapshotPath, extension) =>
      snapshotPath.replace('snapshots/', 'src/').slice(0, -extension.length),
    testPathForConsistencyCheck: 'src/example.test.ts',
  },
}
```

## Error Snapshots

### Thrown Errors

```typescript
it('matches error snapshot', () => {
  expect(() => {
    throw new Error('Something went wrong')
  }).toThrowErrorMatchingSnapshot()
})
```

### Async Errors

```typescript
it('matches async error snapshot', async () => {
  await expect(asyncFn()).rejects.toThrowErrorMatchingSnapshot()
})
```

## DOM Snapshots

### HTML Snapshots

```typescript
it('matches DOM snapshot', () => {
  const element = render(<Component />)

  expect(element).toMatchSnapshot()
})
```

### Partial DOM

```typescript
it('matches specific element', () => {
  const container = render(<App />)
  const header = container.querySelector('header')

  expect(header).toMatchSnapshot()
})
```

## Snapshot Diff

### View Differences

When a snapshot doesn't match, besting shows:

```
Snapshot name: `component renders correctly 1`

- Snapshot
+ Received

  {
    "name": "John",
-   "age": 30,
+   "age": 31,
  }
```

### Diff Options

```typescript
// besting.config.ts
export default {
  snapshotDiff: {
    expand: true,
    contextLines: 5,
    aAnnotation: 'Snapshot',
    bAnnotation: 'Received',
  },
}
```

## Snapshot Cleanup

### Remove Obsolete

```bash
# Remove unused snapshots
besting --update-snapshots --clean
```

### Check for Obsolete

```bash
# Fail if obsolete snapshots exist
besting --check-snapshots
```

## Best Practices

### When to Use Snapshots

Good for:
- Complex objects and data structures
- UI component output
- Error messages
- API responses

Avoid for:
- Simple values (use specific assertions)
- Frequently changing data
- Performance-critical tests

### Keep Snapshots Small

```typescript
// Instead of entire response
expect(response).toMatchSnapshot()

// Snapshot specific parts
expect(response.data).toMatchSnapshot()
```

### Review Snapshot Changes

```bash
# Always review before updating
git diff **/__snapshots__/**
```

### Commit Snapshots

```gitignore
# Don't ignore snapshots
# !__snapshots__/
```

## Troubleshooting

### Snapshot Mismatch

```bash
# View detailed diff
besting --verbose

# Update if intentional
besting -u
```

### Platform Differences

```typescript
// Normalize line endings
expect(output.replace(/\r\n/g, '\n')).toMatchSnapshot()
```

### Non-Deterministic Data

```typescript
// Use property matchers for dynamic data
expect(data).toMatchSnapshot({
  id: expect.any(String),
  timestamp: expect.any(Number),
})
```

## Related

- [Test Suites](/features/test-suites) - Organizing tests
- [Matchers](/features/matchers) - Snapshot matchers
- [DOM Testing](/guide/dom-testing) - DOM snapshots
