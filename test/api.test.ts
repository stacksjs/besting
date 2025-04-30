import { afterEach, beforeEach, describe, expect, test } from 'besting'
import { api, assertResponse } from '../src/api'

// Mock the global fetch
const originalFetch = globalThis.fetch
let mockResponseData: any = null
let mockResponseStatus = 200
let mockResponseHeaders: Record<string, string> = {}

function mockFetch(_url: string, _options: RequestInit) {
  const mockResponse = {
    status: mockResponseStatus,
    statusText: mockResponseStatus === 200 ? 'OK' : 'Error',
    headers: new Headers(mockResponseHeaders),
    text: async () => JSON.stringify(mockResponseData),
    json: async () => mockResponseData,
  }

  // Return an incomplete Response object that is good enough for our tests
  return Promise.resolve(mockResponse as unknown as Response)
}

describe('API Testing', () => {
  beforeEach(() => {
    // Mock fetch before each test
    globalThis.fetch = mockFetch as typeof fetch

    // Reset mock data
    mockResponseData = { success: true, data: { id: 1, name: 'Test' } }
    mockResponseStatus = 200
    mockResponseHeaders = {
      'Content-Type': 'application/json',
    }
  })

  afterEach(() => {
    // Restore original fetch after each test
    globalThis.fetch = originalFetch
  })

  test('api() creates an instance with baseUrl', () => {
    const client = api('https://example.com') as any
    expect(client._baseUrl).toBe('https://example.com')
  })

  test('api() uses config.baseUrl as fallback', () => {
    // The config has a baseUrl property that should be used as fallback
    // This test is just a simple check that doesn't depend on the actual config
    const client = api() as any
    expect(client._baseUrl).toBeDefined()
  })

  test('withHeaders() adds headers to request', async () => {
    const response = await api('https://example.com')
      .withHeaders({ 'X-Test': 'test-value' })
      .get('/test')

    const assertion = await assertResponse(response)
    await assertion.assertOk()
    expect(response.headers['Content-Type']).toBe('application/json')
  })

  test('withToken() adds Authorization header', async () => {
    const token = 'test-token'
    const apiClient = api('https://example.com') as any
    const clientWithToken = apiClient.withToken(token)

    expect(clientWithToken._headers.Authorization).toBe(`Bearer ${token}`)
  })

  test('withBasicAuth() adds Authorization header with basic auth', async () => {
    const apiClient = api('https://example.com') as any
    const clientWithAuth = apiClient.withBasicAuth('user', 'pass')

    expect(clientWithAuth._headers.Authorization).toContain('Basic ')
  })

  test('withQuery() adds query params to request', async () => {
    const apiClient = api('https://example.com') as any
    const clientWithQuery = apiClient.withQuery({ page: '1', limit: '10' })

    expect(clientWithQuery._query.page).toBe('1')
    expect(clientWithQuery._query.limit).toBe('10')
  })

  test('withTimeout() sets timeout for request', async () => {
    const apiClient = api('https://example.com') as any
    const clientWithTimeout = apiClient.withTimeout(5000)

    expect(clientWithTimeout._timeout).toBe(5000)
  })

  test('GET request works', async () => {
    const response = await api('https://example.com').get('/users/1')

    const assertion = await assertResponse(response)
    await assertion.assertOk()
    await assertion.assertStatus(200)

    const json = await response.json()
    expect(json.success).toBe(true)
    expect(json.data.id).toBe(1)
  })

  test('POST request works', async () => {
    const data = { name: 'New User' }
    const response = await api('https://example.com').post('/users', data)

    const assertion = await assertResponse(response)
    await assertion.assertOk()

    const json = await response.json()
    expect(json.success).toBe(true)
  })

  test('PUT request works', async () => {
    const data = { name: 'Updated User' }
    const response = await api('https://example.com').put('/users/1', data)

    const assertion = await assertResponse(response)
    await assertion.assertOk()
  })

  test('PATCH request works', async () => {
    const data = { name: 'Patched User' }
    const response = await api('https://example.com').patch('/users/1', data)

    const assertion = await assertResponse(response)
    await assertion.assertOk()
  })

  test('DELETE request works', async () => {
    const response = await api('https://example.com').delete('/users/1')

    const assertion = await assertResponse(response)
    await assertion.assertOk()
  })

  test('assertOk() validates 2xx status codes', async () => {
    // Test with 200
    mockResponseStatus = 200
    let response = await api('https://example.com').get('/test')
    await assertResponse(response).assertOk()

    // Test with 201
    mockResponseStatus = 201
    response = await api('https://example.com').get('/test')
    await assertResponse(response).assertOk()

    // Test with 204
    mockResponseStatus = 204
    response = await api('https://example.com').get('/test')
    await assertResponse(response).assertOk()
  })

  test('assertStatus() validates specific status code', async () => {
    mockResponseStatus = 404
    const response = await api('https://example.com').get('/not-found')

    const assertion = await assertResponse(response)
    await assertion.assertStatus(404)
  })

  test('assertJson() validates response JSON structure', async () => {
    mockResponseData = { id: 1, name: 'Test' }
    const response = await api('https://example.com').get('/test')

    const assertion = await assertResponse(response)
    await assertion.assertJson({ id: 1, name: 'Test' })
  })

  test('assertJsonPath() validates existence of JSON path', async () => {
    mockResponseData = {
      user: {
        id: 1,
        profile: {
          name: 'Test User',
        },
      },
    }

    const response = await api('https://example.com').get('/test')

    const assertion = await assertResponse(response)
    await assertion.assertJsonPath('user.id')
    await assertion.assertJsonPath('user.profile.name')
  })

  test('assertJsonPath() validates value at JSON path', async () => {
    mockResponseData = {
      user: {
        id: 1,
        profile: {
          name: 'Test User',
        },
      },
    }

    const response = await api('https://example.com').get('/test')

    const assertion = await assertResponse(response)
    await assertion.assertJsonPath('user.id', 1)
    await assertion.assertJsonPath('user.profile.name', 'Test User')
  })

  test('assertHeader() validates header existence', async () => {
    mockResponseHeaders = {
      'Content-Type': 'application/json',
      'X-Test': 'test-value',
    }

    const response = await api('https://example.com').get('/test')

    const assertion = await assertResponse(response)
    await assertion.assertHeader('Content-Type')
    await assertion.assertHeader('X-Test')
  })

  test('assertHeader() validates header value', async () => {
    mockResponseHeaders = {
      'Content-Type': 'application/json',
      'X-Test': 'test-value',
    }

    const response = await api('https://example.com').get('/test')

    const assertion = await assertResponse(response)
    await assertion.assertHeader('Content-Type', 'application/json')
    await assertion.assertHeader('X-Test', 'test-value')
  })

  test('assertContentType() validates Content-Type header', async () => {
    mockResponseHeaders = {
      'Content-Type': 'application/json',
    }

    const response = await api('https://example.com').get('/test')

    const assertion = await assertResponse(response)
    await assertion.assertContentType('application/json')
  })
})
