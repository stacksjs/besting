import { afterEach, api, assertResponse, beforeEach, describe, expect, test } from 'besting'

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

describe('Enhanced API Testing', () => {
  beforeEach(() => {
    // Mock fetch before each test
    globalThis.fetch = mockFetch as typeof fetch

    // Reset mock data
    mockResponseData = {
      data: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      },
    }
    mockResponseStatus = 200
    mockResponseHeaders = {
      'content-type': 'application/json',
    }
  })

  afterEach(() => {
    // Restore original fetch after each test
    globalThis.fetch = originalFetch
  })

  test('can make Laravel-style assertions on success response', async () => {
    const response = await api('https://example.com').get('/users/1')

    const assertion = await assertResponse(response)

    // Test the enhanced status assertions
    await assertion.assertOk()
    await assertion.assertSuccessful()
    await assertion.assertStatus(200)
  })

  test('can use created status assertion', async () => {
    mockResponseStatus = 201
    mockResponseData = { data: { id: 1, name: 'New User' } }

    const response = await api('https://example.com').post('/users', { name: 'New User' })

    const assertion = await assertResponse(response)
    await assertion.assertCreated()
  })

  test('can use no content status assertion', async () => {
    mockResponseStatus = 204
    mockResponseData = null

    const response = await api('https://example.com').delete('/users/1')

    const assertion = await assertResponse(response)
    await assertion.assertNoContent()
  })

  test('can test not found responses', async () => {
    mockResponseStatus = 404
    mockResponseData = { message: 'User not found' }

    const response = await api('https://example.com').get('/users/999')

    const assertion = await assertResponse(response)
    await assertion.assertNotFound()
  })

  test('can test unauthorized responses', async () => {
    mockResponseStatus = 401
    mockResponseData = { message: 'Unauthenticated' }

    const response = await api('https://example.com').get('/api/protected')

    const assertion = await assertResponse(response)
    await assertion.assertUnauthorized()
  })

  test('can test forbidden responses', async () => {
    mockResponseStatus = 403
    mockResponseData = { message: 'Forbidden' }

    const response = await api('https://example.com').get('/api/admin')

    const assertion = await assertResponse(response)
    await assertion.assertForbidden()
  })

  test('can test validation error responses', async () => {
    mockResponseStatus = 422
    mockResponseData = {
      message: 'Validation failed',
      errors: {
        email: ['The email field is required'],
        password: ['The password field is required'],
      },
    }

    const response = await api('https://example.com').post('/users', {})

    const assertion = await assertResponse(response)
    await assertion.assertValidationError()
    await assertion.assertValidationErrors(['email', 'password'])
  })

  test('can assert on redirect', async () => {
    mockResponseStatus = 302
    mockResponseHeaders = {
      'content-type': 'text/html',
      'location': 'https://example.com/login',
    }

    const response = await api('https://example.com').get('/profile')

    const assertion = await assertResponse(response)
    await assertion.assertRedirect()
    await assertion.assertHeader('location', 'https://example.com/login')
  })

  test('can assert on JSON fragment', async () => {
    mockResponseData = {
      data: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        address: {
          city: 'New York',
          zip: '10001',
        },
        roles: ['user', 'editor'],
      },
    }

    const response = await api('https://example.com').get('/users/1')

    const assertion = await assertResponse(response)

    // Assert on a subset of the JSON
    await assertion.assertJsonFragment({
      data: {
        address: {
          city: 'New York',
        },
        roles: ['user', 'editor'],
      },
    })
  })

  test('can assert on JSON paths', async () => {
    mockResponseData = {
      data: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        nested: {
          key: 'value',
        },
        array: [1, 2, 3],
      },
    }

    const response = await api('https://example.com').get('/users/1')

    const assertion = await assertResponse(response)

    // Check that paths exist
    await assertion.assertJsonPath('data.id')
    await assertion.assertJsonPath('data.nested.key')

    // Check specific values
    await assertion.assertJsonPath('data.id', 1)
    await assertion.assertJsonPath('data.name', 'Test User')
    await assertion.assertJsonPath('data.nested.key', 'value')
  })

  test('can assert on missing JSON paths', async () => {
    mockResponseData = {
      data: {
        id: 1,
        name: 'Test User',
      },
    }

    const response = await api('https://example.com').get('/users/1')

    const assertion = await assertResponse(response)

    // These paths should not exist
    await assertion.assertJsonMissingPath('data.address')
    await assertion.assertJsonMissingPath('data.roles')
  })

  test('can assert on content type', async () => {
    const response = await api('https://example.com').get('/users/1')

    const assertion = await assertResponse(response)

    // Check content type
    await assertion.assertContentType('application/json')
    await assertion.assertIsJson()
  })
})
