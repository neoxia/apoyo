import { pipe, Result } from '@apoyo/std'
import { Decoder, TextDecoder } from '../src'

describe('TextDecoder.string', () => {
  it('should succeed', () => {
    expect(pipe('Test', Decoder.validate(TextDecoder.string), Result.get)).toBe('Test')
    expect(pipe('', Decoder.validate(TextDecoder.string), Result.get)).toBe('')
  })

  it('should fail', () => {
    expect(pipe(42, Decoder.validate(TextDecoder.string), Result.isKo)).toBe(true)
    expect(pipe(undefined, Decoder.validate(TextDecoder.string), Result.isKo)).toBe(true)
    expect(pipe(null, Decoder.validate(TextDecoder.string), Result.isKo)).toBe(true)
  })
})

describe('TextDecoder.length', () => {
  const decoder = pipe(TextDecoder.string, TextDecoder.length(1))
  it('should succeed', () => {
    expect(pipe('I', Decoder.validate(decoder), Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe('', Decoder.validate(decoder), Result.isKo)).toBe(true)
    expect(pipe('II', Decoder.validate(decoder), Result.isKo)).toBe(true)
  })
})

describe('TextDecoder.min', () => {
  const decoder = pipe(TextDecoder.string, TextDecoder.min(1))
  it('should succeed', () => {
    const res = pipe('I', Decoder.validate(decoder))
    expect(Result.isOk(res)).toBe(true)
  })

  it('should fail', () => {
    const res = pipe('', Decoder.validate(decoder))
    expect(Result.isKo(res)).toBe(true)
  })
})

describe('TextDecoder.max', () => {
  const decoder = pipe(TextDecoder.string, TextDecoder.max(5))
  it('should succeed', () => {
    const res = pipe('Hello', Decoder.validate(decoder))
    expect(Result.isOk(res)).toBe(true)
  })

  it('should fail', () => {
    const res = pipe('Hello!', Decoder.validate(decoder))
    expect(Result.isKo(res)).toBe(true)
  })
})

describe('TextDecoder.varchar', () => {
  const decoder = pipe(TextDecoder.varchar(1, 5))
  it('should succeed', () => {
    const res = pipe('Hello', Decoder.validate(decoder))
    expect(Result.isOk(res)).toBe(true)
  })

  it('should fail as under minimum', () => {
    const res = pipe('', Decoder.validate(decoder))
    expect(Result.isKo(res)).toBe(true)
  })

  it('should fail as above maximum', () => {
    const res = pipe('Hello world', Decoder.validate(decoder))
    expect(Result.isKo(res)).toBe(true)
  })
})

describe('TextDecoder.trim', () => {
  it('should succeed', () => {
    const decoder = pipe(TextDecoder.string, TextDecoder.trim, TextDecoder.between(1, 5))
    const res = pipe('  Hello  ', Decoder.validate(decoder))
    expect(Result.isOk(res)).toBe(true)
  })

  it('should fail as applied after character verification', () => {
    const decoder = pipe(TextDecoder.varchar(1, 5), TextDecoder.trim)
    const res = pipe('  Hello  ', Decoder.validate(decoder))
    expect(Result.isKo(res)).toBe(true)
  })
})

describe('TextDecoder.uuid', () => {
  it('should succeed', () => {
    const res = pipe('393963d6-ec11-42df-a33f-dd027afe8f74', Decoder.validate(TextDecoder.uuid))
    expect(Result.isOk(res)).toBe(true)
  })

  it('should fail', () => {
    const res = pipe('xxxx-xxxx-xxxx-xxxx-xxxx', Decoder.validate(TextDecoder.uuid))
    expect(Result.isOk(res)).toBe(false)
  })
})

describe('TextDecoder.email', () => {
  it('should succeed', () => {
    expect(pipe('john.doe@gmail.com', Decoder.validate(TextDecoder.email), Result.isOk)).toBe(true)
    expect(pipe('john@gmail.com', Decoder.validate(TextDecoder.email), Result.isOk)).toBe(true)
    expect(pipe('john@test.example.com', Decoder.validate(TextDecoder.email), Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe('john.doe', Decoder.validate(TextDecoder.email), Result.isKo)).toBe(true)
    expect(pipe('john.doe@gmail', Decoder.validate(TextDecoder.email), Result.isKo)).toBe(true)
    expect(pipe('@gmail.com', Decoder.validate(TextDecoder.email), Result.isKo)).toBe(true)
    expect(pipe('john.doe@.com', Decoder.validate(TextDecoder.email), Result.isKo)).toBe(true)
  })
})

describe('TextDecoder.nullable', () => {
  const decoder = pipe(TextDecoder.string, TextDecoder.nullable)
  it('should succeed', () => {
    expect(pipe('Test', Decoder.validate(decoder), Result.get)).toBe('Test')
    expect(pipe('', Decoder.validate(decoder), Result.get)).toBe(null)
    expect(pipe(null, Decoder.validate(decoder), Result.get)).toBe(null)
  })

  it('should fail', () => {
    expect(pipe(undefined, Decoder.validate(decoder), Result.isKo)).toBe(true)
  })
})

describe('TextDecoder.optional', () => {
  const decoder = pipe(TextDecoder.string, TextDecoder.optional)
  it('should succeed', () => {
    expect(pipe('Test', Decoder.validate(decoder), Result.get)).toBe('Test')
    expect(pipe('', Decoder.validate(decoder), Result.get)).toBe(undefined)
    expect(pipe(undefined, Decoder.validate(decoder), Result.get)).toBe(undefined)
  })

  it('should fail', () => {
    expect(pipe(null, Decoder.validate(decoder), Result.isKo)).toBe(true)
  })
})
