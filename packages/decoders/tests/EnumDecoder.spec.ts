import { pipe, Result } from '@apoyo/std'
import { Decoder, EnumDecoder } from '../src'

enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

describe('EnumDecoder.from', () => {
  const decoder = EnumDecoder.from(Status)

  it('should succeed', () => {
    expect(pipe(Status.ACTIVE, Decoder.validate(decoder), Result.get)).toBe(Status.ACTIVE)
    expect(pipe('active', Decoder.validate(decoder), Result.get)).toBe(Status.ACTIVE)
  })

  it('should fail', () => {
    expect(pipe('xxx', Decoder.validate(decoder), Result.isKo)).toBe(true)
  })
})
