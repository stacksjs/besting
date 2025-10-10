import type { VirtualElement } from '../nodes/VirtualElement'
import type { VirtualNode } from '../nodes/VirtualNode'

/**
 * Main querySelector engine that finds the first matching element
 */
export function querySelectorEngine(root: VirtualNode, selector: string): VirtualElement | null {
  const results = querySelectorAllEngine(root, selector)
  return results.length > 0 ? results[0] : null
}

/**
 * Main querySelectorAll engine that finds all matching elements
 */
export function querySelectorAllEngine(root: VirtualNode, selector: string): VirtualElement[] {
  const results: VirtualElement[] = []

  // Check if we have combinators in the selector
  if (hasCombinators(selector)) {
    // Handle complex selectors with combinators
    function traverse(node: VirtualNode) {
      if (node.nodeType === 'element' && matchesComplexSelector(node as VirtualElement, selector, root)) {
        results.push(node as VirtualElement)
      }
      for (const child of node.children) {
        traverse(child)
      }
    }
    traverse(root)
  }
  else {
    // Simple selector - no combinators
    function traverse(node: VirtualNode) {
      if (node.nodeType === 'element' && matchesSimpleSelector(node as VirtualElement, selector)) {
        results.push(node as VirtualElement)
      }
      for (const child of node.children) {
        traverse(child)
      }
    }
    traverse(root)
  }

  return results
}

/**
 * Check if selector contains combinators (>, +, ~, or space for descendant)
 */
export function hasCombinators(selector: string): boolean {
  // Remove content within brackets and pseudo-classes to avoid false positives
  const cleaned = selector
    .replace(/\[[^\]]*\]/g, '')  // Remove attribute selectors
    .replace(/:not\([^)]*\)/g, '')  // Remove :not() pseudo-class
    .replace(/:nth-child\([^)]*\)/g, '')  // Remove :nth-child()

  return /[>+~]|\s/.test(cleaned)
}

/**
 * Match complex selectors with combinators
 */
export function matchesComplexSelector(element: VirtualElement, selector: string, root: VirtualNode): boolean {
  const parts = parseComplexSelector(selector)

  // Start from the rightmost part (the element itself)
  let currentElement: VirtualElement | null = element
  let partIndex = parts.length - 1

  while (partIndex >= 0 && currentElement) {
    const part = parts[partIndex]

    // Check if current element matches the selector part
    if (!matchesSimpleSelector(currentElement, part.selector)) {
      return false
    }

    // Move to next part
    partIndex--
    if (partIndex < 0) {
      return true // All parts matched
    }

    const nextPart = parts[partIndex]

    // Apply combinator
    switch (nextPart.combinator) {
      case '>': // Child combinator
        currentElement = currentElement.parentNode as VirtualElement | null
        if (!currentElement || currentElement.nodeType !== 'element') {
          return false
        }
        break

      case '+': // Adjacent sibling combinator
        currentElement = currentElement.previousElementSibling
        if (!currentElement) {
          return false
        }
        break

      case '~': // General sibling combinator
        {
          let found = false
          let sibling: VirtualElement | null = currentElement.previousElementSibling
          while (sibling) {
            if (matchesSimpleSelector(sibling, nextPart.selector)) {
              currentElement = sibling
              found = true
              break
            }
            sibling = sibling.previousElementSibling
          }
          if (!found) {
            return false
          }
        }
        break

      case ' ': // Descendant combinator
        {
          let found = false
          let ancestor = currentElement.parentNode as VirtualElement | null
          while (ancestor && ancestor !== root) {
            if (ancestor.nodeType === 'element' && matchesSimpleSelector(ancestor, nextPart.selector)) {
              currentElement = ancestor
              found = true
              break
            }
            ancestor = ancestor.parentNode as VirtualElement | null
          }
          if (!found) {
            return false
          }
        }
        break
    }

    partIndex--
  }

  return true
}

/**
 * Parse complex selector into parts with combinators
 */
export function parseComplexSelector(selector: string): Array<{ selector: string, combinator: string | null }> {
  const parts: Array<{ selector: string, combinator: string | null }> = []
  let currentSelector = ''
  let inBrackets = false
  let inPseudo = false
  let pseudoDepth = 0

  for (let i = 0; i < selector.length; i++) {
    const char = selector[i]
    const nextChar = selector[i + 1]

    if (char === '[') {
      inBrackets = true
      currentSelector += char
    }
    else if (char === ']') {
      inBrackets = false
      currentSelector += char
    }
    else if (char === '(' && currentSelector.endsWith(':not(')) {
      inPseudo = true
      pseudoDepth = 1
      currentSelector += char
    }
    else if (char === '(' && /:\w+\($/.test(currentSelector)) {
      inPseudo = true
      pseudoDepth = 1
      currentSelector += char
    }
    else if (inPseudo && char === '(') {
      pseudoDepth++
      currentSelector += char
    }
    else if (inPseudo && char === ')') {
      pseudoDepth--
      if (pseudoDepth === 0) {
        inPseudo = false
      }
      currentSelector += char
    }
    else if (!inBrackets && !inPseudo && (char === '>' || char === '+' || char === '~' || (char === ' ' && currentSelector && nextChar && nextChar !== ' '))) {
      if (currentSelector.trim()) {
        parts.push({ selector: currentSelector.trim(), combinator: char === ' ' ? ' ' : char })
        currentSelector = ''
      }
      if (char !== ' ') {
        i++ // Skip whitespace after combinator
        while (selector[i] === ' ')
          i++
        i-- // Back up one since loop will increment
      }
    }
    else if (char !== ' ' || currentSelector) {
      currentSelector += char
    }
  }

  if (currentSelector.trim()) {
    parts.push({ selector: currentSelector.trim(), combinator: null })
  }

  return parts
}

/**
 * Match simple selector (no combinators)
 */
export function matchesSimpleSelector(element: VirtualElement, selector: string): boolean {
  // Handle universal selector
  if (selector === '*') {
    return true
  }

  // Remove pseudo-class content before parsing other parts to avoid matching inside pseudo-classes
  const selectorWithoutPseudo = selector.replace(/:([a-zA-Z-]+)\([^)]*\)/g, ':$1')

  // Parse selector parts (tag, id, classes, attributes, pseudo-classes)
  const tagMatch = selectorWithoutPseudo.match(/^([a-zA-Z0-9-]+)/)
  const idMatch = selectorWithoutPseudo.match(/#([a-zA-Z0-9-_]+)/)
  const classMatches = selectorWithoutPseudo.match(/\.([a-zA-Z0-9-_]+)/g)
  const attrMatches = selectorWithoutPseudo.match(/\[([^\]]+)\]/g)
  const pseudoMatches = selector.match(/:([a-zA-Z-]+)(\([^)]*\))?/g)

  // Check tag name
  if (tagMatch && tagMatch[1].toLowerCase() !== element.tagName.toLowerCase()) {
    return false
  }

  // Check ID
  if (idMatch && element.getAttribute('id') !== idMatch[1]) {
    return false
  }

  // Check classes
  if (classMatches) {
    const elementClasses = element.getAttribute('class')?.split(/\s+/).filter(Boolean) || []
    for (const classMatch of classMatches) {
      const className = classMatch.slice(1) // Remove the dot
      if (!elementClasses.includes(className)) {
        return false
      }
    }
  }

  // Check attributes
  if (attrMatches) {
    for (const attrMatch of attrMatches) {
      const attrContent = attrMatch.slice(1, -1) // Remove [ and ]
      if (!matchesAttributeSelector(element, attrContent)) {
        return false
      }
    }
  }

  // Check pseudo-classes
  if (pseudoMatches) {
    for (const pseudoMatch of pseudoMatches) {
      if (!matchesPseudoClass(element, pseudoMatch)) {
        return false
      }
    }
  }

  return true
}

/**
 * Match pseudo-class selectors
 */
export function matchesPseudoClass(element: VirtualElement, pseudo: string): boolean {
  const pseudoMatch = pseudo.match(/:([a-zA-Z-]+)(\(([^)]*)\))?/)
  if (!pseudoMatch)
    return false

  const pseudoName = pseudoMatch[1]
  const pseudoArg = pseudoMatch[3]

  switch (pseudoName) {
    case 'first-child':
      {
        // Only consider element children (not text nodes)
        const siblings = element.parentNode?.children.filter(child => child.nodeType === 'element') || []
        return siblings[0] === element
      }

    case 'last-child':
      {
        // Only consider element children (not text nodes)
        const siblings = element.parentNode?.children.filter(child => child.nodeType === 'element') || []
        return siblings[siblings.length - 1] === element
      }

    case 'nth-child':
      {
        if (!pseudoArg)
          return false
        const siblings = element.parentNode?.children.filter(child => child.nodeType === 'element') || []
        const index = siblings.indexOf(element)
        if (index === -1)
          return false

        const position = index + 1 // 1-indexed

        if (pseudoArg === 'odd')
          return position % 2 === 1
        if (pseudoArg === 'even')
          return position % 2 === 0

        const n = Number.parseInt(pseudoArg, 10)
        if (!Number.isNaN(n))
          return position === n

        return false
      }

    case 'not':
      {
        if (!pseudoArg)
          return false
        // Recursively check if element does NOT match the selector inside :not()
        return !matchesSimpleSelector(element, pseudoArg)
      }

    case 'disabled':
      return element.hasAttribute('disabled')

    case 'enabled':
      return !element.hasAttribute('disabled')

    case 'checked':
      return element.hasAttribute('checked')

    case 'empty':
      return element.children.length === 0

    default:
      return false
  }
}

/**
 * Match attribute selectors with all operators
 */
export function matchesAttributeSelector(element: VirtualElement, attrSelector: string): boolean {
  // [attr] - has attribute
  if (!attrSelector.includes('=')) {
    return element.hasAttribute(attrSelector)
  }

  // [attr="value"] - exact match
  const exactMatch = attrSelector.match(/^([a-zA-Z0-9-]+)="([^"]*)"$/)
  if (exactMatch) {
    return element.getAttribute(exactMatch[1]) === exactMatch[2]
  }

  // [attr^="value"] - starts with
  const startsWithMatch = attrSelector.match(/^([a-zA-Z0-9-]+)\^="([^"]*)"$/)
  if (startsWithMatch) {
    const value = element.getAttribute(startsWithMatch[1])
    return value !== null && value.startsWith(startsWithMatch[2])
  }

  // [attr$="value"] - ends with
  const endsWithMatch = attrSelector.match(/^([a-zA-Z0-9-]+)\$="([^"]*)"$/)
  if (endsWithMatch) {
    const value = element.getAttribute(endsWithMatch[1])
    return value !== null && value.endsWith(endsWithMatch[2])
  }

  // [attr*="value"] - contains
  const containsMatch = attrSelector.match(/^([a-zA-Z0-9-]+)\*="([^"]*)"$/)
  if (containsMatch) {
    const value = element.getAttribute(containsMatch[1])
    return value !== null && value.includes(containsMatch[2])
  }

  // [attr~="value"] - contains word
  const wordMatch = attrSelector.match(/^([a-zA-Z0-9-]+)~="([^"]*)"$/)
  if (wordMatch) {
    const value = element.getAttribute(wordMatch[1])
    if (value === null)
      return false
    const words = value.split(/\s+/)
    return words.includes(wordMatch[2])
  }

  return false
}
