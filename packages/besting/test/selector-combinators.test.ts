import { describe, expect, test } from 'bun:test'
import { createDocument } from '../src/dom'

describe('CSS Selector Combinators', () => {
  describe('Descendant Combinator (space)', () => {
    test('should match descendant elements', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <div class="container">
          <span class="target">Found 1</span>
          <div>
            <span class="target">Found 2</span>
            <div>
              <span class="target">Found 3</span>
            </div>
          </div>
        </div>
      `

      const results = doc.querySelectorAll('div span')
      expect(results.length).toBe(3)
    })

    test('should match specific descendant pattern', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <div class="outer">
          <div class="inner">
            <span id="target">Found</span>
          </div>
        </div>
        <span>Not found</span>
      `

      const result = doc.querySelector('div span')
      expect(result).not.toBeNull()
      expect(result?.getAttribute('id')).toBe('target')
    })

    test('should match deeply nested descendants', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <article>
          <div>
            <section>
              <div>
                <p>Deep content</p>
              </div>
            </section>
          </div>
        </article>
      `

      const result = doc.querySelector('article p')
      expect(result).not.toBeNull()
      expect(result?.textContent).toBe('Deep content')
    })

    test('should not match siblings', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <div class="container"></div>
        <span>Text</span>
      `

      const result = doc.querySelector('div span')
      expect(result).toBeNull()
    })

    test('should match class descendants', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <div class="container">
          <p class="text">Paragraph 1</p>
          <div>
            <p class="text">Paragraph 2</p>
          </div>
        </div>
      `

      const results = doc.querySelectorAll('.container .text')
      expect(results.length).toBe(2)
    })
  })

  describe('Child Combinator (>)', () => {
    test('should match direct children only', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <div class="parent">
          <span class="child">Direct child</span>
          <div>
            <span class="child">Grandchild</span>
          </div>
        </div>
      `

      const results = doc.querySelectorAll('.parent > .child')
      expect(results.length).toBe(1)
      expect(results[0].textContent).toBe('Direct child')
    })

    test('should not match grandchildren', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <ul>
          <li>
            <ul>
              <li id="nested">Nested</li>
            </ul>
          </li>
        </ul>
      `

      const result = doc.querySelector('ul > li#nested')
      expect(result).toBeNull()
    })

    test('should match multiple levels with >', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <nav>
          <ul>
            <li><a href="#">Link</a></li>
          </ul>
        </nav>
      `

      const result = doc.querySelector('nav > ul > li')
      expect(result).not.toBeNull()
    })

    test('should work with tag and class selectors', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <div class="wrapper">
          <div class="content">
            <p>Text</p>
          </div>
        </div>
      `

      const result = doc.querySelector('.wrapper > .content')
      expect(result).not.toBeNull()
      expect(result?.classList.contains('content')).toBe(true)
    })
  })

  describe('Adjacent Sibling Combinator (+)', () => {
    test('should match immediately following sibling', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <h1>Title</h1>
        <p id="target">First paragraph</p>
        <p>Second paragraph</p>
      `

      const result = doc.querySelector('h1 + p')
      expect(result).not.toBeNull()
      expect(result?.getAttribute('id')).toBe('target')
    })

    test('should not match non-adjacent siblings', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <h1>Title</h1>
        <div>Separator</div>
        <p>Paragraph</p>
      `

      const result = doc.querySelector('h1 + p')
      expect(result).toBeNull()
    })

    test('should work with classes', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <div class="first">First</div>
        <div class="second">Second</div>
        <div class="third">Third</div>
      `

      const result = doc.querySelector('.first + .second')
      expect(result).not.toBeNull()
      expect(result?.textContent).toBe('Second')
    })

    test('should match multiple adjacent siblings', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <span>1</span>
        <span id="target">2</span>
        <span>3</span>
      `

      const results = doc.querySelectorAll('span + span')
      expect(results.length).toBe(2)
    })
  })

  describe('General Sibling Combinator (~)', () => {
    test('should match any following sibling', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <h1>Title</h1>
        <div>Content</div>
        <p id="para1">Paragraph 1</p>
        <div>More content</div>
        <p id="para2">Paragraph 2</p>
      `

      const results = doc.querySelectorAll('h1 ~ p')
      expect(results.length).toBe(2)
    })

    test('should not match preceding siblings', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <p>Paragraph</p>
        <h1>Title</h1>
      `

      const result = doc.querySelector('h1 ~ p')
      expect(result).toBeNull()
    })

    test('should work with classes', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <div class="start">Start</div>
        <span>Separator 1</span>
        <div class="match">Match 1</div>
        <span>Separator 2</span>
        <div class="match">Match 2</div>
      `

      const results = doc.querySelectorAll('.start ~ .match')
      expect(results.length).toBe(2)
    })
  })

  describe('Complex Selector Combinations', () => {
    test('should handle mixed combinators', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <div class="container">
          <nav>
            <ul>
              <li class="first">Item 1</li>
              <li class="second">Item 2</li>
            </ul>
          </nav>
        </div>
      `

      const result = doc.querySelector('.container > nav > ul > .second')
      expect(result).not.toBeNull()
      expect(result?.textContent).toBe('Item 2')
    })

    test('should handle descendant and child combinators together', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <article>
          <div class="content">
            <section>
              <p>Paragraph</p>
            </section>
          </div>
        </article>
      `

      const result = doc.querySelector('article > .content section')
      expect(result).not.toBeNull()
      expect(result?.nodeName).toBe('SECTION')
    })

    test('should handle complex real-world selectors', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <nav class="navbar">
          <ul class="menu">
            <li class="menu-item">
              <a href="#" class="active">Home</a>
            </li>
            <li class="menu-item">
              <a href="#">About</a>
            </li>
          </ul>
        </nav>
      `

      const result = doc.querySelector('.navbar > .menu .menu-item .active')
      expect(result).not.toBeNull()
      expect(result?.textContent).toBe('Home')
    })
  })

  describe('Attribute Selector Enhancements', () => {
    test('should match attributes starting with value ([attr^="value"])', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <a href="https://example.com">External</a>
        <a href="/internal">Internal</a>
        <a href="https://test.com">Another</a>
      `

      const results = doc.querySelectorAll('[href^="https://"]')
      expect(results.length).toBe(2)
    })

    test('should match attributes ending with value ([attr$="value"])', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <img src="photo.jpg" />
        <img src="icon.png" />
        <img src="banner.jpg" />
      `

      const results = doc.querySelectorAll('[src$=".jpg"]')
      expect(results.length).toBe(2)
    })

    test('should match attributes containing value ([attr*="value"])', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <div class="btn-primary">Button 1</div>
        <div class="btn-secondary">Button 2</div>
        <div class="link">Link</div>
      `

      const results = doc.querySelectorAll('[class*="btn"]')
      expect(results.length).toBe(2)
    })

    test('should match attributes with word ([attr~="word"])', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <div class="button primary large">Div 1</div>
        <div class="button secondary">Div 2</div>
        <div class="link">Div 3</div>
      `

      const results = doc.querySelectorAll('[class~="button"]')
      expect(results.length).toBe(2)
    })

    test('should combine attribute matchers with combinators', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <div class="container">
          <img src="images/photo.jpg" alt="Photo" />
          <img src="icons/icon.png" alt="Icon" />
        </div>
      `

      const result = doc.querySelector('.container > [src^="images/"]')
      expect(result).not.toBeNull()
      expect(result?.getAttribute('alt')).toBe('Photo')
    })
  })

  describe('Edge Cases', () => {
    test('should handle selectors with extra whitespace', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `
        <div class="parent">
          <span>Text</span>
        </div>
      `

      const result = doc.querySelector('div   span')
      expect(result).not.toBeNull()
    })

    test('should handle empty results', () => {
      const doc = createDocument()
      doc.body!.innerHTML = `<div><span></span></div>`

      const results = doc.querySelectorAll('div > p')
      expect(results).toBeInstanceOf(Array)
      expect(results.length).toBe(0)
    })

    test('should work with matches() method', () => {
      const doc = createDocument()
      const div = doc.createElement('div')
      div.classList.add('test')
      const span = doc.createElement('span')
      span.setAttribute('id', 'target')
      div.appendChild(span)
      doc.body?.appendChild(div)

      expect(span.matches('div > #target')).toBe(true)
      expect(span.matches('div #target')).toBe(true)
      expect(span.matches('.test > span')).toBe(true)
    })
  })
})
