import { api, assertResponse, describe, expect, test } from 'besting'

// Example 1: Basic API tests using the fluent API
test('Basic GET request', async () => {
  // Make a GET request to a public API
  const response = await api('https://jsonplaceholder.typicode.com')
    .get('/posts/1')

  // Use the assertResponse helper for fluent assertions
  const assertion = await assertResponse(response).assertOk()
  await assertion.assertStatus(200)
  await assertion.assertHeader('content-type')
  await assertion.assertContentType('application/json; charset=utf-8')

  // Parse and assert JSON content
  const data = await response.json()
  expect(data).toHaveProperty('id', 1)
  expect(data).toHaveProperty('title')
  expect(data).toHaveProperty('body')
})

// Example 2: Testing API with different HTTP methods
describe('API HTTP methods', () => {
  const baseApi = api('https://jsonplaceholder.typicode.com')

  test('GET request with query parameters', async () => {
    const response = await baseApi
      .withQuery({ userId: '1' })
      .get('/posts')

    const assertion = await assertResponse(response).assertOk()
    await assertion.assertStatus(200)

    const posts = await response.json()
    expect(Array.isArray(posts)).toBeTruthy()
    expect(posts.length).toBeGreaterThan(0)
    expect(posts[0]).toHaveProperty('userId', 1)
  })

  test('POST request with JSON data', async () => {
    const postData = {
      title: 'foo',
      body: 'bar',
      userId: 1,
    }

    const response = await baseApi
      .post('/posts', postData)

    const assertion = await assertResponse(response).assertOk()
    await assertion.assertStatus(201)

    const data = await response.json()
    expect(data).toHaveProperty('id')
    expect(data).toHaveProperty('title', 'foo')
    expect(data).toHaveProperty('body', 'bar')
  })

  test('PUT request to update a resource', async () => {
    const updateData = {
      title: 'Updated Title',
      body: 'Updated content',
      userId: 1,
    }

    const response = await baseApi
      .put('/posts/1', updateData)

    await assertResponse(response).assertOk()

    const data = await response.json()
    expect(data).toHaveProperty('title', 'Updated Title')
  })

  test('PATCH request for partial update', async () => {
    const patchData = {
      title: 'Patched Title',
    }

    const response = await baseApi
      .patch('/posts/1', patchData)

    await assertResponse(response).assertOk()

    const data = await response.json()
    expect(data).toHaveProperty('title', 'Patched Title')
  })

  test('DELETE request', async () => {
    const response = await baseApi
      .delete('/posts/1')

    const assertion = await assertResponse(response).assertOk()
    await assertion.assertStatus(200)
  })
})

// Example 3: Testing with authentication
describe('Authenticated requests', () => {
  test('Using a token for authentication', async () => {
    // This is a fake token - in a real test you would use an actual token
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

    const response = await api('https://jsonplaceholder.typicode.com')
      .withToken(token)
      .get('/posts/1')

    await assertResponse(response).assertOk()
  })

  test('Using basic auth', async () => {
    const response = await api('https://jsonplaceholder.typicode.com')
      .withBasicAuth('username', 'password')
      .get('/posts/1')

    await assertResponse(response).assertOk()
  })
})

// Example 4: Testing JSON responses in detail
test('Asserting JSON structure and values', async () => {
  const response = await api('https://jsonplaceholder.typicode.com')
    .get('/users/1')

  const assertion = await assertResponse(response).assertOk()
  await assertion.assertJsonPath('name')
  await assertion.assertJsonPath('email')
  await assertion.assertJsonPath('address.street')
  await assertion.assertJsonPath('address.geo.lat')
  await assertion.assertJsonPath('address.geo.lng')

  // Assert specific JSON values
  const assertion2 = await assertResponse(response)
  await assertion2.assertJsonPath('id', 1)
  await assertion2.assertJsonPath('address.city')

  // Get the full JSON for more complex assertions
  const data = await response.json()
  expect(data.address).toHaveProperty('geo')
  expect(data.address.geo).toHaveProperty('lat')
  expect(data.address.geo).toHaveProperty('lng')
})

// Example 5: Error handling and timeout
test('Handling a 404 response', async () => {
  const response = await api('https://jsonplaceholder.typicode.com')
    .get('/nonexistent')

  const assertion = await assertResponse(response)
  await assertion.assertStatus(404)
})

test('Setting a custom timeout', async () => {
  const response = await api('https://jsonplaceholder.typicode.com')
    .withTimeout(5000) // 5 seconds timeout
    .get('/posts/1')

  await assertResponse(response).assertOk()
})

// Example 6: Laravel-like API testing pattern
describe('Laravel-style API testing', () => {
  test('Fluent API testing style', async () => {
    // Laravel-like testing style
    const response = await api('https://jsonplaceholder.typicode.com')
      .withHeaders({
        'X-Custom-Header': 'Test',
      })
      .get('/posts/1')

    const assertion = await assertResponse(response).assertOk()
    await assertion.assertStatus(200)
    await assertion.assertJsonPath('id', 1)
  })
})
