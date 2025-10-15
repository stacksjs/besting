import { parseComplexSelector } from './src/selectors/engine'

// Test parsing
const selector = '.main-nav ul li'
console.log('Parsing:', selector)
const parts = parseComplexSelector(selector)
console.log('Parts:', JSON.stringify(parts, null, 2))

// Test with no spaces
const selector2 = '.main-nav>ul>li'
console.log('\nParsing:', selector2)
const parts2 = parseComplexSelector(selector2)
console.log('Parts:', JSON.stringify(parts2, null, 2))
