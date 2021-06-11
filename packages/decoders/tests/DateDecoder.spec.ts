import { pipe, Result } from '@apoyo/std'
import { DateDecoder, Decoder } from '../src'

describe('DateDecoder.date', () => {
  it('should succeed', () => {
    expect(pipe('2020-01-01', Decoder.validate(DateDecoder.date), Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe('2020-01-01 10:00', Decoder.validate(DateDecoder.date), Result.isKo)).toBe(true)
    expect(pipe('2020-13-01', Decoder.validate(DateDecoder.date), Result.isKo)).toBe(true)
    expect(pipe('2020-12-36', Decoder.validate(DateDecoder.date), Result.isKo)).toBe(true)
    expect(pipe(42, Decoder.validate(DateDecoder.date), Result.isKo)).toBe(true)
  })
})

describe('DateDecoder.datetime', () => {
  it('should succeed', () => {
    expect(pipe('2020-01-01T10:00:00', Decoder.validate(DateDecoder.datetime), Result.isOk)).toBe(true)
    expect(pipe('2020-01-01 10:00:00', Decoder.validate(DateDecoder.datetime), Result.isOk)).toBe(true)
    expect(pipe('2020-01-01 10:00:00Z', Decoder.validate(DateDecoder.datetime), Result.isOk)).toBe(true)
  })

  it('should succeed without minutes', () => {
    expect(pipe('2020-01-01T10:00', Decoder.validate(DateDecoder.datetime), Result.isOk)).toBe(true)
    expect(pipe('2020-01-01 10:00', Decoder.validate(DateDecoder.datetime), Result.isOk)).toBe(true)
    expect(pipe('2020-01-01 10:00Z', Decoder.validate(DateDecoder.datetime), Result.isOk)).toBe(true)
  })

  it('should succeed with Date.toISOString', () => {
    expect(pipe(new Date().toISOString(), Decoder.validate(DateDecoder.datetime), Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe('2020-01-01', Decoder.validate(DateDecoder.datetime), Result.isKo)).toBe(true)
    expect(pipe('2020-13-01 10:00', Decoder.validate(DateDecoder.datetime), Result.isKo)).toBe(true)
    expect(pipe('2020-12-36 10:00', Decoder.validate(DateDecoder.datetime), Result.isKo)).toBe(true)
    expect(pipe('2020-12-01 30:00', Decoder.validate(DateDecoder.datetime), Result.isKo)).toBe(true)
    expect(pipe('2020-12-01 10:70', Decoder.validate(DateDecoder.datetime), Result.isKo)).toBe(true)
    expect(pipe(42, Decoder.validate(DateDecoder.datetime), Result.isKo)).toBe(true)
  })
})

describe('DateDecoder.native', () => {
  it('should succeed', () => {
    expect(pipe('2020-01-01T10:00:00', Decoder.validate(DateDecoder.native), Result.get)).toBeInstanceOf(Date)
    expect(pipe('2020-01-01 10:00:00', Decoder.validate(DateDecoder.native), Result.get)).toBeInstanceOf(Date)
    expect(pipe('2020-01-01', Decoder.validate(DateDecoder.native), Result.get)).toBeInstanceOf(Date)
  })

  it('should fail', () => {
    expect(pipe('2020-13-01 10:00', Decoder.validate(DateDecoder.native), Result.isKo)).toBe(true)
    expect(pipe('2020-12-36 10:00', Decoder.validate(DateDecoder.native), Result.isKo)).toBe(true)
    expect(pipe('2020-12-01 30:00', Decoder.validate(DateDecoder.native), Result.isKo)).toBe(true)
    expect(pipe('2020-12-01 10:70', Decoder.validate(DateDecoder.native), Result.isKo)).toBe(true)
    expect(pipe(42, Decoder.validate(DateDecoder.native), Result.isKo)).toBe(true)
  })
})
