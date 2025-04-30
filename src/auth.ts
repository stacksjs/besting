import type { AuthTester } from './types'
import { expect } from './test'

/**
 * Authentication testing utilities for the Besting framework
 */

// Current authenticated user
let currentUser: any = null

/**
 * AuthTester implementation
 */
class AuthTestCase implements AuthTester {
  /**
   * Set the currently authenticated user
   */
  actingAs(user: any): AuthTester {
    currentUser = user
    return this
  }

  /**
   * Set no authenticated user (guest)
   */
  actingAsGuest(): AuthTester {
    currentUser = null
    return this
  }

  /**
   * Assert that a user is authenticated
   */
  assertAuthenticated(): AuthTester {
    expect(currentUser).not.toBeNull()
    return this
  }

  /**
   * Assert that no user is authenticated (guest)
   */
  assertGuest(): AuthTester {
    expect(currentUser).toBeNull()
    return this
  }

  /**
   * Get the currently authenticated user
   */
  user(): any {
    return currentUser
  }

  /**
   * Check if a user is authenticated
   */
  check(): boolean {
    return currentUser !== null
  }
}

/**
 * Create a new authentication test instance
 */
export function auth(): AuthTester {
  return new AuthTestCase()
}

/**
 * Add the user to the test request
 */
export function withAuth(user: any): Record<string, any> {
  return {
    user,
    auth: {
      user: () => user,
      check: () => !!user,
    },
  }
}
