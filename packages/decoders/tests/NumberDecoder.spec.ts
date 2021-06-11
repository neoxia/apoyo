import { pipe, Result } from '@apoyo/std'
import { Decoder, NumberDecoder } from '../src'

describe('NumberDecoder.number', () => {
  it('should succeed', () => {
    expect(pipe(42, Decoder.validate(NumberDecoder.number), Result.get)).toBe(42)
    expect(pipe(-42, Decoder.validate(NumberDecoder.number), Result.get)).toBe(-42)
    expect(pipe(42.12, Decoder.validate(NumberDecoder.number), Result.get)).toBe(42.12)
  })

  it('should fail', () => {
    expect(pipe(NaN, Decoder.validate(NumberDecoder.number), Result.isKo)).toBe(true)
    expect(pipe('42', Decoder.validate(NumberDecoder.number), Result.isKo)).toBe(true)
  })
})

describe('NumberDecoder.min', () => {
  const decoder = pipe(NumberDecoder.number, NumberDecoder.min(0))
  it('should succeed', () => {
    expect(pipe(0, Decoder.validate(decoder), Result.get)).toBe(0)
    expect(pipe(42, Decoder.validate(decoder), Result.get)).toBe(42)
    expect(pipe(42.12, Decoder.validate(decoder), Result.get)).toBe(42.12)
  })

  it('should fail', () => {
    expect(pipe(-42, Decoder.validate(decoder), Result.isKo)).toBe(true)
    expect(pipe('42', Decoder.validate(decoder), Result.isKo)).toBe(true)
  })
})

describe('NumberDecoder.max', () => {
  const decoder = pipe(NumberDecoder.number, NumberDecoder.max(0))
  it('should succeed', () => {
    expect(pipe(0, Decoder.validate(decoder), Result.get)).toBe(0)
    expect(pipe(-42, Decoder.validate(decoder), Result.get)).toBe(-42)
    expect(pipe(-42.12, Decoder.validate(decoder), Result.get)).toBe(-42.12)
  })

  it('should fail', () => {
    expect(pipe(42, Decoder.validate(decoder), Result.isKo)).toBe(true)
    expect(pipe('42', Decoder.validate(decoder), Result.isKo)).toBe(true)
  })
})

describe('NumberDecoder.range', () => {
  const decoder = pipe(NumberDecoder.range(0, 8))
  it('should succeed', () => {
    expect(pipe(0, Decoder.validate(decoder), Result.get)).toBe(0)
    expect(pipe(1, Decoder.validate(decoder), Result.get)).toBe(1)
    expect(pipe(7.2, Decoder.validate(decoder), Result.get)).toBe(7.2)
    expect(pipe(8, Decoder.validate(decoder), Result.get)).toBe(8)
  })

  it('should fail', () => {
    expect(pipe(-1, Decoder.validate(decoder), Result.isKo)).toBe(true)
    expect(pipe(9, Decoder.validate(decoder), Result.isKo)).toBe(true)
  })
})

describe('NumberDecoder.fromString', () => {
  const decoder = pipe(NumberDecoder.fromString, NumberDecoder.between(0, 8))
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
  })
})
