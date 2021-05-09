import { pipe, Result } from '@apoyo/std'
import { ArrayDecoder, TextDecoder } from '../src'

describe('ArrayDecoder.array', () => {
  const decodeStringArray = ArrayDecoder.array(TextDecoder.string)

  it('should succeed', () => {
    const res = pipe(decodeStringArray(['Hello', 'World']), Result.isOk)
    expect(res).toBe(true)
  })

  it('should fail with string', () => {
    const res = pipe(decodeStringArray('Hello'), Result.isKo)
    expect(res).toBe(true)
  })

  it('should fail with array of bad type', () => {
    const res = pipe(decodeStringArray([42]), Result.isKo)
    expect(res).toBe(true)
  })
})

describe('Decode.nonEmptyArray', () => {
  const decodeArr = ArrayDecoder.nonEmptyArray(TextDecoder.string)

  it('should succeed', () => {
    expect(pipe(['Hello', 'World'], decodeArr, Result.isOk)).toBe(true)
    expect(pipe(['Hello'], decodeArr, Result.isOk)).toBe(true)
  })

  it('should fail with empty string', () => {
    expect(pipe([], decodeArr, Result.isKo)).toBe(true)
  })
})
