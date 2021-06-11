import { pipe, Result } from '@apoyo/std'
import { ArrayDecoder, Decoder, TextDecoder } from '../src'

describe('ArrayDecoder.array', () => {
  const decodeStringArray = ArrayDecoder.array(TextDecoder.string)

  it('should succeed', () => {
    const res = pipe(['Hello', 'World'], Decoder.validate(decodeStringArray), Result.isOk)
    expect(res).toBe(true)
  })

  it('should fail with string', () => {
    const res = pipe('Hello', Decoder.validate(decodeStringArray), Result.isKo)
    expect(res).toBe(true)
  })

  it('should fail with array of bad type', () => {
    const res = pipe([42], Decoder.validate(decodeStringArray), Result.isKo)
    expect(res).toBe(true)
  })
})

describe('ArrayDecoder.nonEmptyArray', () => {
  const decodeArr = ArrayDecoder.nonEmptyArray(TextDecoder.string)

  it('should succeed', () => {
    expect(pipe(['Hello', 'World'], Decoder.validate(decodeArr), Result.isOk)).toBe(true)
    expect(pipe(['Hello'], Decoder.validate(decodeArr), Result.isOk)).toBe(true)
  })

  it('should fail with empty string', () => {
    expect(pipe([], Decoder.validate(decodeArr), Result.isKo)).toBe(true)
  })
})

describe('ArrayDecoder.length', () => {
  const decodeArr = pipe(ArrayDecoder.array(TextDecoder.string), ArrayDecoder.length(2))

  it('should succeed', () => {
    expect(pipe(['Hello', 'World'], Decoder.validate(decodeArr), Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe(['Hello'], Decoder.validate(decodeArr), Result.isKo)).toBe(true)
    expect(pipe(['Hello', 'World', 'Foo'], Decoder.validate(decodeArr), Result.isKo)).toBe(true)
  })
})

describe('ArrayDecoder.min', () => {
  const decodeArr = pipe(ArrayDecoder.array(TextDecoder.string), ArrayDecoder.min(2))

  it('should succeed', () => {
    expect(pipe(['Hello', 'World'], Decoder.validate(decodeArr), Result.isOk)).toBe(true)
    expect(pipe(['Hello', 'World', 'Foo'], Decoder.validate(decodeArr), Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe(['Hello'], Decoder.validate(decodeArr), Result.isKo)).toBe(true)
  })
})

describe('ArrayDecoder.max', () => {
  const decodeArr = pipe(ArrayDecoder.array(TextDecoder.string), ArrayDecoder.max(2))

  it('should succeed', () => {
    expect(pipe(['Hello'], Decoder.validate(decodeArr), Result.isOk)).toBe(true)
    expect(pipe(['Hello', 'World'], Decoder.validate(decodeArr), Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe(['Hello', 'World', 'Foo'], Decoder.validate(decodeArr), Result.isKo)).toBe(true)
  })
})
