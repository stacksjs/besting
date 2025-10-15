import { Window } from './dist/index.js'
import { matchesComplexSelector, parseComplexSelector } from './src/selectors/engine'

const w = new Window()
w.document.body.innerHTML = '<div class="main-nav"><ul><li id="test-li">Item 1</li></ul></div>'

const li = w.document.getElementById('test-li')
console.log('Testing if li matches .main-nav ul li')
console.log('Li element:', li?.tagName, li?.parentNode?.tagName, li?.parentNode?.parentNode?.tagName)

const parts = parseComplexSelector('.main-nav ul li')
console.log('Parts:', JSON.stringify(parts, null, 2))

if (li) {
  const matches = matchesComplexSelector(li, '.main-nav ul li', w.document.body)
  console.log('Matches:', matches)
}
