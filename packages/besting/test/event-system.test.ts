import { describe, expect, test } from 'bun:test'
import { createDocument, VirtualEvent } from '../src/dom'

describe('Event System', () => {
  describe('addEventListener and removeEventListener', () => {
    test('should add and trigger event listener', () => {
      const doc = createDocument()
      const button = doc.createElement('button')
      doc.body?.appendChild(button)

      let clicked = false
      button.addEventListener('click', () => {
        clicked = true
      })

      const event = new VirtualEvent('click')
      button.dispatchEvent(event)

      expect(clicked).toBe(true)
    })

    test('should remove event listener', () => {
      const doc = createDocument()
      const button = doc.createElement('button')

      let clickCount = 0
      const handler = () => {
        clickCount++
      }

      button.addEventListener('click', handler)
      button.dispatchEvent(new VirtualEvent('click'))
      expect(clickCount).toBe(1)

      button.removeEventListener('click', handler)
      button.dispatchEvent(new VirtualEvent('click'))
      expect(clickCount).toBe(1) // Should not increment
    })

    test('should not add duplicate listeners', () => {
      const doc = createDocument()
      const button = doc.createElement('button')

      let clickCount = 0
      const handler = () => {
        clickCount++
      }

      button.addEventListener('click', handler)
      button.addEventListener('click', handler) // Duplicate
      button.addEventListener('click', handler) // Duplicate

      button.dispatchEvent(new VirtualEvent('click'))
      expect(clickCount).toBe(1) // Should only fire once
    })

    test('should handle multiple different listeners', () => {
      const doc = createDocument()
      const button = doc.createElement('button')

      const calls: string[] = []

      button.addEventListener('click', () => calls.push('first'))
      button.addEventListener('click', () => calls.push('second'))
      button.addEventListener('click', () => calls.push('third'))

      button.dispatchEvent(new VirtualEvent('click'))

      expect(calls).toEqual(['first', 'second', 'third'])
    })

    test('should handle multiple event types', () => {
      const doc = createDocument()
      const element = doc.createElement('div')

      const events: string[] = []

      element.addEventListener('click', () => events.push('click'))
      element.addEventListener('focus', () => events.push('focus'))
      element.addEventListener('blur', () => events.push('blur'))

      element.dispatchEvent(new VirtualEvent('click'))
      element.dispatchEvent(new VirtualEvent('focus'))
      element.dispatchEvent(new VirtualEvent('blur'))

      expect(events).toEqual(['click', 'focus', 'blur'])
    })
  })

  describe('Event Bubbling', () => {
    test('should bubble events up the DOM tree', () => {
      const doc = createDocument()
      const outer = doc.createElement('div')
      outer.setAttribute('id', 'outer')
      const middle = doc.createElement('div')
      middle.setAttribute('id', 'middle')
      const inner = doc.createElement('div')
      inner.setAttribute('id', 'inner')

      outer.appendChild(middle)
      middle.appendChild(inner)
      doc.body?.appendChild(outer)

      const bubbled: string[] = []

      inner.addEventListener('click', () => bubbled.push('inner'))
      middle.addEventListener('click', () => bubbled.push('middle'))
      outer.addEventListener('click', () => bubbled.push('outer'))

      inner.dispatchEvent(new VirtualEvent('click', { bubbles: true }))

      expect(bubbled).toEqual(['inner', 'middle', 'outer'])
    })

    test('should not bubble when bubbles is false', () => {
      const doc = createDocument()
      const outer = doc.createElement('div')
      const inner = doc.createElement('div')
      outer.appendChild(inner)

      const bubbled: string[] = []

      inner.addEventListener('custom', () => bubbled.push('inner'))
      outer.addEventListener('custom', () => bubbled.push('outer'))

      inner.dispatchEvent(new VirtualEvent('custom', { bubbles: false }))

      expect(bubbled).toEqual(['inner']) // Should NOT include 'outer'
    })

    test('should set target and currentTarget correctly', () => {
      const doc = createDocument()
      const outer = doc.createElement('div')
      const inner = doc.createElement('div')
      outer.appendChild(inner)

      let innerTarget: any = null
      let innerCurrent: any = null
      let outerTarget: any = null
      let outerCurrent: any = null

      inner.addEventListener('click', (e) => {
        innerTarget = e.target
        innerCurrent = e.currentTarget
      })

      outer.addEventListener('click', (e) => {
        outerTarget = e.target
        outerCurrent = e.currentTarget
      })

      inner.dispatchEvent(new VirtualEvent('click', { bubbles: true }))

      expect(innerTarget).toBe(inner)
      expect(innerCurrent).toBe(inner)
      expect(outerTarget).toBe(inner) // Target stays the same
      expect(outerCurrent).toBe(outer) // CurrentTarget changes
    })
  })

  describe('Event Capturing', () => {
    test('should capture events on the way down', () => {
      const doc = createDocument()
      const outer = doc.createElement('div')
      const middle = doc.createElement('div')
      const inner = doc.createElement('div')

      outer.appendChild(middle)
      middle.appendChild(inner)
      doc.body?.appendChild(outer)

      const order: string[] = []

      outer.addEventListener('click', () => order.push('outer-capture'), true)
      middle.addEventListener('click', () => order.push('middle-capture'), true)
      inner.addEventListener('click', () => order.push('inner-bubble'), false)
      middle.addEventListener('click', () => order.push('middle-bubble'), false)
      outer.addEventListener('click', () => order.push('outer-bubble'), false)

      inner.dispatchEvent(new VirtualEvent('click', { bubbles: true }))

      // Capture phase: outer -> middle
      // Target phase: inner
      // Bubble phase: middle -> outer
      expect(order).toContain('outer-capture')
      expect(order).toContain('middle-capture')
      expect(order).toContain('inner-bubble')
      expect(order).toContain('middle-bubble')
      expect(order).toContain('outer-bubble')

      // Capture should come before bubble
      expect(order.indexOf('outer-capture')).toBeLessThan(order.indexOf('inner-bubble'))
      expect(order.indexOf('middle-capture')).toBeLessThan(order.indexOf('inner-bubble'))
    })
  })

  describe('stopPropagation', () => {
    test('should stop event propagation', () => {
      const doc = createDocument()
      const outer = doc.createElement('div')
      const inner = doc.createElement('div')
      outer.appendChild(inner)

      const calls: string[] = []

      inner.addEventListener('click', (e) => {
        calls.push('inner')
        e.stopPropagation()
      })

      outer.addEventListener('click', () => {
        calls.push('outer')
      })

      inner.dispatchEvent(new VirtualEvent('click', { bubbles: true }))

      expect(calls).toEqual(['inner']) // Should NOT include 'outer'
    })

    test('should stop propagation during capture phase', () => {
      const doc = createDocument()
      const outer = doc.createElement('div')
      const inner = doc.createElement('div')
      outer.appendChild(inner)

      const calls: string[] = []

      outer.addEventListener('click', (e) => {
        calls.push('outer-capture')
        e.stopPropagation()
      }, true)

      inner.addEventListener('click', () => {
        calls.push('inner')
      })

      inner.dispatchEvent(new VirtualEvent('click', { bubbles: true }))

      expect(calls).toEqual(['outer-capture']) // Should stop before reaching inner
    })
  })

  describe('stopImmediatePropagation', () => {
    test('should stop immediate propagation', () => {
      const doc = createDocument()
      const button = doc.createElement('button')

      const calls: string[] = []

      button.addEventListener('click', (e) => {
        calls.push('first')
        e.stopImmediatePropagation()
      })

      button.addEventListener('click', () => {
        calls.push('second') // Should not be called
      })

      button.addEventListener('click', () => {
        calls.push('third') // Should not be called
      })

      button.dispatchEvent(new VirtualEvent('click'))

      expect(calls).toEqual(['first']) // Only first handler should run
    })
  })

  describe('preventDefault', () => {
    test('should prevent default action', () => {
      const doc = createDocument()
      const link = doc.createElement('a')

      let defaultPrevented = false

      link.addEventListener('click', (e) => {
        e.preventDefault()
        defaultPrevented = e.defaultPrevented
      })

      const event = new VirtualEvent('click', { cancelable: true })
      link.dispatchEvent(event)

      expect(defaultPrevented).toBe(true)
      expect(event.defaultPrevented).toBe(true)
    })

    test('should not prevent default if not cancelable', () => {
      const doc = createDocument()
      const div = doc.createElement('div')

      div.addEventListener('custom', (e) => {
        e.preventDefault()
      })

      const event = new VirtualEvent('custom', { cancelable: false })
      div.dispatchEvent(event)

      expect(event.defaultPrevented).toBe(false)
    })

    test('dispatchEvent should return false if default prevented', () => {
      const doc = createDocument()
      const button = doc.createElement('button')

      button.addEventListener('click', (e) => {
        e.preventDefault()
      })

      const event = new VirtualEvent('click', { cancelable: true })
      const result = button.dispatchEvent(event)

      expect(result).toBe(false) // Should return false when prevented
    })

    test('dispatchEvent should return true if default not prevented', () => {
      const doc = createDocument()
      const button = doc.createElement('button')

      button.addEventListener('click', () => {
        // Do nothing, don't prevent default
      })

      const event = new VirtualEvent('click', { cancelable: true })
      const result = button.dispatchEvent(event)

      expect(result).toBe(true)
    })
  })

  describe('Event Object Properties', () => {
    test('should have correct event type', () => {
      const doc = createDocument()
      const button = doc.createElement('button')

      let eventType = ''

      button.addEventListener('click', (e) => {
        eventType = e.type
      })

      button.dispatchEvent(new VirtualEvent('click'))

      expect(eventType).toBe('click')
    })

    test('should have timestamp', () => {
      const event = new VirtualEvent('click')
      expect(typeof event.timeStamp).toBe('number')
      expect(event.timeStamp).toBeGreaterThan(0)
    })

    test('should have bubbles property', () => {
      const bubbles = new VirtualEvent('click', { bubbles: true })
      const noBubbles = new VirtualEvent('click', { bubbles: false })

      expect(bubbles.bubbles).toBe(true)
      expect(noBubbles.bubbles).toBe(false)
    })

    test('should have cancelable property', () => {
      const cancelable = new VirtualEvent('click', { cancelable: true })
      const notCancelable = new VirtualEvent('click', { cancelable: false })

      expect(cancelable.cancelable).toBe(true)
      expect(notCancelable.cancelable).toBe(false)
    })
  })

  describe('Error Handling', () => {
    test('should catch and log listener errors', () => {
      const doc = createDocument()
      const button = doc.createElement('button')

      const calls: string[] = []

      button.addEventListener('click', () => {
        calls.push('first')
        throw new Error('Listener error')
      })

      button.addEventListener('click', () => {
        calls.push('second') // Should still be called
      })

      button.dispatchEvent(new VirtualEvent('click'))

      expect(calls).toEqual(['first', 'second']) // Both should run despite error
    })
  })

  describe('Complex Scenarios', () => {
    test('should handle nested elements with multiple listeners', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <div id="container">
          <div id="parent">
            <button id="button">Click me</button>
          </div>
        </div>
      `

      const events: string[] = []

      const container = doc.querySelector('#container')!
      const parent = doc.querySelector('#parent')!
      const button = doc.querySelector('#button')!

      container.addEventListener('click', () => events.push('container'))
      parent.addEventListener('click', () => events.push('parent'))
      button.addEventListener('click', () => events.push('button'))

      button.dispatchEvent(new VirtualEvent('click', { bubbles: true }))

      expect(events).toEqual(['button', 'parent', 'container'])
    })

    test('should handle removing listener during event dispatch', () => {
      const doc = createDocument()
      const button = doc.createElement('button')

      const calls: string[] = []

      const handler2 = () => {
        calls.push('second')
      }

      button.addEventListener('click', () => {
        calls.push('first')
        button.removeEventListener('click', handler2) // Remove second handler
      })

      button.addEventListener('click', handler2)

      button.addEventListener('click', () => {
        calls.push('third')
      })

      button.dispatchEvent(new VirtualEvent('click'))

      // All three should still be called because we iterate over a copy
      expect(calls).toEqual(['first', 'second', 'third'])
    })
  })
})
