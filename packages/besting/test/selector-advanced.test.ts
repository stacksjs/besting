import { describe, expect, test } from 'bun:test'
import { createDocument } from '../src/dom'

describe('Advanced Selector Tests', () => {
  describe('ID Selectors', () => {
    test('should find element by ID', () => {
      const doc = createDocument()
      const div = doc.createElement('div')
      div.setAttribute('id', 'test-id')
      doc.body?.appendChild(div)

      const result = doc.querySelector('#test-id')
      expect(result).toBe(div)
    })

    test('should return null for non-existent ID', () => {
      const doc = createDocument()
      const result = doc.querySelector('#non-existent')
      expect(result).toBeNull()
    })

    test('should handle IDs with special characters', () => {
      const doc = createDocument()
      const div = doc.createElement('div')
      div.setAttribute('id', 'test-id-123')
      doc.body?.appendChild(div)

      const result = doc.querySelector('#test-id-123')
      expect(result).toBe(div)
    })

    test('should find first element when multiple have same ID', () => {
      const doc = createDocument()
      const div1 = doc.createElement('div')
      const div2 = doc.createElement('div')
      div1.setAttribute('id', 'duplicate')
      div2.setAttribute('id', 'duplicate')
      doc.body?.appendChild(div1)
      doc.body?.appendChild(div2)

      const result = doc.querySelector('#duplicate')
      expect(result).toBe(div1)
    })
  })

  describe('Class Selectors', () => {
    test('should find elements by class', () => {
      const doc = createDocument()
      const div1 = doc.createElement('div')
      const div2 = doc.createElement('div')
      div1.classList.add('test-class')
      div2.classList.add('test-class')
      doc.body?.appendChild(div1)
      doc.body?.appendChild(div2)

      const results = doc.querySelectorAll('.test-class')
      expect(results.length).toBe(2)
    })

    test('should find element with multiple classes', () => {
      const doc = createDocument()
      const div = doc.createElement('div')
      div.classList.add('class1')
      div.classList.add('class2')
      div.classList.add('class3')
      doc.body?.appendChild(div)

      expect(doc.querySelector('.class1')).toBe(div)
      expect(doc.querySelector('.class2')).toBe(div)
      expect(doc.querySelector('.class3')).toBe(div)
    })

    test('should return null for non-existent class', () => {
      const doc = createDocument()
      const result = doc.querySelector('.non-existent')
      expect(result).toBeNull()
    })

    test('should handle class names with hyphens and underscores', () => {
      const doc = createDocument()
      const div = doc.createElement('div')
      div.classList.add('my-test_class-123')
      doc.body?.appendChild(div)

      const result = doc.querySelector('.my-test_class-123')
      expect(result).toBe(div)
    })
  })

  describe('Tag Selectors', () => {
    test('should find elements by tag name', () => {
      const doc = createDocument()
      const div1 = doc.createElement('div')
      const div2 = doc.createElement('div')
      const span = doc.createElement('span')
      doc.body?.appendChild(div1)
      doc.body?.appendChild(div2)
      doc.body?.appendChild(span)

      const divs = doc.querySelectorAll('div')
      expect(divs.length).toBe(2)

      const spans = doc.querySelectorAll('span')
      expect(spans.length).toBe(1)
    })

    test('should be case-insensitive for tag names', () => {
      const doc = createDocument()
      const div = doc.createElement('div')
      doc.body?.appendChild(div)

      expect(doc.querySelector('div')).toBe(div)
      expect(doc.querySelector('DIV')).toBe(div)
      expect(doc.querySelector('Div')).toBe(div)
    })

    test('should find nested elements', () => {
      const doc = createDocument()
      const outer = doc.createElement('div')
      const inner = doc.createElement('span')
      outer.appendChild(inner)
      doc.body?.appendChild(outer)

      const result = doc.querySelector('span')
      expect(result).toBe(inner)
    })

    test('should find all matching elements in tree', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <div>
          <span>1</span>
          <div>
            <span>2</span>
            <div>
              <span>3</span>
            </div>
          </div>
        </div>
      `

      const spans = doc.querySelectorAll('span')
      expect(spans.length).toBe(3)
    })
  })

  describe('Attribute Selectors', () => {
    test('should find elements by attribute existence', () => {
      const doc = createDocument()
      const div = doc.createElement('div')
      div.setAttribute('data-test', 'value')
      doc.body?.appendChild(div)

      const result = doc.querySelector('[data-test]')
      expect(result).toBe(div)
    })

    test('should find elements by attribute value', () => {
      const doc = createDocument()
      const div1 = doc.createElement('div')
      const div2 = doc.createElement('div')
      div1.setAttribute('data-type', 'test')
      div2.setAttribute('data-type', 'other')
      doc.body?.appendChild(div1)
      doc.body?.appendChild(div2)

      const result = doc.querySelector('[data-type="test"]')
      expect(result).toBe(div1)
    })

    test('should return null for non-matching attribute value', () => {
      const doc = createDocument()
      const div = doc.createElement('div')
      div.setAttribute('data-type', 'test')
      doc.body?.appendChild(div)

      const result = doc.querySelector('[data-type="wrong"]')
      expect(result).toBeNull()
    })

    test('should handle multiple attributes', () => {
      const doc = createDocument()
      const div = doc.createElement('div')
      div.setAttribute('id', 'test')
      div.setAttribute('class', 'foo')
      div.setAttribute('data-value', '123')
      doc.body?.appendChild(div)

      expect(doc.querySelector('[id]')).toBe(div)
      expect(doc.querySelector('[class]')).toBe(div)
      expect(doc.querySelector('[data-value]')).toBe(div)
      expect(doc.querySelector('[data-value="123"]')).toBe(div)
    })
  })

  describe('Universal Selector', () => {
    test('should match all elements with *', () => {
      const doc = createDocument()
      const div = doc.createElement('div')
      const span = doc.createElement('span')
      const p = doc.createElement('p')
      doc.body?.appendChild(div)
      doc.body?.appendChild(span)
      doc.body?.appendChild(p)

      const result = doc.querySelector('*')
      expect(result).not.toBeNull()
    })

    test('should find all elements in tree', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <div>
          <span></span>
          <p></p>
        </div>
      `

      const all = doc.querySelectorAll('*')
      expect(all.length).toBeGreaterThan(0)
    })
  })

  describe('querySelector vs querySelectorAll', () => {
    test('querySelector should return first match', () => {
      const doc = createDocument()
      const div1 = doc.createElement('div')
      const div2 = doc.createElement('div')
      const div3 = doc.createElement('div')
      div1.setAttribute('id', 'first')
      div2.setAttribute('id', 'second')
      div3.setAttribute('id', 'third')
      doc.body?.appendChild(div1)
      doc.body?.appendChild(div2)
      doc.body?.appendChild(div3)

      const result = doc.querySelector('div')
      expect(result).toBe(div1)
    })

    test('querySelectorAll should return all matches', () => {
      const doc = createDocument()
      const div1 = doc.createElement('div')
      const div2 = doc.createElement('div')
      const div3 = doc.createElement('div')
      doc.body?.appendChild(div1)
      doc.body?.appendChild(div2)
      doc.body?.appendChild(div3)

      const results = doc.querySelectorAll('div')
      expect(results.length).toBe(3)
      expect(results[0]).toBe(div1)
      expect(results[1]).toBe(div2)
      expect(results[2]).toBe(div3)
    })

    test('querySelectorAll should return empty array for no matches', () => {
      const doc = createDocument()
      const results = doc.querySelectorAll('.non-existent')
      expect(results).toBeInstanceOf(Array)
      expect(results.length).toBe(0)
    })
  })

  describe('Element.matches()', () => {
    test('should match ID selector', () => {
      const doc = createDocument()
      const div = doc.createElement('div')
      div.setAttribute('id', 'test')

      expect(div.matches('#test')).toBe(true)
      expect(div.matches('#wrong')).toBe(false)
    })

    test('should match class selector', () => {
      const doc = createDocument()
      const div = doc.createElement('div')
      div.classList.add('test-class')

      expect(div.matches('.test-class')).toBe(true)
      expect(div.matches('.wrong')).toBe(false)
    })

    test('should match tag selector', () => {
      const doc = createDocument()
      const div = doc.createElement('div')

      expect(div.matches('div')).toBe(true)
      expect(div.matches('DIV')).toBe(true)
      expect(div.matches('span')).toBe(false)
    })

    test('should match attribute selector', () => {
      const doc = createDocument()
      const div = doc.createElement('div')
      div.setAttribute('data-test', 'value')

      expect(div.matches('[data-test]')).toBe(true)
      expect(div.matches('[data-test="value"]')).toBe(true)
      expect(div.matches('[data-test="wrong"]')).toBe(false)
      expect(div.matches('[data-other]')).toBe(false)
    })

    test('should match universal selector', () => {
      const doc = createDocument()
      const div = doc.createElement('div')

      expect(div.matches('*')).toBe(true)
    })
  })

  describe('Complex Selectors', () => {
    test('should handle deeply nested queries', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <div id="level1">
          <div id="level2">
            <div id="level3">
              <div id="level4">
                <span id="deep">Found me!</span>
              </div>
            </div>
          </div>
        </div>
      `

      const result = doc.querySelector('#deep')
      expect(result).not.toBeNull()
      expect(result?.textContent).toBe('Found me!')
    })

    test('should query from specific element', () => {
      const doc = createDocument()
      const container = doc.createElement('div')
      const child1 = doc.createElement('span')
      const child2 = doc.createElement('span')
      child1.setAttribute('id', 'inside')
      child2.setAttribute('id', 'outside')

      container.appendChild(child1)
      doc.body?.appendChild(container)
      doc.body?.appendChild(child2)

      const result = container.querySelector('span')
      expect(result).toBe(child1)
    })

    test('should handle empty selectors gracefully', () => {
      const doc = createDocument()
      expect(doc.querySelector('')).toBeNull()
      expect(doc.querySelectorAll('')).toEqual([])
    })
  })

  describe('Performance and Edge Cases', () => {
    test('should handle large number of elements', () => {
      const doc = createDocument()

      // Create 1000 elements
      for (let i = 0; i < 1000; i++) {
        const div = doc.createElement('div')
        div.setAttribute('data-index', i.toString())
        doc.body?.appendChild(div)
      }

      const all = doc.querySelectorAll('div')
      expect(all.length).toBe(1000)

      const specific = doc.querySelector('[data-index="500"]')
      expect(specific).not.toBeNull()
      expect(specific?.getAttribute('data-index')).toBe('500')
    })

    test('should handle repeated queries', () => {
      const doc = createDocument()
      const div = doc.createElement('div')
      div.setAttribute('id', 'test')
      doc.body?.appendChild(div)

      for (let i = 0; i < 100; i++) {
        const result = doc.querySelector('#test')
        expect(result).toBe(div)
      }
    })

    test('should handle queries on documents with no body', () => {
      const doc = createDocument()
      // Remove body
      if (doc.documentElement && doc.body) {
        doc.documentElement.removeChild(doc.body)
      }

      const result = doc.querySelector('div')
      expect(result).toBeNull()
    })
  })
})
