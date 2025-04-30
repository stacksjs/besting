import { defineEvent, describe, events, expect, fakeEvents, listener, test } from 'besting'

// Define some event classes
class UserCreated {
  constructor(public id: number, public name: string) {}
}

class PostCreated {
  constructor(public id: number, public title: string) {}
}

// Define an event using the helper
const OrderShipped = defineEvent({
  id: 0,
  trackingNumber: '',
})

// Define an event listener
class EventListener {
  events: any[] = []

  @listener(UserCreated.name)
  handleUserCreated(event: UserCreated) {
    this.events.push({ type: 'user', event })
  }

  @listener(PostCreated.name)
  handlePostCreated(event: PostCreated) {
    this.events.push({ type: 'post', event })
  }
}

describe('Event Testing', () => {
  test('can dispatch and listen for events', () => {
    const dispatcher = events()
    const listener = new EventListener()

    // Dispatch some events
    dispatcher.dispatch(new UserCreated(1, 'John'))
    dispatcher.dispatch(new PostCreated(101, 'Hello World'))

    // Verify the listener received the events
    expect(listener.events.length).toBe(2)
    expect(listener.events[0].type).toBe('user')
    expect(listener.events[1].type).toBe('post')
  })

  test('can fake events and make assertions', () => {
    const fake = fakeEvents()

    // Dispatch some events
    events().dispatch(new UserCreated(1, 'John'))
    events().dispatch(new UserCreated(2, 'Jane'))
    events().dispatch(new PostCreated(101, 'Hello World'))

    // Make assertions on the events
    fake.assertDispatched('UserCreated')
    fake.assertDispatchedTimes('UserCreated', 2)
    fake.assertDispatched('PostCreated')

    // Check for a specific event using a callback
    fake.assertDispatched('UserCreated', event => event.id === 1)

    // Check that an event was not dispatched
    fake.assertNotDispatched('OrderShipped')
  })

  test('can assert on event properties with callback', () => {
    const fake = fakeEvents()

    // Dispatch some events
    events().dispatch(new UserCreated(1, 'John'))
    events().dispatch(new UserCreated(2, 'Jane'))

    // Check for a specific user
    fake.assertDispatched('UserCreated', (event) => {
      return event.id === 2 && event.name === 'Jane'
    })

    // This should fail because there's no such user
    expect(() => {
      fake.assertDispatched('UserCreated', (event) => {
        return event.id === 3
      })
    }).toThrow()
  })

  test('can use defineEvent helper', () => {
    const fake = fakeEvents()

    // Create and dispatch an order event
    const order = new OrderShipped({ id: 123, trackingNumber: 'TRK-123456' })
    events().dispatch(order)

    // Assert the event was dispatched
    fake.assertDispatched('Event', (event) => {
      return event.id === 123 && event.trackingNumber === 'TRK-123456'
    })
  })

  test('can get dispatched events', () => {
    const fake = fakeEvents()

    // Dispatch some events
    events().dispatch(new UserCreated(1, 'John'))
    events().dispatch(new UserCreated(2, 'Jane'))

    // Get all UserCreated events
    const userEvents = fake.getDispatched('UserCreated')
    expect(userEvents.length).toBe(2)
    expect(userEvents[0].name).toBe('John')
    expect(userEvents[1].name).toBe('Jane')
  })
})
