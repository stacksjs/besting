import { expect } from './test'

/**
 * URL Test case for making assertions about URLs
 */
export class UrlTest {
  private _url: URL

  constructor(url: string | URL) {
    if (typeof url === 'string') {
      this._url = new URL(url)
    }
    else {
      this._url = url
    }
  }

  /**
   * Assert that the URL has a specific protocol
   */
  hasProtocol(protocol: string): this {
    // Normalize by removing the trailing colon if present
    const expected = protocol.endsWith(':') ? protocol : `${protocol}:`
    const actual = this._url.protocol

    expect(actual).toBe(expected)
    return this
  }

  /**
   * Assert that the URL has a specific host
   */
  hasHost(host: string): this {
    expect(this._url.host).toBe(host)
    return this
  }

  /**
   * Assert that the URL has a specific hostname (without port)
   */
  hasHostname(hostname: string): this {
    expect(this._url.hostname).toBe(hostname)
    return this
  }

  /**
   * Assert that the URL has a specific port
   */
  hasPort(port: string): this {
    expect(this._url.port).toBe(port)
    return this
  }

  /**
   * Assert that the URL has a specific path
   */
  hasPath(path: string): this {
    // Normalize path
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    expect(this._url.pathname).toBe(normalizedPath)
    return this
  }

  /**
   * Assert that the URL has a specific query parameter
   */
  hasQuery(name: string, value?: string): this {
    const params = new URLSearchParams(this._url.search)
    expect(params.has(name)).toBeTruthy()

    if (value !== undefined) {
      expect(params.get(name)).toBe(value)
    }

    return this
  }

  /**
   * Assert that the URL doesn't have a specific query parameter
   */
  doesntHaveQuery(name: string): this {
    const params = new URLSearchParams(this._url.search)
    expect(params.has(name)).toBeFalsy()
    return this
  }

  /**
   * Assert that the URL has a specific fragment
   */
  hasFragment(fragment: string): this {
    // Normalize by removing the leading # if present
    const expected = fragment.startsWith('#') ? fragment.substring(1) : fragment
    expect(this._url.hash.substring(1)).toBe(expected)
    return this
  }

  /**
   * Assert that the URL has a specific username
   */
  hasUsername(username: string): this {
    expect(decodeURIComponent(this._url.username)).toBe(username)
    return this
  }

  /**
   * Assert that the URL has a specific password
   */
  hasPassword(password: string): this {
    expect(decodeURIComponent(this._url.password)).toBe(password)
    return this
  }

  /**
   * Assert that the URL equals another URL
   */
  equals(url: string | URL): this {
    const compareUrl = typeof url === 'string' ? new URL(url) : url
    expect(this._url.href).toBe(compareUrl.href)
    return this
  }

  /**
   * Get the origin of the URL
   */
  get origin(): string {
    return this._url.origin
  }

  /**
   * Get the href of the URL
   */
  get href(): string {
    return this._url.href
  }

  /**
   * Get the path of the URL
   */
  get path(): string {
    return this._url.pathname
  }

  /**
   * Get the query string of the URL
   */
  get query(): string {
    return this._url.search
  }

  /**
   * Get the query parameters as an object
   */
  get queryParams(): Record<string, string> {
    const params = new URLSearchParams(this._url.search)
    const result: Record<string, string> = {}

    params.forEach((value, key) => {
      result[key] = value
    })

    return result
  }

  /**
   * Get the raw URL object
   */
  get url(): URL {
    return this._url
  }
}

/**
 * Create a URL test instance
 */
export function url(urlString: string | URL): UrlTest {
  return new UrlTest(urlString)
}
