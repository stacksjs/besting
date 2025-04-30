import { beforeEach, describe, expect, test } from 'besting'
import { cookie } from '../src/cookie'

describe('Cookie Testing', () => {
  beforeEach(() => {
    // Clear all cookies before each test
    cookie().clear()
  })

  test('can set and get cookies', () => {
    const cookieJar = cookie()

    // Set a cookie
    cookieJar.set('test-cookie', 'test-value')

    // Get the cookie
    const value = cookieJar.get('test-cookie')

    expect(value).toBe('test-value')
  })

  test('can check if a cookie exists', () => {
    const cookieJar = cookie()

    // Initially cookie should not exist
    expect(cookieJar.has('test-cookie')).toBeFalsy()

    // Set a cookie
    cookieJar.set('test-cookie', 'test-value')

    // Now cookie should exist
    expect(cookieJar.has('test-cookie')).toBeTruthy()
  })

  test('can remove a cookie', () => {
    const cookieJar = cookie()

    // Set a cookie
    cookieJar.set('removable', 'value')

    // Cookie should exist
    expect(cookieJar.has('removable')).toBeTruthy()

    // Remove the cookie
    cookieJar.remove('removable')

    // Cookie should no longer exist
    expect(cookieJar.has('removable')).toBeFalsy()
  })

  test('can clear all cookies', () => {
    const cookieJar = cookie()

    // Set multiple cookies
    cookieJar
      .set('cookie1', 'value1')
      .set('cookie2', 'value2')
      .set('cookie3', 'value3')

    // Cookies should exist
    expect(cookieJar.has('cookie1')).toBeTruthy()
    expect(cookieJar.has('cookie2')).toBeTruthy()
    expect(cookieJar.has('cookie3')).toBeTruthy()

    // Clear all cookies
    cookieJar.clear()

    // No cookies should exist
    expect(cookieJar.has('cookie1')).toBeFalsy()
    expect(cookieJar.has('cookie2')).toBeFalsy()
    expect(cookieJar.has('cookie3')).toBeFalsy()
  })

  test('can get all cookies', () => {
    const cookieJar = cookie()

    // Set multiple cookies
    cookieJar
      .set('cookie1', 'value1')
      .set('cookie2', 'value2')

    // Get all cookies
    const cookies = cookieJar.getAll()

    expect(cookies).toEqual({
      cookie1: 'value1',
      cookie2: 'value2',
    })
  })

  test('assertHas passes when cookie exists', () => {
    const cookieJar = cookie()

    // Set a cookie
    cookieJar.set('assert-has', 'value')

    // Assert should pass
    cookieJar.assertHas('assert-has')
  })

  test('assertMissing passes when cookie does not exist', () => {
    const cookieJar = cookie()

    // Assert should pass for non-existent cookie
    cookieJar.assertMissing('non-existent')
  })

  test('assertValue passes when cookie has correct value', () => {
    const cookieJar = cookie()

    // Set a cookie
    cookieJar.set('assert-value', 'correct-value')

    // Assert should pass
    cookieJar.assertValue('assert-value', 'correct-value')
  })

  test('assertValueContains passes when cookie value contains substring', () => {
    const cookieJar = cookie()

    // Set a cookie
    cookieJar.set('assert-contains', 'this is a test value')

    // Assert should pass
    cookieJar.assertValueContains('assert-contains', 'test')
  })

  test('cookie methods are chainable', () => {
    const cookieJar = cookie()

    // Chain multiple methods
    cookieJar
      .set('cookie1', 'value1')
      .set('cookie2', 'value2')
      .assertHas('cookie1')
      .assertHas('cookie2')
      .assertValue('cookie1', 'value1')
      .remove('cookie1')
      .assertMissing('cookie1')
      .assertHas('cookie2')
  })
})
