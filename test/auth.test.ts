import { afterEach, auth, describe, expect, test, withAuth } from 'besting'

// Define a user type
interface User {
  id: number
  name: string
  email: string
  isAdmin: boolean
}

describe('Authentication Testing', () => {
  // Reset authentication after each test
  afterEach(() => {
    auth().actingAsGuest()
  })

  test('can authenticate as a user', () => {
    // Create a test user
    const user: User = {
      id: 1,
      name: 'Test User',
      email: 'user@example.com',
      isAdmin: false,
    }

    // Set the authenticated user
    auth().actingAs(user)

    // Assert that we're authenticated
    auth().assertAuthenticated()

    // Get the authenticated user
    const authenticatedUser = auth().user()
    expect(authenticatedUser).toBe(user)
    expect(authenticatedUser.id).toBe(1)
  })

  test('can act as guest', () => {
    // Create and authenticate a user first
    const user: User = {
      id: 1,
      name: 'Test User',
      email: 'user@example.com',
      isAdmin: false,
    }

    auth().actingAs(user)

    // Verify we're authenticated
    expect(auth().check()).toBe(true)

    // Now logout
    auth().actingAsGuest()

    // Assert that we're a guest
    auth().assertGuest()
    expect(auth().check()).toBe(false)
    expect(auth().user()).toBeNull()
  })

  test('can use withAuth helper', () => {
    // Create a test user
    const user: User = {
      id: 1,
      name: 'Test User',
      email: 'user@example.com',
      isAdmin: false,
    }

    // Create request with auth context
    const request = withAuth(user)

    // The request should have the user and auth objects
    expect(request.user).toBe(user)
    expect(request.auth.check()).toBe(true)
    expect(request.auth.user()).toBe(user)

    // Create a guest request
    const guestRequest = withAuth(null)
    expect(guestRequest.user).toBeNull()
    expect(guestRequest.auth.check()).toBe(false)
    expect(guestRequest.auth.user()).toBeNull()
  })

  test('can chain authentication methods', () => {
    // Create a test user
    const user: User = {
      id: 1,
      name: 'Test User',
      email: 'user@example.com',
      isAdmin: false,
    }

    // Chain methods
    auth()
      .actingAs(user)
      .assertAuthenticated()

    // Check the result
    expect(auth().user().name).toBe('Test User')
  })
})
