import { pipe, Result } from '@apoyo/std'
import { BooleanDecoder, Decoder } from '../src'

describe('BooleanDecoder.strict', () => {
  it('should succeed', () => {
    expect(pipe(true, Decoder.validate(BooleanDecoder.strict), Result.get)).toBe(true)
    expect(pipe(false, Decoder.validate(BooleanDecoder.strict), Result.get)).toBe(false)
  })

  it('should fail', () => {
    expect(pipe(0, Decoder.validate(BooleanDecoder.boolean), Result.isKo)).toBe(true)
    expect(pipe('42', Decoder.validate(BooleanDecoder.boolean), Result.isKo)).toBe(true)
  })
})

describe('BooleanDecoder.fromString', () => {
  const trueWords = ['true', 'yes', 'y', '1']
  const falseWords = ['false', 'no', 'no', '0']

  it('should succeed', () => {
    for (const word of trueWords) {
      expect(pipe(word, Decoder.validate(BooleanDecoder.fromString), Result.get)).toBe(true)
    }
    for (const word of falseWords) {
      expect(pipe(word, Decoder.validate(BooleanDecoder.fromString), Result.get)).toBe(false)
    }
  })

  it('should fail', () => {
    expect(pipe(0, Decoder.validate(BooleanDecoder.fromString), Result.isKo)).toBe(true)
    expect(pipe('42', Decoder.validate(BooleanDecoder.fromString), Result.isKo)).toBe(true)
    expect(pipe('something', Decoder.validate(BooleanDecoder.fromString), Result.isKo)).toBe(true)
  })
})

describe('BooleanDecoder.fromNumber', () => {
  it('should succeed', () => {
    expect(pipe(0, Decoder.validate(BooleanDecoder.fromNumber), Result.get)).toBe(false)
    expect(pipe(1, Decoder.validate(BooleanDecoder.fromNumber), Result.get)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe(2, Decoder.validate(BooleanDecoder.fromNumber), Result.isKo)).toBe(true)
  })
})

describe('BooleanDecoder.equals', () => {
  it('should succeed', () => {
    expect(pipe(false, Decoder.validate(BooleanDecoder.equals(false)), Result.get)).toBe(false)
    expect(pipe(true, Decoder.validate(BooleanDecoder.equals(true)), Result.get)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe(0, Decoder.validate(BooleanDecoder.equals(false)), Result.isKo)).toBe(true)
    expect(pipe(true, Decoder.validate(BooleanDecoder.equals(false)), Result.isKo)).toBe(true)

    expect(pipe(1, Decoder.validate(BooleanDecoder.equals(true)), Result.isKo)).toBe(true)
    expect(pipe(false, Decoder.validate(BooleanDecoder.equals(true)), Result.isKo)).toBe(true)
  })
})

describe('BooleanDecoder.boolean', () => {
  it('should succeed', () => {
    expect(pipe(true, Decoder.validate(BooleanDecoder.boolean), Result.get)).toBe(true)
    expect(pipe(false, Decoder.validate(BooleanDecoder.boolean), Result.get)).toBe(false)
    expect(pipe(1, Decoder.validate(BooleanDecoder.boolean), Result.get)).toBe(true)
    expect(pipe(0, Decoder.validate(BooleanDecoder.boolean), Result.get)).toBe(false)
    expect(pipe('true', Decoder.validate(BooleanDecoder.boolean), Result.get)).toBe(true)
    expect(pipe('false', Decoder.validate(BooleanDecoder.boolean), Result.get)).toBe(false)
  })

  it('should fail', () => {
    expect(pipe('42', Decoder.validate(BooleanDecoder.boolean), Result.isKo)).toBe(true)
    expect(pipe(42, Decoder.validate(BooleanDecoder.boolean), Result.isKo)).toBe(true)
  })
})
