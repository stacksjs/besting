/**
 * DOM Performance Benchmarks using mitata
 *
 * Competing with happy-dom performance test:
 * https://github.com/capricorn86/happy-dom-performance-test
 */

import { bench, group, run } from 'mitata'
import { createDocument } from '../src/dom'

// Benchmark: Document Creation
group('Document Creation', () => {
  bench('createDocument()', () => {
    createDocument()
  })

  bench('create 100 documents', () => {
    for (let i = 0; i < 100; i++) {
      createDocument()
    }
  })
})

// Benchmark: Element Creation
group('Element Creation', () => {
  const doc = createDocument()

  bench('createElement', () => {
    doc.createElement('div')
  }).baseline()

  bench('createElement + setAttribute', () => {
    const el = doc.createElement('div')
    el.setAttribute('id', 'test')
    el.setAttribute('class', 'container')
  })

  bench('create 1000 elements', () => {
    for (let i = 0; i < 1000; i++) {
      doc.createElement('div')
    }
  })

  bench('create + set attributes (1000x)', () => {
    for (let i = 0; i < 1000; i++) {
      const el = doc.createElement('div')
      el.setAttribute('id', `item-${i}`)
      el.setAttribute('class', 'item')
      el.setAttribute('data-index', i.toString())
    }
  })
})

// Benchmark: HTML Parsing
group('HTML Parsing', () => {
  const doc = createDocument()

  const smallHTML = '<div>Hello World</div>'

  const mediumHTML = `
    <div class="container">
      <h1 id="title">Hello World</h1>
      <p class="description">Lorem ipsum dolor sit amet</p>
      <ul class="list">
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
        <li>Item 4</li>
        <li>Item 5</li>
      </ul>
    </div>
  `

  const largeHTML = `
    <html>
      <head>
        <title>Test Page</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width">
      </head>
      <body>
        <header>
          <nav>
            <ul>
              ${Array.from({ length: 10 }).map((_, i) => `<li><a href="#${i}">Link ${i}</a></li>`).join('')}
            </ul>
          </nav>
        </header>
        <main>
          ${Array.from({ length: 100 }).map((_, i) => `
            <article class="post" data-id="${i}">
              <h2 class="post-title">Post ${i}</h2>
              <p class="post-content">This is the content for post number ${i}</p>
              <footer>
                <span class="author">Author ${i % 5}</span>
                <time datetime="2024-01-01">2024-01-01</time>
              </footer>
            </article>
          `).join('')}
        </main>
      </body>
    </html>
  `

  bench('parse small HTML', () => {
    doc.body!.innerHTML = smallHTML
  }).baseline()

  bench('parse medium HTML', () => {
    doc.body!.innerHTML = mediumHTML
  })

  bench('parse large HTML (100 articles)', () => {
    doc.documentElement!.innerHTML = largeHTML
  })

  bench('parse + query', () => {
    const freshDoc = createDocument()
    freshDoc.body!.innerHTML = mediumHTML
    freshDoc.querySelector('.container')
  })
})

// Benchmark: querySelector Operations
group('querySelector Operations', () => {
  const doc = createDocument()

  // Setup large DOM
  doc.body!.innerHTML = `
    <div class="app">
      ${Array.from({ length: 200 }).map((_, i) => `
        <div class="item" id="item-${i}" data-index="${i}">
          <h3 class="title">Title ${i}</h3>
          <p class="description">Description ${i}</p>
          <button class="btn" type="button">Click</button>
        </div>
      `).join('')}
    </div>
  `

  bench('querySelector by ID', () => {
    doc.querySelector('#item-100')
  }).baseline()

  bench('querySelector by class', () => {
    doc.querySelector('.title')
  })

  bench('querySelector by tag', () => {
    doc.querySelector('button')
  })

  bench('querySelector by attribute', () => {
    doc.querySelector('[data-index="50"]')
  })

  bench('querySelector nested', () => {
    doc.querySelector('.app .item .title')
  })
})

// Benchmark: querySelectorAll Operations
group('querySelectorAll Operations', () => {
  const doc = createDocument()

  // Setup large DOM
  doc.body!.innerHTML = `
    <div class="app">
      ${Array.from({ length: 200 }).map((_, i) => `
        <div class="item" id="item-${i}" data-index="${i}">
          <h3 class="title">Title ${i}</h3>
          <p class="description">Description ${i}</p>
          <button class="btn" type="button">Click</button>
        </div>
      `).join('')}
    </div>
  `

  bench('querySelectorAll by class (200 results)', () => {
    doc.querySelectorAll('.item')
  }).baseline()

  bench('querySelectorAll by tag (200 results)', () => {
    doc.querySelectorAll('div')
  })

  bench('querySelectorAll by attribute', () => {
    doc.querySelectorAll('[data-index]')
  })

  bench('querySelectorAll + iteration', () => {
    const items = doc.querySelectorAll('.item')
    for (const item of items) {
      item.getAttribute('id')
    }
  })
})

// Benchmark: DOM Manipulation
group('DOM Manipulation', () => {
  bench('appendChild (single)', () => {
    const doc = createDocument()
    const parent = doc.createElement('div')
    const child = doc.createElement('span')
    parent.appendChild(child)
  }).baseline()

  bench('appendChild (1000 children)', () => {
    const doc = createDocument()
    const parent = doc.createElement('div')
    for (let i = 0; i < 1000; i++) {
      const child = doc.createElement('div')
      child.textContent = `Child ${i}`
      parent.appendChild(child)
    }
  })

  bench('removeChild (1000 children)', () => {
    const doc = createDocument()
    const parent = doc.createElement('div')

    // Add children
    for (let i = 0; i < 1000; i++) {
      const child = doc.createElement('div')
      parent.appendChild(child)
    }

    // Remove children
    while (parent.children.length > 0) {
      parent.removeChild(parent.children[0])
    }
  })

  bench('textContent set (1000x)', () => {
    const doc = createDocument()
    const el = doc.createElement('div')
    for (let i = 0; i < 1000; i++) {
      el.textContent = `Updated ${i}`
    }
  })

  bench('textContent get (1000x)', () => {
    const doc = createDocument()
    const el = doc.createElement('div')
    el.textContent = 'Test content'
    for (let i = 0; i < 1000; i++) {
      const _text = el.textContent
    }
  })
})

// Benchmark: Attribute Operations
group('Attribute Operations', () => {
  const doc = createDocument()
  const el = doc.createElement('div')

  bench('setAttribute', () => {
    el.setAttribute('id', 'test')
  }).baseline()

  bench('getAttribute', () => {
    el.getAttribute('id')
  })

  bench('hasAttribute', () => {
    el.hasAttribute('id')
  })

  bench('removeAttribute', () => {
    el.removeAttribute('id')
  })

  bench('set 10 attributes', () => {
    for (let i = 0; i < 10; i++) {
      el.setAttribute(`attr-${i}`, `value-${i}`)
    }
  })

  bench('get 10 attributes', () => {
    for (let i = 0; i < 10; i++) {
      el.getAttribute(`attr-${i}`)
    }
  })
})

// Benchmark: Class List Operations
group('ClassList Operations', () => {
  bench('classList.add', () => {
    const doc = createDocument()
    const el = doc.createElement('div')
    el.classList.add('test-class')
  }).baseline()

  bench('classList.remove', () => {
    const doc = createDocument()
    const el = doc.createElement('div')
    el.classList.add('test-class')
    el.classList.remove('test-class')
  })

  bench('classList.contains', () => {
    const doc = createDocument()
    const el = doc.createElement('div')
    el.classList.add('test-class')
    el.classList.contains('test-class')
  })

  bench('classList.toggle', () => {
    const doc = createDocument()
    const el = doc.createElement('div')
    el.classList.toggle('active')
  })

  bench('classList add 100 classes', () => {
    const doc = createDocument()
    const el = doc.createElement('div')
    for (let i = 0; i < 100; i++) {
      el.classList.add(`class-${i}`)
    }
  })

  bench('classList contains check (100x)', () => {
    const doc = createDocument()
    const el = doc.createElement('div')
    el.classList.add('active')
    for (let i = 0; i < 100; i++) {
      el.classList.contains('active')
    }
  })
})

// Benchmark: innerHTML Operations
group('innerHTML Operations', () => {
  const doc = createDocument()

  const html = `
    <div class="container">
      <h1>Title</h1>
      <p>Content</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
    </div>
  `

  bench('innerHTML set', () => {
    const el = doc.createElement('div')
    el.innerHTML = html
  }).baseline()

  bench('innerHTML get', () => {
    const el = doc.createElement('div')
    el.innerHTML = html
    const _result = el.innerHTML
  })

  bench('innerHTML set 100x', () => {
    const el = doc.createElement('div')
    for (let i = 0; i < 100; i++) {
      el.innerHTML = `<div>Content ${i}</div>`
    }
  })

  bench('outerHTML get', () => {
    const el = doc.createElement('div')
    el.innerHTML = html
    const _result = el.outerHTML
  })
})

// Benchmark: Memory & Cleanup
group('Memory Efficiency', () => {
  bench('create + destroy 100 documents', () => {
    for (let i = 0; i < 100; i++) {
      const doc = createDocument()
      doc.body!.innerHTML = '<div>Test</div>'
    }
  })

  bench('large DOM tree creation', () => {
    const doc = createDocument()
    const buildTree = (parent: any, depth: number) => {
      if (depth === 0)
        return
      for (let i = 0; i < 5; i++) {
        const el = doc.createElement('div')
        parent.appendChild(el)
        buildTree(el, depth - 1)
      }
    }
    buildTree(doc.body, 5)
  })

  bench('clone deep tree', () => {
    const doc = createDocument()
    doc.body!.innerHTML = `
      <div>
        ${Array.from({ length: 50 }).map(() => '<div><span>Text</span></div>').join('')}
      </div>
    `
  })
})

// Run all benchmarks
await run({
  format: 'mitata', // output format: 'mitata', 'json', 'markdown', 'quiet'
  colors: true, // enable/disable colors
})
