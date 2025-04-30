import type { ApiRequestOptions, ApiResponse, ApiTestCase } from './types'
import { config } from './config'
import { expect } from './test'

/**
 * Wrapper around fetch that returns an ApiResponse
 */
async function makeFetchRequest(
  method: string,
  url: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers || {}),
  }

  // Add content-type for methods that may have a body
  if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && options.json !== false) {
    headers['Content-Type'] = 'application/json'
  }

  // Build the query string
  const queryParams = options.query ? new URLSearchParams(options.query).toString() : ''
  const fullUrl = queryParams ? `${url}${url.includes('?') ? '&' : '?'}${queryParams}` : url

  // Prepare fetch options
  const fetchOptions: RequestInit = {
    method,
    headers,
  }

  // Add body for methods that support it
  if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && options.data !== undefined) {
    fetchOptions.body = options.json !== false
      ? JSON.stringify(options.data)
      : options.data
  }

  // Make the request with timeout
  const controller = new AbortController()
  fetchOptions.signal = controller.signal

  const timeout = options.timeout || 30000 // Default to 30 seconds
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(fullUrl, fetchOptions)
    clearTimeout(timeoutId)

    // Extract response headers
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    // Build response object
    const apiResponse: ApiResponse = {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: null,
      json: async () => {
        const text = await response.text()
        try {
          return text ? JSON.parse(text) : null
        }
        catch (e) {
          throw new Error(`Failed to parse response as JSON: ${e}`)
        }
      },
      text: async () => await response.text(),
    }

    return apiResponse
  }
  catch (error: unknown) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`)
    }
    throw error
  }
}

/**
 * ApiTestCase implementation
 */
class ApiTest implements ApiTestCase {
  private _baseUrl: string
  private _headers: Record<string, string> = {}
  private _query: Record<string, string> = {}
  private _json: boolean = true
  private _timeout: number = 30000

  constructor(baseUrl: string = '') {
    this._baseUrl = baseUrl || config.baseUrl || ''
  }

  /**
   * Make a GET request
   */
  async get(url: string, options: ApiRequestOptions = {}): Promise<ApiResponse> {
    return this._request('GET', url, options)
  }

  /**
   * Make a POST request
   */
  async post(url: string, data?: any, options: ApiRequestOptions = {}): Promise<ApiResponse> {
    return this._request('POST', url, { ...options, data })
  }

  /**
   * Make a PUT request
   */
  async put(url: string, data?: any, options: ApiRequestOptions = {}): Promise<ApiResponse> {
    return this._request('PUT', url, { ...options, data })
  }

  /**
   * Make a PATCH request
   */
  async patch(url: string, data?: any, options: ApiRequestOptions = {}): Promise<ApiResponse> {
    return this._request('PATCH', url, { ...options, data })
  }

  /**
   * Make a DELETE request
   */
  async delete(url: string, options: ApiRequestOptions = {}): Promise<ApiResponse> {
    return this._request('DELETE', url, options)
  }

  /**
   * Make a HEAD request
   */
  async head(url: string, options: ApiRequestOptions = {}): Promise<ApiResponse> {
    return this._request('HEAD', url, options)
  }

  /**
   * Make an OPTIONS request
   */
  async options(url: string, options: ApiRequestOptions = {}): Promise<ApiResponse> {
    return this._request('OPTIONS', url, options)
  }

  /**
   * Set the base URL for requests
   */
  baseUrl(url: string): ApiTestCase {
    const clone = this._clone()
    clone._baseUrl = url
    return clone
  }

  /**
   * Set headers for requests
   */
  withHeaders(headers: Record<string, string>): ApiTestCase {
    const clone = this._clone()
    clone._headers = { ...clone._headers, ...headers }
    return clone
  }

  /**
   * Set an authorization token
   */
  withToken(token: string): ApiTestCase {
    return this.withHeaders({
      Authorization: `Bearer ${token}`,
    })
  }

  /**
   * Set basic authentication
   */
  withBasicAuth(username: string, password: string): ApiTestCase {
    // Use btoa instead of Buffer for browser compatibility
    const credentials = btoa(`${username}:${password}`)
    return this.withHeaders({
      Authorization: `Basic ${credentials}`,
    })
  }

  /**
   * Set query parameters
   */
  withQuery(params: Record<string, string>): ApiTestCase {
    const clone = this._clone()
    clone._query = { ...clone._query, ...params }
    return clone
  }

  /**
   * Set JSON mode for requests
   */
  withJson(): ApiTestCase {
    const clone = this._clone()
    clone._json = true
    return clone
  }

  /**
   * Set timeout for requests
   */
  withTimeout(ms: number): ApiTestCase {
    const clone = this._clone()
    clone._timeout = ms
    return clone
  }

  /**
   * Make a request with the current configuration
   */
  private async _request(method: string, url: string, options: ApiRequestOptions = {}): Promise<ApiResponse> {
    const fullUrl = url.startsWith('http') ? url : `${this._baseUrl}${url}`
    const requestOptions: ApiRequestOptions = {
      headers: { ...this._headers, ...(options.headers || {}) },
      query: { ...this._query, ...(options.query || {}) },
      data: options.data,
      json: options.json !== undefined ? options.json : this._json,
      timeout: options.timeout || this._timeout,
    }

    return makeFetchRequest(method, fullUrl, requestOptions)
  }

  /**
   * Clone the current instance
   */
  private _clone(): ApiTest {
    const clone = new ApiTest(this._baseUrl)
    clone._headers = { ...this._headers }
    clone._query = { ...this._query }
    clone._json = this._json
    clone._timeout = this._timeout
    return clone
  }
}

/**
 * Create an API test client
 */
export function api(baseUrl?: string): ApiTestCase {
  return new ApiTest(baseUrl)
}

/**
 * Enhanced API response assertion with Laravel-like methods
 */
export class ApiResponseAssertion {
  constructor(private response: ApiResponse) {}

  /**
   * Assert that the response has a successful status code
   */
  async assertOk(): Promise<this> {
    expect(this.response.status).toBeGreaterThanOrEqual(200)
    expect(this.response.status).toBeLessThan(300)
    return this
  }

  /**
   * Assert that the response has a specific status code
   */
  async assertStatus(status: number): Promise<this> {
    expect(this.response.status).toBe(status)
    return this
  }

  /**
   * Assert that the response has a created (201) status code
   */
  async assertCreated(): Promise<this> {
    return this.assertStatus(201)
  }

  /**
   * Assert that the response has a no content (204) status code
   */
  async assertNoContent(): Promise<this> {
    return this.assertStatus(204)
  }

  /**
   * Assert that the response has an OK (200) status code
   */
  async assertSuccessful(): Promise<this> {
    expect(this.response.status).toBeGreaterThanOrEqual(200)
    expect(this.response.status).toBeLessThan(300)
    return this
  }

  /**
   * Assert that the response has a redirect status code
   */
  async assertRedirect(): Promise<this> {
    expect(this.response.status).toBeGreaterThanOrEqual(300)
    expect(this.response.status).toBeLessThan(400)
    return this
  }

  /**
   * Assert that the response has a not found (404) status code
   */
  async assertNotFound(): Promise<this> {
    return this.assertStatus(404)
  }

  /**
   * Assert that the response has an unauthorized (401) status code
   */
  async assertUnauthorized(): Promise<this> {
    return this.assertStatus(401)
  }

  /**
   * Assert that the response has a forbidden (403) status code
   */
  async assertForbidden(): Promise<this> {
    return this.assertStatus(403)
  }

  /**
   * Assert that the response has a validation error (422) status code
   */
  async assertValidationError(): Promise<this> {
    return this.assertStatus(422)
  }

  /**
   * Assert that the response JSON matches the expected value
   */
  async assertJson(expected: any): Promise<this> {
    const json = await this.response.json()
    expect(json).toEqual(expected)
    return this
  }

  /**
   * Assert that the response JSON contains the expected values (subset)
   */
  async assertJsonFragment(expected: any): Promise<this> {
    const json = await this.response.json()
    this._assertJsonContains(json, expected)
    return this
  }

  /**
   * Helper to check if an object contains all properties from another object
   */
  private _assertJsonContains(haystack: any, needle: any): void {
    if (typeof needle !== 'object' || needle === null) {
      expect(haystack).toEqual(needle)
      return
    }

    for (const key in needle) {
      if (Object.prototype.hasOwnProperty.call(needle, key)) {
        expect(haystack).toHaveProperty(key)

        if (typeof needle[key] === 'object' && needle[key] !== null) {
          this._assertJsonContains(haystack[key], needle[key])
        }
        else {
          expect(haystack[key]).toEqual(needle[key])
        }
      }
    }
  }

  /**
   * Assert that a JSON path exists
   */
  async assertJsonPath(path: string, expected?: any): Promise<this> {
    const json = await this.response.json()
    const value = this._getJsonPathValue(json, path)

    expect(value).toBeDefined()

    if (expected !== undefined) {
      expect(value).toEqual(expected)
    }

    return this
  }

  /**
   * Assert that a JSON path does not exist
   */
  async assertJsonMissingPath(path: string): Promise<this> {
    const json = await this.response.json()
    const value = this._getJsonPathValue(json, path, true)

    expect(value).toBeUndefined()

    return this
  }

  /**
   * Get a value from a JSON path
   */
  private _getJsonPathValue(obj: any, path: string, allowMissing: boolean = false): any {
    const parts = path.split('.')
    let current = obj

    for (const part of parts) {
      if (current === undefined || current === null) {
        return allowMissing ? undefined : null
      }

      current = current[part]
    }

    return current
  }

  /**
   * Assert that the response has a specific header
   */
  async assertHeader(name: string, value?: string): Promise<this> {
    const headerName = name.toLowerCase()
    expect(this.response.headers).toHaveProperty(headerName)

    if (value !== undefined) {
      expect(this.response.headers[headerName]).toBe(value)
    }

    return this
  }

  /**
   * Assert that the response has a specific content type
   */
  async assertContentType(type: string): Promise<this> {
    return this.assertHeader('content-type', type)
  }

  /**
   * Assert that the response is JSON
   */
  async assertIsJson(): Promise<this> {
    const contentType = this.response.headers['content-type'] || ''
    expect(contentType).toMatch(/application\/json/)
    return this
  }

  /**
   * Assert that the response contains validation errors for specific fields
   */
  async assertValidationErrors(fields: string[]): Promise<this> {
    await this.assertStatus(422)

    const json = await this.response.json()
    expect(json).toHaveProperty('errors')

    for (const field of fields) {
      expect(json.errors).toHaveProperty(field)
    }

    return this
  }

  /**
   * Get the response JSON
   */
  async json(): Promise<any> {
    return await this.response.json()
  }

  /**
   * Get the response text
   */
  async text(): Promise<string> {
    return await this.response.text()
  }

  /**
   * Get the response status
   */
  get status(): number {
    return this.response.status
  }

  /**
   * Get the response headers
   */
  get headers(): Record<string, string> {
    return this.response.headers
  }
}

/**
 * Convert an ApiResponse to an assertion object
 */
export function assertResponse(response: ApiResponse): ApiResponseAssertion {
  return new ApiResponseAssertion(response)
}

// Define types for augmented responses
declare global {
  interface ApiResponseAugmented extends ApiResponse {
    assertOk(): Promise<ApiResponseAssertion>
    assertStatus(status: number): Promise<ApiResponseAssertion>
    assertJson(expected: any): Promise<ApiResponseAssertion>
    assertJsonPath(path: string, expected?: any): Promise<ApiResponseAssertion>
    assertHeader(name: string, value?: string): Promise<ApiResponseAssertion>
    assertContentType(type: string): Promise<ApiResponseAssertion>
  }
}

/**
 * Methods to extend ApiResponse with assertions
 */
export interface ApiResponseAssertionMethods {
  assertOk: (this: ApiResponse) => Promise<ApiResponseAssertion>
  assertStatus: (this: ApiResponse, status: number) => Promise<ApiResponseAssertion>
  assertJson: (this: ApiResponse, expected: any) => Promise<ApiResponseAssertion>
  assertJsonPath: (this: ApiResponse, path: string, expected?: any) => Promise<ApiResponseAssertion>
  assertHeader: (this: ApiResponse, name: string, value?: string) => Promise<ApiResponseAssertion>
  assertContentType: (this: ApiResponse, type: string) => Promise<ApiResponseAssertion>
}

/**
 * Returns methods for extending ApiResponse with assertion capabilities
 */
export function extendApiResponseWithAssertions(): ApiResponseAssertionMethods {
  return {
    assertOk(this: ApiResponse): Promise<ApiResponseAssertion> {
      return assertResponse(this).assertOk()
    },
    assertStatus(this: ApiResponse, status: number): Promise<ApiResponseAssertion> {
      return assertResponse(this).assertStatus(status)
    },
    assertJson(this: ApiResponse, expected: any): Promise<ApiResponseAssertion> {
      return assertResponse(this).assertJson(expected)
    },
    assertJsonPath(this: ApiResponse, path: string, expected?: any): Promise<ApiResponseAssertion> {
      return assertResponse(this).assertJsonPath(path, expected)
    },
    assertHeader(this: ApiResponse, name: string, value?: string): Promise<ApiResponseAssertion> {
      return assertResponse(this).assertHeader(name, value)
    },
    assertContentType(this: ApiResponse, type: string): Promise<ApiResponseAssertion> {
      return assertResponse(this).assertContentType(type)
    },
  }
}
