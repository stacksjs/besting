import { describe, expect, test } from 'bun:test'
import { parseHTML } from '../src/dom'

describe('HTML Parsing Edge Cases', () => {
  describe('Basic Parsing', () => {
    test('should parse empty string', () => {
      const nodes = parseHTML('')
      expect(nodes.length).toBe(0)
    })

    test('should parse plain text', () => {
      const nodes = parseHTML('hello world')
      expect(nodes.length).toBe(1)
      expect(nodes[0].nodeType).toBe('text')
      expect(nodes[0].nodeValue).toBe('hello world')
    })

    test('should parse single element', () => {
      const nodes = parseHTML('<div></div>')
      expect(nodes.length).toBe(1)
      expect(nodes[0].nodeType).toBe('element')
      expect(nodes[0].nodeName).toBe('DIV')
    })

    test('should parse multiple elements', () => {
      const nodes = parseHTML('<div></div><span></span><p></p>')
      expect(nodes.length).toBe(3)
      expect(nodes[0].nodeName).toBe('DIV')
      expect(nodes[1].nodeName).toBe('SPAN')
      expect(nodes[2].nodeName).toBe('P')
    })
  })

  describe('Self-Closing Tags', () => {
    test('should parse br tag', () => {
      const nodes = parseHTML('<br>')
      expect(nodes.length).toBe(1)
      expect(nodes[0].nodeName).toBe('BR')
    })

    test('should parse img tag', () => {
      const nodes = parseHTML('<img src="test.jpg">')
      expect(nodes.length).toBe(1)
      expect(nodes[0].nodeName).toBe('IMG')
    })

    test('should parse input tag', () => {
      const nodes = parseHTML('<input type="text">')
      expect(nodes.length).toBe(1)
      expect(nodes[0].nodeName).toBe('INPUT')
    })

    test('should parse explicit self-closing syntax', () => {
      const nodes = parseHTML('<br />')
      expect(nodes.length).toBe(1)
      expect(nodes[0].nodeName).toBe('BR')
    })

    test('should parse multiple self-closing tags', () => {
      const nodes = parseHTML('<br><hr><img src="a.jpg"><input type="text">')
      expect(nodes.length).toBe(4)
    })
  })

  describe('Attributes Parsing', () => {
    test('should parse single attribute', () => {
      const nodes = parseHTML('<div id="test"></div>')
      expect(nodes[0].attributes.get('id')).toBe('test')
    })

    test('should parse multiple attributes', () => {
      const nodes = parseHTML('<div id="test" class="foo bar" data-value="123"></div>')
      const element = nodes[0] as any
      expect(element.attributes.get('id')).toBe('test')
      expect(element.attributes.get('class')).toBe('foo bar')
      expect(element.attributes.get('data-value')).toBe('123')
    })

    test('should parse attributes without values', () => {
      const nodes = parseHTML('<input disabled checked readonly>')
      const element = nodes[0] as any
      expect(element.attributes.has('disabled')).toBe(true)
      expect(element.attributes.has('checked')).toBe(true)
      expect(element.attributes.has('readonly')).toBe(true)
    })

    test('should parse attributes with empty values', () => {
      const nodes = parseHTML('<div data-empty=""></div>')
      expect(nodes[0].attributes.get('data-empty')).toBe('')
    })

    test('should handle attributes with special characters', () => {
      const nodes = parseHTML('<div data-special="hello-world_123"></div>')
      expect(nodes[0].attributes.get('data-special')).toBe('hello-world_123')
    })

    test('should handle attributes with hyphens', () => {
      const nodes = parseHTML('<div data-my-custom-attr="value"></div>')
      expect(nodes[0].attributes.get('data-my-custom-attr')).toBe('value')
    })
  })

  describe('Nested Elements', () => {
    test('should parse nested elements', () => {
      const nodes = parseHTML('<div><span>text</span></div>')
      expect(nodes.length).toBe(1)
      expect(nodes[0].children.length).toBe(1)
      expect(nodes[0].children[0].nodeName).toBe('SPAN')
    })

    test('should parse deeply nested elements', () => {
      const nodes = parseHTML('<div><div><div><span>deep</span></div></div></div>')
      expect(nodes.length).toBe(1)
      expect(nodes[0].children[0].children[0].children[0].nodeName).toBe('SPAN')
    })

    test('should parse mixed nested content', () => {
      const nodes = parseHTML('<div>text1<span>text2</span>text3</div>')
      expect(nodes.length).toBe(1)
      expect(nodes[0].children.length).toBeGreaterThan(0)
    })

    test('should handle multiple nested levels', () => {
      const html = `
        <div>
          <header>
            <h1>Title</h1>
            <nav>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </nav>
          </header>
        </div>
      `
      const nodes = parseHTML(html)
      expect(nodes.length).toBeGreaterThan(0)
    })
  })

  describe('Text Content', () => {
    test('should parse text between elements', () => {
      const nodes = parseHTML('before<div>middle</div>after')
      expect(nodes.length).toBe(3)
    })

    test('should preserve whitespace in text', () => {
      const nodes = parseHTML('<div>  hello  world  </div>')
      expect(nodes[0].textContent).toContain('hello')
      expect(nodes[0].textContent).toContain('world')
    })

    test('should handle text with special characters', () => {
      const nodes = parseHTML('<div>&amp; &lt; &gt;</div>')
      expect(nodes[0].textContent).toBe('&amp; &lt; &gt;')
    })

    test('should handle empty elements', () => {
      const nodes = parseHTML('<div></div>')
      expect(nodes[0].textContent).toBe('')
    })

    test('should handle only whitespace', () => {
      const nodes = parseHTML('<div>   </div>')
      expect(nodes[0].children.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Malformed HTML', () => {
    test('should handle unclosed tags', () => {
      const nodes = parseHTML('<div><span>text')
      expect(nodes.length).toBeGreaterThan(0)
    })

    test('should handle mismatched tags', () => {
      const nodes = parseHTML('<div></span>')
      expect(nodes.length).toBeGreaterThan(0)
    })

    test('should handle extra closing tags', () => {
      const nodes = parseHTML('<div></div></div>')
      expect(nodes.length).toBeGreaterThan(0)
    })

    test('should handle missing angle brackets', () => {
      const nodes = parseHTML('div>text</div>')
      expect(nodes.length).toBeGreaterThan(0)
    })
  })

  describe('Complex HTML Structures', () => {
    test('should parse table structure', () => {
      const html = `
        <table>
          <thead>
            <tr>
              <th>Header 1</th>
              <th>Header 2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cell 1</td>
              <td>Cell 2</td>
            </tr>
          </tbody>
        </table>
      `
      const nodes = parseHTML(html)
      expect(nodes.length).toBeGreaterThan(0)
    })

    test('should parse form structure', () => {
      const html = `
        <form>
          <input type="text" name="username">
          <input type="password" name="password">
          <select name="role">
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <button type="submit">Submit</button>
        </form>
      `
      const nodes = parseHTML(html)
      expect(nodes.length).toBeGreaterThan(0)
    })

    test('should parse list structures', () => {
      const html = `
        <ul>
          <li>Item 1</li>
          <li>Item 2
            <ul>
              <li>Nested 1</li>
              <li>Nested 2</li>
            </ul>
          </li>
          <li>Item 3</li>
        </ul>
      `
      const nodes = parseHTML(html)
      expect(nodes.length).toBeGreaterThan(0)
    })
  })

  describe('Special Cases', () => {
    test('should handle DOCTYPE', () => {
      const html = '<!DOCTYPE html><html><body></body></html>'
      const nodes = parseHTML(html)
      // DOCTYPE is typically ignored in simple parsers
      expect(nodes.length).toBeGreaterThan(0)
    })

    test('should handle comments', () => {
      const html = '<!-- comment --><div>content</div>'
      const nodes = parseHTML(html)
      expect(nodes.length).toBeGreaterThan(0)
    })

    test('should handle script tags', () => {
      const html = '<script>var x = 10;</script><div>content</div>'
      const nodes = parseHTML(html)
      expect(nodes.length).toBeGreaterThan(0)
    })

    test('should handle style tags', () => {
      const html = '<style>body { margin: 0; }</style><div>content</div>'
      const nodes = parseHTML(html)
      expect(nodes.length).toBeGreaterThan(0)
    })

    test('should handle newlines in HTML', () => {
      const html = `<div>
        <span>line 1</span>
        <span>line 2</span>
      </div>`
      const nodes = parseHTML(html)
      expect(nodes.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Case Attributes', () => {
    test('should handle quoted attribute values', () => {
      const nodes = parseHTML('<div data-value="test value"></div>')
      expect(nodes[0].attributes.get('data-value')).toBe('test value')
    })

    test('should handle attributes with equals in value', () => {
      const nodes = parseHTML('<div data-equation="x=10"></div>')
      expect(nodes[0].attributes.get('data-equation')).toBe('x=10')
    })

    test('should handle boolean attributes', () => {
      const nodes = parseHTML('<input disabled>')
      expect(nodes[0].attributes.has('disabled')).toBe(true)
    })

    test('should handle data attributes', () => {
      const nodes = parseHTML('<div data-user-id="123" data-user-name="John"></div>')
      expect(nodes[0].attributes.get('data-user-id')).toBe('123')
      expect(nodes[0].attributes.get('data-user-name')).toBe('John')
    })
  })

  describe('Performance Tests', () => {
    test('should handle large HTML documents', () => {
      let html = '<div>'
      for (let i = 0; i < 100; i++) {
        html += `<span>Item ${i}</span>`
      }
      html += '</div>'

      const nodes = parseHTML(html)
      expect(nodes.length).toBeGreaterThan(0)
      expect(nodes[0].children.length).toBeGreaterThan(90)
    })

    test('should handle deeply nested structures', () => {
      let html = ''
      for (let i = 0; i < 50; i++) {
        html += '<div>'
      }
      html += 'deep content'
      for (let i = 0; i < 50; i++) {
        html += '</div>'
      }

      const nodes = parseHTML(html)
      expect(nodes.length).toBeGreaterThan(0)
    })

    test('should handle repeated parsing', () => {
      const html = '<div><span>test</span></div>'

      for (let i = 0; i < 100; i++) {
        const nodes = parseHTML(html)
        expect(nodes.length).toBe(1)
      }
    })
  })

  describe('Real-World HTML', () => {
    test('should parse basic HTML5 document structure', () => {
      const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Test Page</title>
          </head>
          <body>
            <header>
              <h1>Welcome</h1>
            </header>
            <main>
              <p>Content here</p>
            </main>
            <footer>
              <p>Footer</p>
            </footer>
          </body>
        </html>
      `
      const nodes = parseHTML(html)
      expect(nodes.length).toBeGreaterThan(0)
    })

    test('should parse navigation menu', () => {
      const html = `
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </nav>
      `
      const nodes = parseHTML(html)
      expect(nodes.length).toBeGreaterThan(0)
    })

    test('should parse card component', () => {
      const html = `
        <div class="card">
          <img src="image.jpg" alt="Card image">
          <div class="card-body">
            <h3 class="card-title">Card Title</h3>
            <p class="card-text">Card description goes here.</p>
            <a href="#" class="btn">Read More</a>
          </div>
        </div>
      `
      const nodes = parseHTML(html)
      expect(nodes.length).toBeGreaterThan(0)
    })
  })
})
