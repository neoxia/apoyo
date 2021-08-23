import { pipe, Result } from '@apoyo/std'
import { Decoder, EnumDecoder } from '../src'

enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

describe('EnumDecoder.native', () => {
  const decoder = EnumDecoder.native(Status)

  it('should succeed', () => {
    expect(pipe(Status.ACTIVE, Decoder.validate(decoder), Result.get)).toBe(Status.ACTIVE)
    expect(pipe('active', Decoder.validate(decoder), Result.get)).toBe(Status.ACTIVE)
  })

  it('should fail', () => {
    expect(pipe('xxx', Decoder.validate(decoder), Result.isKo)).toBe(true)
  })
})

describe('EnumDecoder.literal', () => {
  const decoder = pipe(EnumDecoder.literal('ongoing'))
  const multiple = pipe(EnumDecoder.literal('todo', 'ongoing', 'done'))

  it('should succeed', () => {
    expect(pipe('ongoing', Decoder.validate(decoder), Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe('anything else', Decoder.validate(decoder), Result.isKo)).toBe(true)
  })

  it('should succeed with multiple', () => {
    expect(pipe('todo', Decoder.validate(multiple), Result.isOk)).toBe(true)
    expect(pipe('ongoing', Decoder.validate(multiple), Result.isOk)).toBe(true)
    expect(pipe('done', Decoder.validate(multiple), Result.isOk)).toBe(true)
  })

  it('should fail with multiple', () => {
    expect(pipe('anything else', Decoder.validate(multiple), Result.isKo)).toBe(true)
  })
})

describe('EnumDecoder.isIn', () => {
  const decoder = pipe(EnumDecoder.isIn(['todo', 'ongoing', 'done']))
  it('should succeed', () => {
    expect(pipe('todo', Decoder.validate(decoder), Result.isOk)).toBe(true)
    expect(pipe('ongoing', Decoder.validate(decoder), Result.isOk)).toBe(true)
    expect(pipe('done', Decoder.validate(decoder), Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe('anything else', Decoder.validate(decoder), Result.isKo)).toBe(true)
  })
})
