import { Window } from './src/index'

const window = new Window()
window.document.body.innerHTML = `
  <div class="parent">
    <span>Direct child</span>
    <div>
      <span>Nested child</span>
    </div>
  </div>
`

console.log('Testing child combinator: .parent > span')
const directChildren = window.document.querySelectorAll('.parent > span')
console.log('Found:', directChildren.length, 'elements')
directChildren.forEach((el, i) => console.log(`  ${i}: ${el.textContent}`))

window.close()
