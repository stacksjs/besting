import { Window } from './dist/index.js'

const w = new Window()

// Test 1: Simple two-level
w.document.body.innerHTML = '<ul><li>Item</li></ul>'
const test1 = w.document.querySelectorAll('ul li')
console.log('Test 1 (ul li):', test1.length, '- Expected: 1')

// Test 2: Three-level with classes
w.document.body.innerHTML = '<div class="nav"><ul><li>Item</li></ul></div>'
const test2 = w.document.querySelectorAll('.nav ul li')
console.log('Test 2 (.nav ul li):', test2.length, '- Expected: 1')

// Test 3: Try with getElementById to ensure element exists
w.document.body.innerHTML = '<div class="nav"><ul><li id="test">Item</li></ul></div>'
const testEl = w.document.getElementById('test')
console.log('Test 3 - Element exists:', testEl?.tagName, testEl?.textContent)
const test3 = w.document.querySelectorAll('.nav ul li')
console.log('Test 3 (.nav ul li):', test3.length, '- Expected: 1')
