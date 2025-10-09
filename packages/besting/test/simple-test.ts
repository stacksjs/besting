import { describe, expect, test } from 'bun:test'
import { createDocument } from '../src/dom'

describe('Simple test', () => {
  test('create document', () => {
    const doc = createDocument()
    expect(doc).toBeDefined()
  })
})
