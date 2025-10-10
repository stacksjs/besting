# Contributing to VeryHappyDOM

Thank you for your interest in contributing to VeryHappyDOM! This document provides guidelines and instructions for contributing.

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) (latest version)
- Basic understanding of DOM APIs and TypeScript

### Setup

```bash
# Clone the repository
git clone https://github.com/stacksjs/very-happy-dom.git
cd very-happy-dom

# Install dependencies
bun install

# Run tests
cd packages/very-happy-dom
bun test

# Run tests with coverage
bun test:coverage
```

## 🏗️ Project Structure

```
packages/very-happy-dom/
├── src/
│   ├── apis/          # Browser APIs (Performance, Clipboard, File, etc.)
│   ├── browser/       # Browser, BrowserContext, BrowserPage, BrowserFrame
│   ├── events/        # Event system (CustomEvent, VirtualEvent)
│   ├── http/          # XMLHttpRequest implementation
│   ├── network/       # WebSocket, RequestInterceptor
│   ├── nodes/         # VirtualNode, VirtualElement, VirtualDocument
│   ├── observers/     # MutationObserver, IntersectionObserver, ResizeObserver
│   ├── parsers/       # HTML parser
│   ├── selectors/     # CSS selector engine
│   ├── storage/       # localStorage, sessionStorage
│   ├── timers/        # setTimeout, setInterval, requestAnimationFrame
│   ├── webcomponents/ # Shadow DOM, Custom Elements
│   ├── window/        # Window API
│   └── xpath/         # XPath support
├── tests/             # Test files organized by domain
└── bin/              # CLI tools

```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/selectors.test.ts

# Run with coverage
bun test:coverage
```

### Writing Tests

- Place tests in the `tests/` directory
- Name test files with `.test.ts` suffix
- Use descriptive test names that explain what is being tested
- Follow the existing test structure:

```typescript
import { TestStats, createAssert, createTestWindow, cleanupWindow } from './test-utils'

const stats = new TestStats()
const assert = createAssert(stats)

console.log('=== Test Suite Name ===\n')

console.log('Test Group: Description')
{
  const window = createTestWindow()

  // Your test code here
  assert(condition, 'Test description')

  await cleanupWindow(window)
}

stats.printSummary()
stats.exit()
```

## 📝 Code Style

### General Guidelines

- Use TypeScript for all code
- Follow the existing code style (we use ESLint)
- Add JSDoc comments to all public APIs
- Use meaningful variable and function names
- Keep functions focused and small

### Formatting

```bash
# Lint code
bun lint

# Fix linting issues
bun lint:fix
```

### TypeScript Guidelines

- Use explicit return types for public functions
- Prefer `interface` over `type` for object shapes
- Use `const` for immutable values
- Avoid `any` - use `unknown` if type is truly unknown
- Enable strict mode features

## 🎯 Feature Development

### Adding a New Feature

1. **Check existing issues** - See if someone else is already working on it
2. **Open an issue** - Discuss the feature before implementing
3. **Create a branch** - Use descriptive branch names: `feature/add-css-grid-support`
4. **Implement the feature** - Follow the architecture patterns
5. **Add tests** - Comprehensive test coverage is required
6. **Update documentation** - Update README.md and add JSDoc comments
7. **Submit a PR** - Include description of changes and motivation

### CSS Selector Engine

When adding new selector support:

1. Add the logic to `src/selectors/engine.ts`
2. Update JSDoc to document the new selector
3. Add tests to `tests/selector-engine.test.ts`
4. Consider performance implications

Example:

```typescript
// In matchesPseudoClass function
case 'your-pseudo-class':
  {
    // Implementation
    return /* result */
  }
```

### DOM APIs

When adding new DOM methods:

1. Add to the appropriate class in `src/nodes/`
2. Match browser behavior as closely as possible
3. Add comprehensive JSDoc
4. Add tests covering edge cases

## 🐛 Bug Reports

### Before Submitting

1. **Search existing issues** - Your bug may already be reported
2. **Verify it's a bug** - Make sure it's not expected behavior
3. **Create a minimal reproduction** - Isolate the problem

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**Reproduction**
Steps to reproduce:
1. ...
2. ...

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Bun version:
- OS:
- VeryHappyDOM version:

**Code Sample**
\`\`\`typescript
// Minimal code to reproduce
\`\`\`
```

## 🔍 Code Review Process

### What We Look For

- ✅ Tests pass
- ✅ Code follows style guidelines
- ✅ No decrease in performance
- ✅ Documentation is updated
- ✅ Commit messages are clear
- ✅ Changes are focused and minimal

### Getting Your PR Merged

1. Keep PRs focused on a single feature/fix
2. Respond to review comments promptly
3. Update your branch if requested
4. Be patient - reviews take time

## 📚 Architecture Decisions

### Virtual DOM

VeryHappyDOM uses a lightweight virtual DOM structure:

- `VirtualNode` - Base interface for all nodes
- `VirtualElement` - Element nodes with attributes and children
- `VirtualTextNode` - Text content nodes
- `VirtualCommentNode` - Comment nodes

### Performance First

- Selector engine uses right-to-left matching
- Simple selectors bypass complex parsing
- Attributes stored in Map for O(1) lookup
- Minimal allocations in hot paths

### Browser Compatibility

Match real browser behavior when possible:

- Case-insensitive attribute names
- HTML5 void elements
- Event bubbling and capturing
- CSS selector specificity

## 🚦 Pull Request Checklist

Before submitting your PR, ensure:

- [ ] All tests pass (`bun test`)
- [ ] Code is linted (`bun lint`)
- [ ] New features have tests
- [ ] Public APIs have JSDoc comments
- [ ] README.md is updated if needed
- [ ] No breaking changes (or clearly documented)
- [ ] Commit messages are descriptive

## 💡 Tips for Contributors

### Debugging

```typescript
// Enable debug output
window.happyDOM.setDebug(true)

// Check selector parsing
import { parseComplexSelector } from './src/selectors/engine'
console.log(parseComplexSelector('div > p.intro'))
```

### Performance Testing

```bash
# Run benchmarks
cd ../benchmarks
bun run bench
```

### Common Patterns

**Adding a new element method:**

```typescript
// In VirtualElement.ts
/**
 * Your method description
 *
 * @param param - Parameter description
 * @returns Return value description
 */
yourMethod(param: string): ReturnType {
  // Implementation
}
```

**Adding an event handler:**

```typescript
addEventListener(type: string, listener: EventListener): void {
  if (!this.eventListeners.has(type)) {
    this.eventListeners.set(type, [])
  }
  this.eventListeners.get(type)!.push(listener)
}
```

## 📞 Getting Help

- **Questions?** Open a discussion on GitHub
- **Bugs?** Open an issue with reproduction
- **Ideas?** Start a discussion to gather feedback

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Every contribution, no matter how small, makes VeryHappyDOM better. Thank you for taking the time to contribute!
