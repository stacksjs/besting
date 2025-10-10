import { Window } from './src/index'

const window = new Window()
window.document.body.innerHTML = `
  <a href="file.pdf">PDF</a>
  <a href="image.jpg">Image</a>
  <a href="document.pdf">Document</a>
`

console.log('Testing: [href$=".pdf"]')
const pdfLinks = window.document.querySelectorAll('[href$=".pdf"]')
console.log('Found:', pdfLinks.length, 'elements (should be 2)')
pdfLinks.forEach((el, i) => console.log('  ', i, el.getAttribute('href')))
