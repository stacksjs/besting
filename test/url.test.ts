import { describe, expect, test } from 'besting'
import { url } from '../src/url'

describe('URL Testing', () => {
  test('can create URL test instance from string', () => {
    const testUrl = url('https://example.com')

    expect(testUrl.href).toBe('https://example.com/')
  })

  test('can create URL test instance from URL object', () => {
    const urlObject = new URL('https://example.com')
    const testUrl = url(urlObject)

    expect(testUrl.href).toBe('https://example.com/')
  })

  test('can test protocol', () => {
    const testUrl = url('https://example.com')

    testUrl.hasProtocol('https')

    // Try with protocol that doesn't match
    expect(() => {
      testUrl.hasProtocol('http')
    }).toThrow()
  })

  test('can test host', () => {
    const testUrl = url('https://example.com:8080')

    testUrl.hasHost('example.com:8080')

    // Test hostname without port
    testUrl.hasHostname('example.com')

    // Test port separately
    testUrl.hasPort('8080')
  })

  test('can test path', () => {
    const testUrl = url('https://example.com/path/to/resource')

    testUrl.hasPath('/path/to/resource')

    // Path is normalized if it doesn't start with a slash
    const testUrl2 = url('https://example.com/test')
    testUrl2.hasPath('test')
  })

  test('can test query parameters', () => {
    const testUrl = url('https://example.com/search?q=test&page=1&sort=desc')

    // Test presence of query parameters
    testUrl.hasQuery('q')
    testUrl.hasQuery('page')
    testUrl.hasQuery('sort')

    // Test query parameter values
    testUrl.hasQuery('q', 'test')
    testUrl.hasQuery('page', '1')
    testUrl.hasQuery('sort', 'desc')

    // Test absence of query parameters
    testUrl.doesntHaveQuery('filter')
  })

  test('can test fragment', () => {
    const testUrl = url('https://example.com/page#section')

    // Test with # prefix
    testUrl.hasFragment('#section')

    // Test without # prefix
    testUrl.hasFragment('section')
  })

  test('can test authentication components', () => {
    const testUrl = url('https://user:pass@example.com')

    testUrl.hasUsername('user')
    testUrl.hasPassword('pass')
  })

  test('can test encoded authentication components', () => {
    const testUrl = url('https://user%40domain:pass%21word@example.com')

    testUrl.hasUsername('user@domain')
    testUrl.hasPassword('pass!word')
  })

  test('can test URL equality', () => {
    const testUrl = url('https://example.com/path?q=test#fragment')

    // Test equality with string
    testUrl.equals('https://example.com/path?q=test#fragment')

    // Test equality with URL object
    testUrl.equals(new URL('https://example.com/path?q=test#fragment'))
  })

  test('can access URL components', () => {
    const testUrl = url('https://example.com:8080/path?q=test#fragment')

    expect(testUrl.origin).toBe('https://example.com:8080')
    expect(testUrl.href).toBe('https://example.com:8080/path?q=test#fragment')
    expect(testUrl.path).toBe('/path')
    expect(testUrl.query).toBe('?q=test')

    // Query parameters as object
    expect(testUrl.queryParams).toEqual({ q: 'test' })

    // Access the underlying URL object
    expect(testUrl.url instanceof URL).toBeTruthy()
  })

  test('methods are chainable', () => {
    url('https://user:pass@example.com:8080/path?q=test#fragment')
      .hasProtocol('https')
      .hasHost('example.com:8080')
      .hasHostname('example.com')
      .hasPort('8080')
      .hasPath('/path')
      .hasQuery('q', 'test')
      .hasFragment('fragment')
      .hasUsername('user')
      .hasPassword('pass')
  })
})
