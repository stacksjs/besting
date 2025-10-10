/**
 * Competitive DOM Performance Benchmarks
 *
 * Compares very-happy-dom against happy-dom and jsdom
 * Using the same tests from: https://github.com/capricorn86/happy-dom-performance-test
 */

import { bench, group, run } from 'mitata'
import { createDocument as createVeryHappyDocument } from 'very-happy-dom'

// Load test data
const HTMLPage = require('./lib/data/HTMLPage')

// Benchmark Group 1: HTML Parsing
group('⚡ HTML Parsing (GitHub Page ~193KB)', () => {
  bench('VeryHappyDOM', () => {
    const doc = createVeryHappyDocument()
    doc.documentElement!.innerHTML = HTMLPage
  })

  bench('HappyDOM', () => {
    const { Window } = require('happy-dom')
    const window = new Window()
    window.document.write(HTMLPage)
  })

  bench('JSDOM', () => {
    const { JSDOM } = require('jsdom')
    new JSDOM(HTMLPage)
  })
})

// Benchmark Group 2: HTML Serialization
group('📝 HTML Serialization', () => {
  bench('VeryHappyDOM', () => {
    const doc = createVeryHappyDocument()
    doc.documentElement!.innerHTML = HTMLPage
    doc.documentElement!.outerHTML
  })

  bench('HappyDOM', () => {
    const { Window } = require('happy-dom')
    const window = new Window()
    window.document.write(HTMLPage)
    const xmlSerializer = new window.XMLSerializer()
    xmlSerializer.serializeToString(window.document)
  })

  bench('JSDOM', () => {
    const { JSDOM } = require('jsdom')
    const dom = new JSDOM(HTMLPage)
    const xmlSerializer = new dom.window.XMLSerializer()
    xmlSerializer.serializeToString(dom.window.document)
  })
})

// Benchmark Group 3: querySelector (Tag)
group('🔍 querySelectorAll("li")', () => {
  bench('VeryHappyDOM', () => {
    const doc = createVeryHappyDocument()
    doc.documentElement!.innerHTML = HTMLPage
    doc.querySelectorAll('li')
  })

  bench('HappyDOM', () => {
    const { Window } = require('happy-dom')
    const window = new Window()
    window.document.write(HTMLPage)
    window.document.querySelectorAll('li')
  })

  bench('JSDOM', () => {
    const { JSDOM } = require('jsdom')
    const dom = new JSDOM(HTMLPage)
    dom.window.document.querySelectorAll('li')
  })
})

// Benchmark Group 4: querySelector (Class)
group('🎯 querySelectorAll(".flex-shrink-0")', () => {
  bench('VeryHappyDOM', () => {
    const doc = createVeryHappyDocument()
    doc.documentElement!.innerHTML = HTMLPage
    doc.querySelectorAll('.flex-shrink-0')
  })

  bench('HappyDOM', () => {
    const { Window } = require('happy-dom')
    const window = new Window()
    window.document.write(HTMLPage)
    window.document.querySelectorAll('.flex-shrink-0')
  })

  bench('JSDOM', () => {
    const { JSDOM } = require('jsdom')
    const dom = new JSDOM(HTMLPage)
    dom.window.document.querySelectorAll('.flex-shrink-0')
  })
})

// Benchmark Group 5: querySelector (Attribute)
group('🏷️  querySelectorAll("[aria-label]")', () => {
  bench('VeryHappyDOM', () => {
    const doc = createVeryHappyDocument()
    doc.documentElement!.innerHTML = HTMLPage
    doc.querySelectorAll('[aria-label]')
  })

  bench('HappyDOM', () => {
    const { Window } = require('happy-dom')
    const window = new Window()
    window.document.write(HTMLPage)
    window.document.querySelectorAll('[aria-label]')
  })

  bench('JSDOM', () => {
    const { JSDOM } = require('jsdom')
    const dom = new JSDOM(HTMLPage)
    dom.window.document.querySelectorAll('[aria-label]')
  })
})

// Benchmark Group 6: querySelector (Attribute Contains)
group('🔎 querySelectorAll(\'[class~="flex-shrink-0"]\')', () => {
  bench('VeryHappyDOM', () => {
    const doc = createVeryHappyDocument()
    doc.documentElement!.innerHTML = HTMLPage
    doc.querySelectorAll('[class~="flex-shrink-0"]')
  })

  bench('HappyDOM', () => {
    const { Window } = require('happy-dom')
    const window = new Window()
    window.document.write(HTMLPage)
    window.document.querySelectorAll('[class~="flex-shrink-0"]')
  })

  bench('JSDOM', () => {
    const { JSDOM } = require('jsdom')
    const dom = new JSDOM(HTMLPage)
    dom.window.document.querySelectorAll('[class~="flex-shrink-0"]')
  })
})

// Benchmark Group 7: querySelector (Pseudo-class)
group('🎭 querySelectorAll(":nth-child(2n+1)")', () => {
  bench('VeryHappyDOM', () => {
    const doc = createVeryHappyDocument()
    doc.documentElement!.innerHTML = HTMLPage
    doc.querySelectorAll(':nth-child(2n+1)')
  })

  bench('HappyDOM', () => {
    const { Window } = require('happy-dom')
    const window = new Window()
    window.document.write(HTMLPage)
    window.document.querySelectorAll(':nth-child(2n+1)')
  })

  bench('JSDOM', () => {
    const { JSDOM } = require('jsdom')
    const dom = new JSDOM(HTMLPage)
    dom.window.document.querySelectorAll(':nth-child(2n+1)')
  })
})

// Benchmark Group 8: DOM Manipulation
group('⚡ DOM Manipulation (Build 100-item list)', () => {
  bench('VeryHappyDOM', () => {
    const doc = createVeryHappyDocument()
    const ul = doc.createElement('ul')

    for (let i = 0; i < 100; i++) {
      const li = doc.createElement('li')
      li.textContent = `Item ${i}`
      li.setAttribute('data-id', i.toString())
      ul.appendChild(li)
    }

    doc.body!.appendChild(ul)
  })

  bench('HappyDOM', () => {
    const { Window } = require('happy-dom')
    const window = new Window()
    const ul = window.document.createElement('ul')

    for (let i = 0; i < 100; i++) {
      const li = window.document.createElement('li')
      li.textContent = `Item ${i}`
      li.setAttribute('data-id', i.toString())
      ul.appendChild(li)
    }

    window.document.body.appendChild(ul)
  })

  bench('JSDOM', () => {
    const { JSDOM } = require('jsdom')
    const dom = new JSDOM()
    const ul = dom.window.document.createElement('ul')

    for (let i = 0; i < 100; i++) {
      const li = dom.window.document.createElement('li')
      li.textContent = `Item ${i}`
      li.setAttribute('data-id', i.toString())
      ul.appendChild(li)
    }

    dom.window.document.body.appendChild(ul)
  })
})

// Benchmark Group 9: Attribute Operations
group('📋 Attribute Operations (100 get/set)', () => {
  bench('VeryHappyDOM', () => {
    const doc = createVeryHappyDocument()
    const el = doc.createElement('div')

    for (let i = 0; i < 100; i++) {
      el.setAttribute(`attr-${i}`, `value-${i}`)
      el.getAttribute(`attr-${i}`)
    }
  })

  bench('HappyDOM', () => {
    const { Window } = require('happy-dom')
    const window = new Window()
    const el = window.document.createElement('div')

    for (let i = 0; i < 100; i++) {
      el.setAttribute(`attr-${i}`, `value-${i}`)
      el.getAttribute(`attr-${i}`)
    }
  })

  bench('JSDOM', () => {
    const { JSDOM } = require('jsdom')
    const dom = new JSDOM()
    const el = dom.window.document.createElement('div')

    for (let i = 0; i < 100; i++) {
      el.setAttribute(`attr-${i}`, `value-${i}`)
      el.getAttribute(`attr-${i}`)
    }
  })
})

// Benchmark Group 10: Real-World Scenario - Data Table
group('🌍 Real-World: Build Data Table (20×5)', () => {
  bench('VeryHappyDOM', () => {
    const doc = createVeryHappyDocument()
    const table = doc.createElement('table')

    for (let i = 0; i < 20; i++) {
      const row = doc.createElement('tr')
      for (let j = 0; j < 5; j++) {
        const cell = doc.createElement('td')
        cell.textContent = `Cell ${i},${j}`
        row.appendChild(cell)
      }
      table.appendChild(row)
    }

    doc.body!.appendChild(table)
  })

  bench('HappyDOM', () => {
    const { Window } = require('happy-dom')
    const window = new Window()
    const table = window.document.createElement('table')

    for (let i = 0; i < 20; i++) {
      const row = window.document.createElement('tr')
      for (let j = 0; j < 5; j++) {
        const cell = window.document.createElement('td')
        cell.textContent = `Cell ${i},${j}`
        row.appendChild(cell)
      }
      table.appendChild(row)
    }

    window.document.body.appendChild(table)
  })

  bench('JSDOM', () => {
    const { JSDOM } = require('jsdom')
    const dom = new JSDOM()
    const table = dom.window.document.createElement('table')

    for (let i = 0; i < 20; i++) {
      const row = dom.window.document.createElement('tr')
      for (let j = 0; j < 5; j++) {
        const cell = dom.window.document.createElement('td')
        cell.textContent = `Cell ${i},${j}`
        row.appendChild(cell)
      }
      table.appendChild(row)
    }

    dom.window.document.body.appendChild(table)
  })
})

// Run benchmarks
console.log('\n🏁 Running Competitive Benchmarks...\n')
console.log('📊 Testing against real GitHub HTML page (~193KB)\n')

await run({
  format: 'mitata',
  colors: true,
})

console.log('\n✅ All competitive benchmarks completed!')
