import { Window } from './src/index'

const window = new Window()
window.document.body.innerHTML = `
  <div>
    <h1>Title</h1>
    <p>First paragraph</p>
    <p>Second paragraph</p>
    <span>Span</span>
  </div>
`

console.log('Testing: h1 + p')
const adjacentP = window.document.querySelectorAll('h1 + p')
console.log('Found:', adjacentP.length, 'elements (should be 1)')
adjacentP.forEach((el, i) => console.log(`  ${i}: ${el.textContent}`))

console.log('\nTesting: p + p')
const pAfterP = window.document.querySelectorAll('p + p')
console.log('Found:', pAfterP.length, 'elements (should be 1 - only Second paragraph)')
pAfterP.forEach((el, i) => console.log(`  ${i}: ${el.textContent}`))
