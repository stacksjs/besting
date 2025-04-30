import type { EventDispatcher, EventFake } from './types'
import { expect } from './test'

/**
 * Event testing utilities for the Besting framework
 */

// Event dispatcher instance
let dispatcher: EventDispatcher | null = null

/**
 * EventFake implementation
 */
class EventFakeImpl implements EventFake {
  private _dispatched: Record<string, any[]> = {}

  /**
   * Record an event being dispatched
   */
  recordEvent(eventName: string, event: any): void {
    if (!this._dispatched[eventName]) {
      this._dispatched[eventName] = []
    }
    this._dispatched[eventName].push(event)
  }

  /**
   * Assert that an event was dispatched
   */
  assertDispatched(eventName: string, callback?: (event: any) => boolean): EventFake {
    const events = this._dispatched[eventName] || []

    if (callback) {
      const matchingEvent = events.find(event => callback(event))
      expect(matchingEvent).toBeDefined()
    }
    else {
      expect(events.length).toBeGreaterThan(0)
    }

    return this
  }

  /**
   * Assert that an event was dispatched a specific number of times
   */
  assertDispatchedTimes(eventName: string, times: number): EventFake {
    const events = this._dispatched[eventName] || []
    expect(events.length).toBe(times)
    return this
  }

  /**
   * Assert that an event was not dispatched
   */
  assertNotDispatched(eventName: string): EventFake {
    const events = this._dispatched[eventName] || []
    expect(events.length).toBe(0)
    return this
  }

  /**
   * Get all dispatched events with a given name
   */
  getDispatched(eventName: string): any[] {
    return this._dispatched[eventName] || []
  }
}

/**
 * EventDispatcher implementation
 */
class EventDispatcherImpl implements EventDispatcher {
  private _listeners: Record<string, ((event: any) => void)[]> = {}
  private _fake: EventFakeImpl | null = null

  /**
   * Dispatch an event
   */
  dispatch(event: any): void {
    const eventName = event.constructor.name

    // Record the event if we're faking
    if (this._fake) {
      this._fake.recordEvent(eventName, event)
    }

    // Notify listeners
    const listeners = this._listeners[eventName] || []
    for (const listener of listeners) {
      listener(event)
    }
  }

  /**
   * Register an event listener
   */
  listen(eventName: string, callback: (event: any) => void): void {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = []
    }
    this._listeners[eventName].push(callback)
  }

  /**
   * Create a fake to record and assert on events
   */
  fake(): EventFake {
    this._fake = new EventFakeImpl()
    return this._fake
  }
}

/**
 * Get or create the event dispatcher
 */
export function events(): EventDispatcher {
  if (!dispatcher) {
    dispatcher = new EventDispatcherImpl()
  }
  return dispatcher
}

/**
 * Create a fake event dispatcher for testing
 */
export function fakeEvents(): EventFake {
  return events().fake()
}

/**
 * Define an event
 */
export function defineEvent<T extends object>(_prototype: T): new (data: T) => T {
  return class Event implements T {
    constructor(data: T) {
      Object.assign(this, data)
    }
  } as any
}

/**
 * Event listener decorator
 */
export function listener(eventName: string): (
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) => PropertyDescriptor {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value

    // Register the listener
    events().listen(eventName, original)

    return descriptor
  }
}
