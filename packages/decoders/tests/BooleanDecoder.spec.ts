import { pipe, Result } from '@apoyo/std'
import { BooleanDecoder } from '../src'

describe('BooleanDecoder.boolean', () => {
  it('should succeed', () => {
    expect(pipe(true, BooleanDecoder.boolean, Result.get)).toBe(true)
    expect(pipe(false, BooleanDecoder.boolean, Result.get)).toBe(false)
  })

  it('should fail', () => {
    expect(pipe(0, BooleanDecoder.boolean, Result.isKo)).toBe(true)
    expect(pipe('42', BooleanDecoder.boolean, Result.isKo)).toBe(true)
  })
})

describe('BooleanDecoder.fromString', () => {
  const trueWords = ['true', 'yes', 'y', '1']
  const falseWords = ['false', 'no', 'no', '0']

  it('should succeed', () => {
    for (const word of trueWords) {
      expect(pipe(word, BooleanDecoder.fromString, Result.get)).toBe(true)
    }
    for (const word of falseWords) {
      expect(pipe(word, BooleanDecoder.fromString, Result.get)).toBe(false)
    }
  })

  it('should fail', () => {
    expect(pipe(0, BooleanDecoder.fromString, Result.isKo)).toBe(true)
    expect(pipe('42', BooleanDecoder.fromString, Result.isKo)).toBe(true)
    expect(pipe('something', BooleanDecoder.fromString, Result.isKo)).toBe(true)
  })
})

describe('BooleanDecoder.fromNumber', () => {
  it('should succeed', () => {
    expect(pipe(0, BooleanDecoder.fromNumber, Result.get)).toBe(false)
    expect(pipe(1, BooleanDecoder.fromNumber, Result.get)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe(2, BooleanDecoder.fromNumber, Result.isKo)).toBe(true)
  })
})
