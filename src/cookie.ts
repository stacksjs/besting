import type { CookieJar, CookieOptions, CookieTestCase } from './types'
import { expect } from './test'

/**
 * Default cookie jar implementation that stores cookies in memory
 */
class MemoryCookieJar implements CookieJar {
  private cookies: Record<string, string> = {}

  get(name: string): string | null {
    return this.cookies[name] || null
  }

  set(name: string, value: string, _options?: CookieOptions): void {
    this.cookies[name] = value
  }

  has(name: string): boolean {
    return name in this.cookies
  }

  remove(name: string): void {
    delete this.cookies[name]
  }

  clear(): void {
    this.cookies = {}
  }

  getAll(): Record<string, string> {
    return { ...this.cookies }
  }
}

/**
 * Cookie testing implementation
 */
class CookieTest implements CookieTestCase {
  private _jar: CookieJar

  constructor(jar: CookieJar = new MemoryCookieJar()) {
    this._jar = jar
  }

  /**
   * Assert that a cookie exists
   */
  assertHas(name: string): CookieTestCase {
    expect(this._jar.has(name)).toBeTruthy()
    return this
  }

  /**
   * Assert that a cookie does not exist
   */
  assertMissing(name: string): CookieTestCase {
    expect(this._jar.has(name)).toBeFalsy()
    return this
  }

  /**
   * Assert that a cookie has a specific value
   */
  assertValue(name: string, value: string): CookieTestCase {
    this.assertHas(name)
    expect(this._jar.get(name)).toBe(value)
    return this
  }

  /**
   * Assert that a cookie's value contains a substring
   */
  assertValueContains(name: string, value: string): CookieTestCase {
    this.assertHas(name)
    const cookieValue = this._jar.get(name)
    expect(cookieValue).toContain(value)
    return this
  }

  /**
   * Get a cookie value
   */
  get(name: string): string | null {
    return this._jar.get(name)
  }

  /**
   * Set a cookie
   */
  set(name: string, value: string, options?: CookieOptions): CookieTestCase {
    this._jar.set(name, value, options)
    return this
  }

  /**
   * Remove a cookie
   */
  remove(name: string): CookieTestCase {
    this._jar.remove(name)
    return this
  }

  /**
   * Clear all cookies
   */
  clear(): CookieTestCase {
    this._jar.clear()
    return this
  }

  /**
   * Get all cookies
   */
  getAll(): Record<string, string> {
    return this._jar.getAll()
  }
}

/**
 * Get a cookie test instance
 */
export function cookie(jar?: CookieJar): CookieTestCase {
  return new CookieTest(jar)
}

/**
 * This class is primarily intended for browser environments,
 * but we provide a no-op implementation for Node environments
 * to ensure type safety. In actual usage, a custom implementation
 * would be provided for Node.js via the cookie function.
 */
export class BrowserCookieJar implements CookieJar {
  private browserUnavailable = true

  constructor() {
    // Check for browser environment without direct DOM reference
    try {
      // @ts-expect-error - Intentionally checking global objects
      this.browserUnavailable = typeof globalThis.document === 'undefined'
    }
    catch (_error) {
      this.browserUnavailable = true
    }
  }

  private throwIfUnavailable(): void {
    if (this.browserUnavailable) {
      throw new Error('BrowserCookieJar is only available in browser environments')
    }
  }

  private parseCookies(): Record<string, string> {
    this.throwIfUnavailable()

    const cookies: Record<string, string> = {}

    try {
      // @ts-expect-error - Accessing browser APIs
      const cookieStr = globalThis.document?.cookie || ''
      const cookieList = cookieStr.split(';')

      for (const cookie of cookieList) {
        const parts = cookie.split('=').map((part: string) => part.trim())
        const name = parts[0]
        const value = parts[1] || ''

        if (name) {
          cookies[name] = value
        }
      }
    }
    catch (_error) {
      // Fail silently in non-browser environments
    }

    return cookies
  }

  get(name: string): string | null {
    if (this.browserUnavailable) {
      return null
    }

    const cookies = this.parseCookies()
    return cookies[name] || null
  }

  set(name: string, value: string, options: CookieOptions = {}): void {
    this.throwIfUnavailable()

    try {
      const cookieParts = [`${name}=${value}`]

      if (options.domain) {
        cookieParts.push(`domain=${options.domain}`)
      }

      if (options.path) {
        cookieParts.push(`path=${options.path}`)
      }

      if (options.expires) {
        cookieParts.push(`expires=${options.expires.toUTCString()}`)
      }

      if (options.maxAge) {
        cookieParts.push(`max-age=${options.maxAge}`)
      }

      if (options.secure) {
        cookieParts.push('secure')
      }

      if (options.httpOnly) {
        cookieParts.push('httponly')
      }

      if (options.sameSite) {
        cookieParts.push(`samesite=${options.sameSite}`)
      }

      // @ts-expect-error - Accessing browser APIs
      globalThis.document.cookie = cookieParts.join('; ')
    }
    catch (_error) {
      // Fail silently in non-browser environments
    }
  }

  has(name: string): boolean {
    if (this.browserUnavailable) {
      return false
    }

    const cookies = this.parseCookies()
    return name in cookies
  }

  remove(name: string): void {
    if (!this.browserUnavailable) {
      this.set(name, '', { expires: new Date(0) })
    }
  }

  clear(): void {
    if (this.browserUnavailable) {
      return
    }

    const cookies = this.parseCookies()
    for (const name of Object.keys(cookies)) {
      this.remove(name)
    }
  }

  getAll(): Record<string, string> {
    if (this.browserUnavailable) {
      return {}
    }

    return this.parseCookies()
  }
}
