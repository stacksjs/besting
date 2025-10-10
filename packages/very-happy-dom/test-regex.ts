const testString = 'href$=".pdf"'

console.log('Testing regex patterns:')
console.log('String:', testString)

// Test 1: escaped dollar
const regex1 = /^([a-zA-Z0-9-]+)\$="([^"]*)"$/
console.log('Pattern /\\$/ matches:', regex1.test(testString), regex1.exec(testString))

// Test 2: dollar as end anchor  
const regex2 = /^([a-zA-Z0-9-]+)$="([^"]*)"$/
console.log('Pattern /$/ matches:', regex2.test(testString), regex2.exec(testString))

// Test what we actually need
console.log('\nWhat we need: match "href" "$=" ".pdf"')
const parts = testString.match(/^([a-zA-Z0-9-]+)\$="([^"]*)"$/)
console.log('Match result:', parts)
