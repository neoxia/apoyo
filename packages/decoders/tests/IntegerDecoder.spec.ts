import { pipe, Result } from '@apoyo/std'
import { Decoder, IntegerDecoder } from '../src'

describe('IntegerDecoder.strict', () => {
  it('should succeed', () => {
    expect(pipe(42, Decoder.validate(IntegerDecoder.strict), Result.isOk)).toBe(true)
    expect(pipe(-42, Decoder.validate(IntegerDecoder.strict), Result.isOk)).toBe(true)
    expect(pipe(0, Decoder.validate(IntegerDecoder.strict), Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe(NaN, Decoder.validate(IntegerDecoder.strict), Result.isKo)).toBe(true)
    expect(pipe(42.24, Decoder.validate(IntegerDecoder.strict), Result.isKo)).toBe(true)
    expect(pipe(-42.12, Decoder.validate(IntegerDecoder.strict), Result.isKo)).toBe(true)
  })
})

describe('IntegerDecoder.positive', () => {
  it('should succeed', () => {
    expect(pipe(42, Decoder.validate(IntegerDecoder.positive), Result.isOk)).toBe(true)
    expect(pipe(0, Decoder.validate(IntegerDecoder.positive), Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe(-42, Decoder.validate(IntegerDecoder.positive), Result.isKo)).toBe(true)
    expect(pipe(42.24, Decoder.validate(IntegerDecoder.positive), Result.isKo)).toBe(true)
    expect(pipe(-42.12, Decoder.validate(IntegerDecoder.positive), Result.isKo)).toBe(true)
  })
})

describe('IntegerDecoder.min', () => {
  const decoder = pipe(IntegerDecoder.int, IntegerDecoder.min(0))
  it('should succeed', () => {
    expect(pipe(0, Decoder.validate(decoder), Result.get)).toBe(0)
    expect(pipe(42, Decoder.validate(decoder), Result.get)).toBe(42)
  })

  it('should fail', () => {
    expect(pipe(-42.12, Decoder.validate(decoder), Result.isKo)).toBe(true)
    expect(pipe(-42, Decoder.validate(decoder), Result.isKo)).toBe(true)
  })
})

describe('IntegerDecoder.max', () => {
  const decoder = pipe(IntegerDecoder.int, IntegerDecoder.max(0))
  it('should succeed', () => {
    expect(pipe(0, Decoder.validate(decoder), Result.get)).toBe(0)
    expect(pipe(-42, Decoder.validate(decoder), Result.get)).toBe(-42)
  })

  it('should fail', () => {
    expect(pipe(-42.12, Decoder.validate(decoder), Result.isKo)).toBe(true)
    expect(pipe(42, Decoder.validate(decoder), Result.isKo)).toBe(true)
  })
})

describe('IntegerDecoder.range', () => {
  const decoder = pipe(IntegerDecoder.range(0, 8))
  it('should succeed', () => {
    expect(pipe(0, Decoder.validate(decoder), Result.get)).toBe(0)
    expect(pipe(1, Decoder.validate(decoder), Result.get)).toBe(1)
    expect(pipe(8, Decoder.validate(decoder), Result.get)).toBe(8)
  })

  it('should fail', () => {
    expect(pipe(7.2, Decoder.validate(decoder), Result.isKo)).toBe(true)
    expect(pipe(-1, Decoder.validate(decoder), Result.isKo)).toBe(true)
    expect(pipe(9, Decoder.validate(decoder), Result.isKo)).toBe(true)
  })
})

describe('IntegerDecoder.fromString', () => {
  const decoder = pipe(IntegerDecoder.fromString, IntegerDecoder.between(0, 8))
  it('should succeed', () => {
    expect(pipe('0', Decoder.validate(decoder), Result.get)).toBe(0)
    expect(pipe('1', Decoder.validate(decoder), Result.get)).toBe(1)
    expect(pipe('8', Decoder.validate(decoder), Result.get)).toBe(8)
  })

  it('should fail', () => {
    // Not a string
    expect(pipe(0, Decoder.validate(decoder), Result.isKo)).toBe(true)
    // Not in range
    expect(pipe('-1', Decoder.validate(decoder), Result.isKo)).toBe(true)
    expect(pipe('9', Decoder.validate(decoder), Result.isKo)).toBe(true)

    // Not an integer
    expect(pipe('7.2', Decoder.validate(decoder), Result.isKo)).toBe(true)
  })
})

describe('IntegerDecoder.int', () => {
  it('should succeed', () => {
    expect(pipe(42, Decoder.validate(IntegerDecoder.int), Result.isOk)).toBe(true)
    expect(pipe(-42, Decoder.validate(IntegerDecoder.int), Result.isOk)).toBe(true)
    expect(pipe(0, Decoder.validate(IntegerDecoder.int), Result.isOk)).toBe(true)
    expect(pipe('-42', Decoder.validate(IntegerDecoder.int), Result.isOk)).toBe(true)
    expect(pipe('42', Decoder.validate(IntegerDecoder.int), Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe(NaN, Decoder.validate(IntegerDecoder.int), Result.isKo)).toBe(true)
    expect(pipe(42.24, Decoder.validate(IntegerDecoder.int), Result.isKo)).toBe(true)
    expect(pipe(-42.12, Decoder.validate(IntegerDecoder.int), Result.isKo)).toBe(true)
    expect(pipe('42.12', Decoder.validate(IntegerDecoder.int), Result.isKo)).toBe(true)
  })
})
