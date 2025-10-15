import { Window } from './dist/index.js'

const w = new Window()
w.document.body.innerHTML = '<div class="nav"><ul><li id="test">Item</li></ul></div>'

const li = w.document.getElementById('test')
console.log('Element hierarchy:')
console.log('  li:', li?.tagName)
console.log('  parent:', li?.parentNode?.tagName)
console.log('  grandparent:', li?.parentNode?.parentNode?.tagName, 'class:', (li?.parentNode?.parentNode as any)?.getAttribute('class'))

console.log('\nManual checks:')
console.log('  li matches "li":', li?.tagName === 'LI')
console.log('  parent matches "ul":', li?.parentNode?.tagName === 'UL')
console.log('  grandparent has class "nav":', (li?.parentNode?.parentNode as any)?.getAttribute('class') === 'nav')

const result = w.document.querySelectorAll('.nav ul li')
console.log('\nquerySelectorAll(".nav ul li"):', result.length)
