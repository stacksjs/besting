import { describe, expect, test } from 'bun:test'
import { createDocument } from '../src/dom'
import { createVirtualPage } from '../src/virtual-page'

describe('Performance and Stress Tests', () => {
  describe('Large DOM Trees', () => {
    test('should handle 1000 elements efficiently', () => {
      const doc = createDocument()
      const container = doc.createElement('div')

      const start = Date.now()
      for (let i = 0; i < 1000; i++) {
        const child = doc.createElement('div')
        child.setAttribute('data-index', i.toString())
        container.appendChild(child)
      }
      const duration = Date.now() - start

      expect(container.children.length).toBe(1000)
      expect(duration).toBeLessThan(1000) // Should complete in less than 1 second
    })

    test('should handle 10000 elements', () => {
      const doc = createDocument()
      const container = doc.createElement('div')

      for (let i = 0; i < 10000; i++) {
        const child = doc.createElement('div')
        container.appendChild(child)
      }

      expect(container.children.length).toBe(10000)
    })

    test('should query through large trees efficiently', () => {
      const doc = createDocument()
      doc.body!.innerHTML = '<div id="container"></div>'

      const container = doc.querySelector('#container')
      for (let i = 0; i < 1000; i++) {
        const child = doc.createElement('span')
        child.classList.add('item')
        container?.appendChild(child)
      }

      const start = Date.now()
      const items = doc.querySelectorAll('.item')
      const duration = Date.now() - start

      expect(items.length).toBe(1000)
      expect(duration).toBeLessThan(500)
    })
  })

  describe('Deep Nesting', () => {
    test('should handle 100 levels of nesting', () => {
      const doc = createDocument()
      let current = doc.body

      for (let i = 0; i < 100; i++) {
        const div = doc.createElement('div')
        div.setAttribute('level', i.toString())
        current?.appendChild(div)
        current = div
      }

      const deepest = doc.querySelector('[level="99"]')
      expect(deepest).not.toBeNull()
    })

    test('should traverse deeply nested trees', () => {
      const doc = createDocument()
      let html = ''
      for (let i = 0; i < 50; i++) {
        html += '<div>'
      }
      html += '<span id="deep">Found</span>'
      for (let i = 0; i < 50; i++) {
        html += '</div>'
      }

      doc.body!.innerHTML = html

      const element = doc.querySelector('#deep')
      expect(element?.textContent).toBe('Found')
    })
  })

  describe('Attribute Operations', () => {
    test('should handle many attributes on single element', () => {
      const doc = createDocument()
      const div = doc.createElement('div')

      for (let i = 0; i < 100; i++) {
        div.setAttribute(`data-attr-${i}`, `value-${i}`)
      }

      expect(div.attributes.size).toBe(100)
      expect(div.getAttribute('data-attr-50')).toBe('value-50')
    })

    test('should handle rapid attribute changes', () => {
      const doc = createDocument()
      const div = doc.createElement('div')

      for (let i = 0; i < 1000; i++) {
        div.setAttribute('data-value', i.toString())
      }

      expect(div.getAttribute('data-value')).toBe('999')
    })
  })

  describe('Class Manipulation', () => {
    test('should handle many classes on element', () => {
      const doc = createDocument()
      const div = doc.createElement('div')

      for (let i = 0; i < 100; i++) {
        div.classList.add(`class-${i}`)
      }

      expect(div.classList.contains('class-50')).toBe(true)
      expect(div.classList.contains('class-99')).toBe(true)
    })

    test('should handle rapid class toggling', () => {
      const doc = createDocument()
      const div = doc.createElement('div')

      for (let i = 0; i < 1000; i++) {
        div.classList.toggle('test-class')
      }

      // Should be off after even number of toggles
      expect(div.classList.contains('test-class')).toBe(false)
    })
  })

  describe('Text Content Operations', () => {
    test('should handle very long text content', () => {
      const doc = createDocument()
      const div = doc.createElement('div')

      const longText = 'a'.repeat(100000)
      div.textContent = longText

      expect(div.textContent.length).toBe(100000)
    })

    test('should handle rapid text updates', () => {
      const doc = createDocument()
      const div = doc.createElement('div')

      for (let i = 0; i < 1000; i++) {
        div.textContent = `Update ${i}`
      }

      expect(div.textContent).toBe('Update 999')
    })
  })

  describe('innerHTML Operations', () => {
    test('should parse large HTML strings', () => {
      const doc = createDocument()
      const container = doc.createElement('div')

      let html = ''
      for (let i = 0; i < 100; i++) {
        html += `<div><span>Item ${i}</span></div>`
      }

      const start = Date.now()
      container.innerHTML = html
      const duration = Date.now() - start

      expect(container.children.length).toBeGreaterThan(90)
      expect(duration).toBeLessThan(1000)
    })

    test('should handle complex HTML structures', () => {
      const doc = createDocument()
      const container = doc.createElement('div')

      const html = `
        <div class="wrapper">
          <header>
            <nav>
              <ul>
                ${Array.from({ length: 50 }, (_, i) => `<li><a href="#">Link ${i}</a></li>`).join('')}
              </ul>
            </nav>
          </header>
          <main>
            ${Array.from({ length: 100 }, (_, i) => `<article><h2>Article ${i}</h2><p>Content</p></article>`).join('')}
          </main>
        </div>
      `

      container.innerHTML = html
      expect(container.querySelectorAll('article').length).toBe(100)
    })
  })

  describe('Selector Performance', () => {
    test('should query 1000 times efficiently', () => {
      const doc = createDocument()
      doc.body!.innerHTML = '<div id="test">Content</div>'

      const start = Date.now()
      for (let i = 0; i < 1000; i++) {
        doc.querySelector('#test')
      }
      const duration = Date.now() - start

      expect(duration).toBeLessThan(500)
    })

    test('should querySelectorAll on large trees efficiently', () => {
      const doc = createDocument()
      let html = ''
      for (let i = 0; i < 500; i++) {
        html += '<div class="item">Content</div>'
      }
      doc.body!.innerHTML = html

      const start = Date.now()
      const items = doc.querySelectorAll('.item')
      const duration = Date.now() - start

      expect(items.length).toBe(500)
      expect(duration).toBeLessThan(500)
    })

    test('should handle complex selector patterns', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <div class="container">
          ${Array.from({ length: 100 }, () => '<div class="item"><span class="text">Content</span></div>').join('')}
        </div>
      `

      const spans = doc.querySelectorAll('span')
      const items = doc.querySelectorAll('.item')
      const texts = doc.querySelectorAll('.text')

      expect(spans.length).toBe(100)
      expect(items.length).toBe(100)
      expect(texts.length).toBe(100)
    })
  })

  describe('Memory Stress Tests', () => {
    test('should handle creating and destroying many elements', () => {
      const doc = createDocument()
      const container = doc.createElement('div')

      for (let round = 0; round < 10; round++) {
        // Create 100 elements
        for (let i = 0; i < 100; i++) {
          const div = doc.createElement('div')
          div.textContent = `Round ${round}, Item ${i}`
          container.appendChild(div)
        }

        // Remove all children
        while (container.children.length > 0) {
          container.removeChild(container.children[0])
        }

        expect(container.children.length).toBe(0)
      }
    })

    test('should handle many separate trees', () => {
      const trees = []

      for (let i = 0; i < 100; i++) {
        const doc = createDocument()
        doc.body!.innerHTML = `<div><span>Tree ${i}</span></div>`
        trees.push(doc)
      }

      expect(trees.length).toBe(100)
      expect(trees[50].querySelector('span')?.textContent).toContain('Tree 50')
    })
  })

  describe('Virtual Page Performance', () => {
    test('should handle multiple page navigations', async () => {
      const page = createVirtualPage()

      for (let i = 0; i < 5; i++) {
        await page.goto('https://example.com')
        const title = await page.title()
        expect(title).toBeTruthy()
      }
    })

    test('should handle many storage operations', async () => {
      const page = createVirtualPage()
      await page.goto('https://example.com')

      // Set 100 items
      for (let i = 0; i < 100; i++) {
        await page.setLocalStorage(`key-${i}`, `value-${i}`)
      }

      // Read them back
      for (let i = 0; i < 100; i++) {
        const value = await page.getLocalStorage(`key-${i}`)
        expect(value).toBe(`value-${i}`)
      }
    })

    test('should handle rapid evaluate calls', async () => {
      const page = createVirtualPage()
      await page.goto('https://example.com')

      for (let i = 0; i < 100; i++) {
        const result = await page.evaluate(() => {
          return document.querySelectorAll('p').length
        })
        expect(typeof result).toBe('number')
      }
    })
  })

  describe('Concurrent Operations', () => {
    test('should handle concurrent queries', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <div id="a">A</div>
        <div id="b">B</div>
        <div id="c">C</div>
        <div id="d">D</div>
      `

      const results = [
        doc.querySelector('#a'),
        doc.querySelector('#b'),
        doc.querySelector('#c'),
        doc.querySelector('#d'),
      ]

      expect(results.every(r => r !== null)).toBe(true)
    })

    test('should handle concurrent modifications', () => {
      const doc = createDocument()
      const div1 = doc.createElement('div')
      const div2 = doc.createElement('div')
      const div3 = doc.createElement('div')

      div1.textContent = 'One'
      div2.textContent = 'Two'
      div3.textContent = 'Three'

      expect(div1.textContent).toBe('One')
      expect(div2.textContent).toBe('Two')
      expect(div3.textContent).toBe('Three')
    })
  })

  describe('Edge Case Scenarios', () => {
    test('should handle repeated appendChild of same element', () => {
      const doc = createDocument()
      const container = doc.createElement('div')
      const child = doc.createElement('span')

      for (let i = 0; i < 10; i++) {
        container.appendChild(child)
      }

      expect(container.children.length).toBe(10)
    })

    test('should handle alternating add/remove operations', () => {
      const doc = createDocument()
      const container = doc.createElement('div')

      for (let i = 0; i < 100; i++) {
        const child = doc.createElement('div')
        container.appendChild(child)

        if (i % 2 === 0) {
          container.removeChild(child)
        }
      }

      expect(container.children.length).toBe(50)
    })

    test('should handle complex attribute patterns', () => {
      const doc = createDocument()
      const div = doc.createElement('div')

      for (let i = 0; i < 100; i++) {
        div.setAttribute(`attr-${i}`, `value-${i}`)

        if (i % 3 === 0) {
          div.removeAttribute(`attr-${i}`)
        }
      }

      expect(div.attributes.size).toBeGreaterThan(60)
    })
  })

  describe('Real-World Scenarios', () => {
    test('should simulate building a large table', () => {
      const doc = createDocument()
      const table = doc.createElement('table')
      const thead = doc.createElement('thead')
      const tbody = doc.createElement('tbody')

      // Create header
      const headerRow = doc.createElement('tr')
      for (let i = 0; i < 10; i++) {
        const th = doc.createElement('th')
        th.textContent = `Column ${i}`
        headerRow.appendChild(th)
      }
      thead.appendChild(headerRow)

      // Create 100 rows
      for (let row = 0; row < 100; row++) {
        const tr = doc.createElement('tr')
        for (let col = 0; col < 10; col++) {
          const td = doc.createElement('td')
          td.textContent = `R${row}C${col}`
          tr.appendChild(td)
        }
        tbody.appendChild(tr)
      }

      table.appendChild(thead)
      table.appendChild(tbody)

      expect(tbody.children.length).toBe(100)
      expect(table.querySelectorAll('td').length).toBe(1000)
    })

    test('should simulate dynamic list filtering', () => {
      const doc = createDocument()
      const list = doc.createElement('ul')

      // Create 200 list items
      for (let i = 0; i < 200; i++) {
        const li = doc.createElement('li')
        li.textContent = `Item ${i}`
        li.classList.add(i % 2 === 0 ? 'even' : 'odd')
        list.appendChild(li)
      }

      const evenItems = list.querySelectorAll('.even')
      const oddItems = list.querySelectorAll('.odd')

      expect(evenItems.length).toBe(100)
      expect(oddItems.length).toBe(100)
    })

    test('should simulate form with many inputs', () => {
      const doc = createDocument()
      const form = doc.createElement('form')

      for (let i = 0; i < 100; i++) {
        const input = doc.createElement('input')
        input.setAttribute('name', `field-${i}`)
        input.setAttribute('value', `value-${i}`)
        form.appendChild(input)
      }

      const inputs = form.querySelectorAll('input')
      expect(inputs.length).toBe(100)

      const field50 = form.querySelector('[name="field-50"]')
      expect(field50?.getAttribute('value')).toBe('value-50')
    })
  })
})
