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
 * Response assertions
 */
export class ApiResponseAssertion {
  constructor(private response: ApiResponse) {}

  /**
   * Assert the response status is in the 2xx range
   */
  async assertOk(): Promise<this> {
    expect(this.response.status).toBeGreaterThanOrEqual(200)
    expect(this.response.status).toBeLessThan(300)
    return this
  }

  /**
   * Assert the response has a specific status code
   */
  async assertStatus(status: number): Promise<this> {
    expect(this.response.status).toBe(status)
    return this
  }

  /**
   * Assert the response has a specific JSON structure
   */
  async assertJson(expected: any): Promise<this> {
    const json = await this.response.json()
    expect(json).toEqual(expected)
    return this
  }

  /**
   * Assert the response JSON contains specific values
   */
  async assertJsonPath(path: string, expected?: any): Promise<this> {
    const json = await this.response.json()
    const parts = path.split('.')
    let value = json

    for (const part of parts) {
      value = value[part]
      if (value === undefined) {
        throw new Error(`Path "${path}" not found in response JSON`)
      }
    }

    if (expected !== undefined) {
      expect(value).toEqual(expected)
    }

    return this
  }

  /**
   * Assert the response has a specific header
   */
  async assertHeader(name: string, value?: string): Promise<this> {
    const headers = this.response.headers
    const headerName = Object.keys(headers).find(key => key.toLowerCase() === name.toLowerCase())

    expect(headerName).toBeDefined()

    if (value !== undefined && headerName) {
      expect(headers[headerName]).toBe(value)
    }

    return this
  }

  /**
   * Assert the response has a specific content type
   */
  async assertContentType(type: string): Promise<this> {
    return this.assertHeader('Content-Type', type)
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
   * Get response status
   */
  get status(): number {
    return this.response.status
  }

  /**
   * Get response headers
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
