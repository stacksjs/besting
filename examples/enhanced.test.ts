import { api, assertResponse, cache, cookie, describe, expect, test, url } from 'besting'

// Example 1: Testing cache functionality
describe('Cache Testing', () => {
  test('can store and retrieve values from cache', async () => {
    const cacheStore = cache()

    // Store a value
    await cacheStore.set('user_profile', { name: 'John', email: 'john@example.com' })

    // Assert that the key exists
    await cacheStore.assertHas('user_profile')

    // Retrieve the value
    const profile = await cacheStore.get('user_profile')
    expect(profile.name).toBe('John')
    expect(profile.email).toBe('john@example.com')

    // Clear the cache
    await cacheStore.clear()

    // Assert that the key is gone
    await cacheStore.assertMissing('user_profile')
  })

  test('can set values with time-to-live', async () => {
    const cacheStore = cache()

    // Store a value with a TTL of 1 second
    await cacheStore.set('short_lived', 'temporary data', 1)

    // Assert it exists immediately
    await cacheStore.assertHas('short_lived')

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1100))

    // Assert the value is gone after TTL
    await cacheStore.assertMissing('short_lived')
  })
})

// Example 2: Testing with cookies
describe('Cookie Testing', () => {
  test('can set and retrieve cookies', () => {
    const cookieJar = cookie()

    // Set a cookie
    cookieJar
      .set('session_id', '123456789')
      .set('user_preferences', 'dark_mode')

    // Assert cookies exist
    cookieJar
      .assertHas('session_id')
      .assertHas('user_preferences')

    // Assert cookie values
    cookieJar
      .assertValue('session_id', '123456789')
      .assertValueContains('user_preferences', 'dark')

    // Get cookie value
    const sessionId = cookieJar.get('session_id')
    expect(sessionId).toBe('123456789')

    // Remove a cookie
    cookieJar.remove('session_id')
    cookieJar.assertMissing('session_id')

    // Get all cookies
    const allCookies = cookieJar.getAll()
    expect(Object.keys(allCookies).length).toBe(1)
    expect(allCookies.user_preferences).toBe('dark_mode')
  })
})

// Example 3: URL testing
describe('URL Testing', () => {
  test('can make assertions about URL components', () => {
    const testUrl = url('https://user:pass@example.com:8080/path/to/page?query=value&sort=desc#section')

    testUrl
      .hasProtocol('https')
      .hasHost('example.com:8080')
      .hasHostname('example.com')
      .hasPort('8080')
      .hasPath('/path/to/page')
      .hasQuery('query', 'value')
      .hasQuery('sort', 'desc')
      .hasFragment('section')
      .hasUsername('user')
      .hasPassword('pass')

    // Test equality
    testUrl.equals('https://user:pass@example.com:8080/path/to/page?query=value&sort=desc#section')

    // Get specific components
    expect(testUrl.origin).toBe('https://example.com:8080')
    expect(testUrl.path).toBe('/path/to/page')
    expect(testUrl.queryParams.query).toBe('value')
    expect(testUrl.queryParams.sort).toBe('desc')
  })

  test('can assert absence of query parameters', () => {
    const testUrl = url('https://example.com/search?q=test&active=true')

    testUrl
      .hasQuery('q', 'test')
      .hasQuery('active', 'true')
      .doesntHaveQuery('page')
      .doesntHaveQuery('sort')
  })
})

// Example 4: Combined API and cache testing
describe('Combined API and Cache Testing', () => {
  test('can cache API responses', async () => {
    // Make an API request
    const response = await api('https://jsonplaceholder.typicode.com')
      .get('/posts/1')

    // Verify API response
    const assertion = await assertResponse(response).assertOk()
    await assertion.assertJsonPath('id', 1)

    // Get the JSON response
    const data = await response.json()

    // Store the API response in cache
    const cacheStore = cache()
    await cacheStore.set('post_1', data)

    // Verify it's in the cache
    await cacheStore.assertHas('post_1')

    // Compare cached data with API response
    const cachedData = await cacheStore.get('post_1')
    expect(cachedData.id).toBe(1)
    expect(cachedData).toEqual(data)
  })
})

// Example 5: Advanced URL testing with API responses
describe('URL Testing with API Responses', () => {
  test('can validate links from API response', async () => {
    // Make an API request
    const response = await api('https://jsonplaceholder.typicode.com')
      .get('/users/1')

    // Get the user data
    const user = await response.json()

    // Extract website URL from response
    const websiteUrl = user.website
    expect(websiteUrl).toBeDefined()

    // Ensure it's a valid URL by creating a URL test instance
    // No error means it's a valid URL
    const websiteTest = url(`http://${websiteUrl}`)

    // Test URL components
    websiteTest
      .hasProtocol('http')
      .hasPath('/')
  })
})
