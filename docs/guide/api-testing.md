---
title: API Testing
description: Laravel-inspired API testing utilities for HTTP endpoints.
---
  const response = await api('https://api.example.com')
    .get('/users')

  const data = await response.json()
  expect(data).toBeInstanceOf(Array)
})

```

### GET with Query Parameters

```ts

test('GET with query parameters', async () => {
  const response = await api('https://api.example.com')
    .withQuery({ filter: 'active', page: 1 })
    .get('/users')
})

```

### POST Requests

```ts

test('POST request', async () => {
  const response = await api('https://api.example.com')
    .post('/users', {
      name: 'John',
      email: 'john@example.com'
    })

  const assertion = await assertResponse(response)
  await assertion.assertStatus(201)
})

```

### PUT Requests

```ts

test('PUT request', async () => {
  const response = await api('https://api.example.com')
    .put('/users/1', { name: 'Updated Name' })

  const assertion = await assertResponse(response)
  await assertion.assertOk()
})

```

### DELETE Requests

```ts

test('DELETE request', async () => {
  const response = await api('https://api.example.com')
    .delete('/users/1')

  const assertion = await assertResponse(response)
  await assertion.assertStatus(204)
})

```

## Authentication

### Bearer Token

```ts

import { api, test } from 'besting'

test('authenticated request with token', async () => {
  const response = await api('https://api.example.com')
    .withToken('your-auth-token')
    .get('/secured-endpoint')

  const assertion = await assertResponse(response)
  await assertion.assertOk()
})

```

### Basic Authentication

```ts

test('basic authentication', async () => {
  const response = await api('https://api.example.com')
    .withBasicAuth('username', 'password')
    .get('/secured-endpoint')
})

```

## JSON Assertions

### Assert JSON Path

```ts

import { api, assertResponse, test } from 'besting'

test('assert JSON path', async () => {
  const response = await api('https://api.example.com')
    .get('/users/1')

  const assertion = await assertResponse(response)

  // Assert specific JSON paths
  await assertion.assertJsonPath('name', 'John Doe')
  await assertion.assertJsonPath('email')
  await assertion.assertJsonPath('address.city', 'New York')
})

```

### Assert JSON Structure

```ts

test('assert JSON structure', async () => {
  const response = await api('https://api.example.com')
    .get('/users/1')

  const assertion = await assertResponse(response)

  // Assert on the entire JSON structure
  await assertion.assertJson({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  })
})

```

## Response Assertions

### Status Assertions

```ts

import { assertResponse, test } from 'besting'

test('status assertions', async () => {
  const response = await api('https://api.example.com').get('/users')
  const assertion = await assertResponse(response)

  // Success statuses
  await assertion.assertOk()          // 200
  await assertion.assertStatus(200)   // specific status

  // Other common assertions
  // await assertion.assertCreated()   // 201
  // await assertion.assertNoContent() // 204
  // await assertion.assertNotFound()  // 404
})

```

### Header Assertions

```ts

test('header assertions', async () => {
  const response = await api('https://api.example.com').get('/users')
  const assertion = await assertResponse(response)

  // Assert header exists
  await assertion.assertHeader('content-type')

  // Assert header value
  await assertion.assertHeader('content-type', 'application/json')
})

```

## Request Configuration

### Custom Headers

```ts

test('custom headers', async () => {
  const response = await api('https://api.example.com')
    .withHeaders({
      'X-Custom-Header': 'Value',
      'Accept-Language': 'en-US'
    })
    .get('/endpoint')
})

```

### Timeout

```ts

test('with timeout', async () => {
  const response = await api('https://api.example.com')
    .withTimeout(5000) // 5 seconds
    .get('/slow-endpoint')
})

```

### JSON Content Type

```ts

test('ensure JSON content type', async () => {
  const response = await api('https://api.example.com')
    .withJson()
    .post('/users', { name: 'John' })
})

```

## Complete Example

```ts

import { api, assertResponse, describe, test } from 'besting'

describe('User API', () => {
  const baseUrl = 'https://api.example.com'
  let authToken: string

  test('login', async () => {
    const response = await api(baseUrl)
      .post('/auth/login', {
        email: 'user@example.com',
        password: 'password'
      })

    const assertion = await assertResponse(response)
    await assertion.assertOk()

    const data = await response.json()
    authToken = data.token
    expect(authToken).toBeDefined()
  })

  test('get user profile', async () => {
    const response = await api(baseUrl)
      .withToken(authToken)
      .get('/profile')

    const assertion = await assertResponse(response)
    await assertion.assertOk()
    await assertion.assertJsonPath('email', 'user@example.com')
  })

  test('update user profile', async () => {
    const response = await api(baseUrl)
      .withToken(authToken)
      .put('/profile', { name: 'Updated Name' })

    const assertion = await assertResponse(response)
    await assertion.assertOk()
  })

  test('unauthorized access', async () => {
    const response = await api(baseUrl)
      .get('/profile')

    const assertion = await assertResponse(response)
    await assertion.assertStatus(401)
  })
})

```

## Related

- [Getting Started](./getting-started.md) - Installation and setup
- [Database Testing](./database-testing.md) - Database testing utilities
- [Assertions](./assertions.md) - Assertion reference
