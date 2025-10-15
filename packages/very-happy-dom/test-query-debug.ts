import { Window } from './dist/index.js'

const w = new Window()
w.document.body.innerHTML = '<div class="main-nav"><ul><li>Item 1</li><li>Item 2</li></ul></div>'

console.log('Body children:', w.document.body.children.length)
console.log('First child:', w.document.body.children[0]?.tagName, w.document.body.children[0]?.getAttribute?.('class'))

const navDiv = w.document.querySelector('.main-nav')
console.log('\n.main-nav found:', navDiv?.tagName)

const ul = navDiv?.querySelector('ul')
console.log('ul found:', ul?.tagName)

const li = ul?.children[0]
console.log('li found:', li?.tagName, li?.textContent)

// Now test the full selector
console.log('\nFull selector test:')
const items = w.document.querySelectorAll('.main-nav ul li')
console.log('Found .main-nav ul li:', items.length)

// Try from body
const itemsFromBody = w.document.body.querySelectorAll('.main-nav ul li')
console.log('Found from body:', itemsFromBody.length)

// Try simpler selector
const ulLi = w.document.querySelectorAll('ul li')
console.log('Found ul li:', ulLi.length)
