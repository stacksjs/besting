import { Window } from './src/index'

const window = new Window()
window.document.body.innerHTML = `
  <div></div>
  <div>Not empty</div>
  <span></span>
  <p>Content</p>
`

console.log('Testing: :empty')
const empty = window.document.querySelectorAll(':empty')
console.log('Found:', empty.length, 'elements should be 2')
empty.forEach((el, i) => console.log('  Element', i, el.tagName))

const divs = window.document.querySelectorAll('div')
divs.forEach((div, i) => {
  console.log('Div', i, 'children.length =', div.children.length)
})
