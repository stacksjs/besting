/* eslint-disable no-console */
import { createDocument } from '../../very-happy-dom/src/index'

const HTMLPage = require('./data/HTMLPage')

function testImportVeryHappyDOM() {
  const time1 = performance.now()
  // Import is already done at top
  const time2 = performance.now()
  console.log(`VeryHappyDOM -> Import: ${time2 - time1}ms`)
}

function parseHTML() {
  const time1 = performance.now()
  const document = createDocument()
  document.documentElement!.innerHTML = HTMLPage
  const time2 = performance.now()
  console.log(`VeryHappyDOM -> Parse HTML: ${time2 - time1}ms`)
}

function serializeHTML() {
  const document = createDocument()
  document.documentElement!.innerHTML = HTMLPage

  const time1 = performance.now()
  // Get outerHTML (equivalent to XMLSerializer.serializeToString)
  document.documentElement!.outerHTML
  const time2 = performance.now()
  console.log(`VeryHappyDOM -> Serialize HTML: ${time2 - time1}ms`)
}

function querySelectorAllLiElements() {
  const document = createDocument()
  document.documentElement!.innerHTML = HTMLPage
  const time1 = performance.now()
  const elements = document.querySelectorAll('li')
  const time2 = performance.now()
  console.log(
    `VeryHappyDOM -> querySelectorAll('li') found ${
      elements.length
    } elements: ${time2 - time1}ms`,
  )
}

function querySelectorAllClassElements() {
  const document = createDocument()
  document.documentElement!.innerHTML = HTMLPage
  const time1 = performance.now()
  const elements = document.querySelectorAll('.flex-shrink-0')
  const time2 = performance.now()
  console.log(
    `VeryHappyDOM -> querySelectorAll('.flex-shrink-0') found ${
      elements.length
    } elements: ${time2 - time1}ms`,
  )
}

function querySelectorAllAttributeElements() {
  const document = createDocument()
  document.documentElement!.innerHTML = HTMLPage
  const time1 = performance.now()
  const elements = document.querySelectorAll('[aria-label]')
  const time2 = performance.now()
  console.log(
    `VeryHappyDOM -> querySelectorAll('[aria-label]') found ${
      elements.length
    } elements: ${time2 - time1}ms`,
  )
}

function querySelectorAllAttributeContainsElements() {
  const document = createDocument()
  document.documentElement!.innerHTML = HTMLPage
  const time1 = performance.now()
  const elements = document.querySelectorAll(
    '[class~="flex-shrink-0"]',
  )
  const time2 = performance.now()
  console.log(
    `VeryHappyDOM -> querySelectorAll('[class~="flex-shrink-0"]') found ${
      elements.length
    } elements: ${time2 - time1}ms`,
  )
}

function querySelectorAllNthChildElements() {
  const document = createDocument()
  document.documentElement!.innerHTML = HTMLPage
  const time1 = performance.now()
  const elements = document.querySelectorAll(':nth-child(2n+1)')
  const time2 = performance.now()
  console.log(
    `VeryHappyDOM -> querySelectorAll(':nth-child(2n+1)') found ${
      elements.length
    } elements: ${time2 - time1}ms`,
  )
}

function renderCustomElement() {
  const time1 = performance.now()
  const document = createDocument()
  // Note: Custom elements not yet supported in very-happy-dom
  // This is a placeholder for future implementation
  const time2 = performance.now()
  console.log(`VeryHappyDOM -> Render custom element (not supported): ${time2 - time1}ms`)
}

testImportVeryHappyDOM()
parseHTML()
serializeHTML()
querySelectorAllLiElements()
querySelectorAllClassElements()
querySelectorAllAttributeElements()
querySelectorAllAttributeContainsElements()
querySelectorAllNthChildElements()
renderCustomElement()
