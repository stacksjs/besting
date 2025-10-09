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

  // Uncomment when dependencies are installed:
  // bench('HappyDOM', () => {
  //   const { Window } = require('happy-dom')
  //   const window = new Window()
  //   window.document.write(HTMLPage)
  //   window.document.querySelectorAll('.flex-shrink-0')
  // })

  // bench('JSDOM', () => {
  //   const { JSDOM } = require('jsdom')
  //   const dom = new JSDOM(HTMLPage)
  //   dom.window.document.querySelectorAll('.flex-shrink-0')
  // })
})

// Benchmark Group 5: querySelector (Attribute)
group('🏷️  querySelectorAll("[aria-label]")', () => {
  bench('VeryHappyDOM', () => {
    const doc = createVeryHappyDocument()
    doc.documentElement!.innerHTML = HTMLPage
    doc.querySelectorAll('[aria-label]')
  })

  // Uncomment when dependencies are installed:
  // bench('HappyDOM', () => {
  //   const { Window } = require('happy-dom')
  //   const window = new Window()
  //   window.document.write(HTMLPage)
  //   window.document.querySelectorAll('[aria-label]')
  // })

  // bench('JSDOM', () => {
  //   const { JSDOM } = require('jsdom')
  //   const dom = new JSDOM(HTMLPage)
  //   dom.window.document.querySelectorAll('[aria-label]')
  // })
})

// Benchmark Group 6: querySelector (Attribute Contains)
group('🔎 querySelectorAll(\'[class~="flex-shrink-0"]\')', () => {
  bench('VeryHappyDOM', () => {
    const doc = createVeryHappyDocument()
    doc.documentElement!.innerHTML = HTMLPage
    doc.querySelectorAll('[class~="flex-shrink-0"]')
  })

  // Uncomment when dependencies are installed:
  // bench('HappyDOM', () => {
  //   const { Window } = require('happy-dom')
  //   const window = new Window()
  //   window.document.write(HTMLPage)
  //   window.document.querySelectorAll('[class~="flex-shrink-0"]')
  // })

  // bench('JSDOM', () => {
  //   const { JSDOM } = require('jsdom')
  //   const dom = new JSDOM(HTMLPage)
  //   dom.window.document.querySelectorAll('[class~="flex-shrink-0"]')
  // })
})

// Benchmark Group 7: querySelector (Pseudo-class)
group('🎭 querySelectorAll(":nth-child(2n+1)")', () => {
  bench('VeryHappyDOM', () => {
    const doc = createVeryHappyDocument()
    doc.documentElement!.innerHTML = HTMLPage
    doc.querySelectorAll(':nth-child(2n+1)')
  })

  // Uncomment when dependencies are installed:
  // bench('HappyDOM', () => {
  //   const { Window } = require('happy-dom')
  //   const window = new Window()
  //   window.document.write(HTMLPage)
  //   window.document.querySelectorAll(':nth-child(2n+1)')
  // })

  // bench('JSDOM', () => {
  //   const { JSDOM } = require('jsdom')
  //   const dom = new JSDOM(HTMLPage)
  //   dom.window.document.querySelectorAll(':nth-child(2n+1)')
  // })
})

// Run benchmarks
console.log('\n🏁 Running Competitive Benchmarks...\n')
console.log('📊 Testing against real GitHub HTML page (~193KB)\n')

await run({
  format: 'mitata',
  colors: true,
})

console.log('\n💡 To enable HappyDOM and JSDOM comparisons:')
console.log('   bun add -d happy-dom jsdom')
console.log('   Then uncomment the benchmark code in competitive-comparison.bench.ts\n')
