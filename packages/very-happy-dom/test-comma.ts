import { Window } from './src/index'

const window = new Window()
window.document.body.innerHTML = `
  <h1>Heading</h1>
  <h2>Subheading</h2>
  <p>Paragraph</p>
  <div>Div</div>
`

console.log('Testing: h1, h2, p')
const headings = window.document.querySelectorAll('h1, h2, p')
console.log('Found:', headings.length, 'elements (should be 3)')
headings.forEach((el, i) => console.log('  ', i, el.tagName))
