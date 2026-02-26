# CI/CD Integration

Besting integrates seamlessly with CI/CD platforms for automated testing. This guide covers setup patterns for popular platforms.

## GitHub Actions

### Basic Workflow

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2

      - name: Install dependencies
        run: bun install

      - name: Run tests
        run: bun test
```

### With Coverage

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2

      - run: bun install
      - run: bun test --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
```

### Matrix Testing

```yaml
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        bun-version: [latest, canary]

    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: ${{ matrix.bun-version }}

      - run: bun install
      - run: bun test
```

### Sharded Tests

```yaml
jobs:
  test:
    strategy:
      matrix:
        shard: [1, 2, 3, 4]

    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun test --shard=${{ matrix.shard }}/4
```

### Caching

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2

      - name: Cache dependencies
        uses: actions/cache@v4
        with:
          path: ~/.bun/install/cache
          key: bun-${{ runner.os }}-${{ hashFiles('bun.lockb') }}

      - run: bun install
      - run: bun test
```

## GitLab CI

### Basic Pipeline

```yaml
stages:
  - test

test:
  stage: test
  image: oven/bun:latest
  script:
    - bun install
    - bun test
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
```

### With Coverage

```yaml
test:
  stage: test
  image: oven/bun:latest
  script:
    - bun install
    - bun test --coverage
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

### Parallel Jobs

```yaml
test:
  stage: test
  image: oven/bun:latest
  parallel: 4
  script:
    - bun install
    - bun test --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL
```

## CircleCI

```yaml
version: 2.1

jobs:
  test:
    docker:
      - image: oven/bun:latest
    steps:
      - checkout
      - restore_cache:
          keys:
            - bun-deps-{{ checksum "bun.lockb" }}
      - run: bun install
      - save_cache:
          key: bun-deps-{{ checksum "bun.lockb" }}
          paths:
            - ~/.bun/install/cache
      - run: bun test --coverage
      - store_test_results:
          path: ./test-results
      - store_artifacts:
          path: ./coverage

workflows:
  test:
    jobs:
      - test
```

## Jenkins

### Jenkinsfile

```groovy
pipeline {
    agent {
        docker {
            image 'oven/bun:latest'
        }
    }

    stages {
        stage('Install') {
            steps {
                sh 'bun install'
            }
        }

        stage('Test') {
            steps {
                sh 'bun test --coverage --reporter=junit --outputFile=test-results.xml'
            }
            post {
                always {
                    junit 'test-results.xml'
                    publishHTML([
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }
    }
}
```

## Azure DevOps

```yaml
trigger:
  - main

pool:
  vmImage: ubuntu-latest

steps:
  - task: UseNode@1
    inputs:
      version: '20.x'

  - script: npm install -g bun
    displayName: Install Bun

  - script: bun install
    displayName: Install dependencies

  - script: bun test --coverage --reporter=junit --outputFile=$(System.DefaultWorkingDirectory)/test-results.xml
    displayName: Run tests

  - task: PublishTestResults@2
    inputs:
      testResultsFormat: JUnit
      testResultsFiles: '**/test-results.xml'

  - task: PublishCodeCoverageResults@2
    inputs:
      codeCoverageTool: Cobertura
      summaryFileLocation: $(System.DefaultWorkingDirectory)/coverage/cobertura-coverage.xml
```

## Configuration for CI

### CI-Specific Config

```typescript
// besting.config.ts
export default {
  // CI detection
  ...(process.env.CI && {
    reporters: ['default', 'junit'],
    outputFile: './test-results.xml',
    coverage: {
      enabled: true,
      reporter: ['text', 'lcov', 'cobertura'],
    },
    retry: 2, // Retry flaky tests in CI
  }),
}
```

### Environment-Based Config

```typescript
const isCI = process.env.CI === 'true'

export default {
  watch: !isCI,
  coverage: {
    enabled: isCI,
  },
  reporters: isCI
    ? ['default', ['junit', { outputFile: './results.xml' }]]
    : ['default'],
}
```

## Test Reporting

### JUnit Reports

```bash
bun test --reporter=junit --outputFile=test-results.xml
```

### HTML Reports

```bash
bun test --reporter=html --outputFile=./reports/index.html
```

### JSON Reports

```bash
bun test --reporter=json --outputFile=test-results.json
```

## Coverage Thresholds

### Fail on Low Coverage

```typescript
export default {
  coverage: {
    thresholds: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
}
```

### Per-File Thresholds

```typescript
export default {
  coverage: {
    perFile: true,
    thresholds: {
      lines: 70,
    },
  },
}
```

## Pull Request Integration

### Status Checks

```yaml
# GitHub Actions
- name: Run tests
  run: bun test --coverage

- name: Check coverage
  run: |
    COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    if (( $(echo "$COVERAGE < 80" | bc -l) )); then
      echo "Coverage below threshold: $COVERAGE%"
      exit 1
    fi
```

### PR Comments

```yaml
- name: Comment coverage
  uses: marocchino/sticky-pull-request-comment@v2
  with:
    path: coverage/coverage-summary.txt
```

## Flaky Test Handling

### Retry Strategy

```typescript
export default {
  retry: 2,
  retryDelay: 1000,
}
```

### Quarantine Flaky Tests

```typescript
it.skip('flaky test - quarantined', async () => {
  // Investigate and fix
})
```

### Track Flakiness

```yaml
- name: Run tests with flake detection
  run: |
    for i in {1..3}; do
      bun test --json >> test-runs.json
    done
    # Analyze for flaky tests
```

## Notifications

### Slack on Failure

```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Tests failed on ${{ github.ref }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## Best Practices

1. **Cache dependencies**: Speed up CI with caching
2. **Shard large suites**: Split tests across jobs
3. **Retry flaky tests**: Handle transient failures
4. **Enforce coverage**: Set minimum thresholds
5. **Fast feedback**: Run quick tests first
6. **Report results**: Publish test reports

## Related

- [Configuration](/advanced/configuration) - Full configuration
- [Performance](/advanced/performance) - Test optimization
- [Test Suites](/features/test-suites) - Test organization
