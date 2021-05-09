import { pipe, Result } from '@apoyo/std'
import { DateDecoder } from '../src'

describe('DateDecoder.date', () => {
  it('should succeed', () => {
    expect(pipe('2020-01-01', DateDecoder.date, Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe('2020-01-01 10:00', DateDecoder.date, Result.isKo)).toBe(true)
    expect(pipe('2020-13-01', DateDecoder.date, Result.isKo)).toBe(true)
    expect(pipe('2020-12-36', DateDecoder.date, Result.isKo)).toBe(true)
    expect(pipe(42, DateDecoder.date, Result.isKo)).toBe(true)
  })
})

describe('DateDecoder.datetime', () => {
  it('should succeed', () => {
    expect(pipe('2020-01-01T10:00:00', DateDecoder.datetime, Result.isOk)).toBe(true)
    expect(pipe('2020-01-01 10:00:00', DateDecoder.datetime, Result.isOk)).toBe(true)
    expect(pipe('2020-01-01 10:00:00Z', DateDecoder.datetime, Result.isOk)).toBe(true)
  })

  it('should succeed without minutes', () => {
    expect(pipe('2020-01-01T10:00', DateDecoder.datetime, Result.isOk)).toBe(true)
    expect(pipe('2020-01-01 10:00', DateDecoder.datetime, Result.isOk)).toBe(true)
    expect(pipe('2020-01-01 10:00Z', DateDecoder.datetime, Result.isOk)).toBe(true)
  })

  it('should succeed with Date.toISOString', () => {
    expect(pipe(new Date().toISOString(), DateDecoder.datetime, Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe('2020-01-01', DateDecoder.datetime, Result.isKo)).toBe(true)
    expect(pipe('2020-13-01 10:00', DateDecoder.datetime, Result.isKo)).toBe(true)
    expect(pipe('2020-12-36 10:00', DateDecoder.datetime, Result.isKo)).toBe(true)
    expect(pipe('2020-12-01 30:00', DateDecoder.datetime, Result.isKo)).toBe(true)
    expect(pipe('2020-12-01 10:70', DateDecoder.datetime, Result.isKo)).toBe(true)
    expect(pipe(42, DateDecoder.datetime, Result.isKo)).toBe(true)
  })
})
