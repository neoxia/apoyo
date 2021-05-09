import { pipe, Result } from '@apoyo/std'
import { TextDecoder } from '../src'

describe('TextDecoder.string', () => {
  it('should succeed', () => {
    expect(pipe('Test', TextDecoder.string, Result.get)).toBe('Test')
    expect(pipe('', TextDecoder.string, Result.get)).toBe('')
  })

  it('should fail', () => {
    expect(pipe(42, TextDecoder.string, Result.isKo)).toBe(true)
    expect(pipe(undefined, TextDecoder.string, Result.isKo)).toBe(true)
    expect(pipe(null, TextDecoder.string, Result.isKo)).toBe(true)
  })
})

describe('TextDecoder.min', () => {
  const decoder = pipe(TextDecoder.string, TextDecoder.min(1))
  it('should succeed', () => {
    const res = decoder('I')
    expect(Result.isOk(res)).toBe(true)
  })

  it('should fail', () => {
    const res = decoder('')
    expect(Result.isKo(res)).toBe(true)
  })
})

describe('TextDecoder.max', () => {
  const decoder = pipe(TextDecoder.string, TextDecoder.max(5))
  it('should succeed', () => {
    const res = decoder('Hello')
    expect(Result.isOk(res)).toBe(true)
  })

  it('should fail', () => {
    const res = decoder('Hello!')
    expect(Result.isKo(res)).toBe(true)
  })
})

describe('TextDecoder.varchar', () => {
  const decoder = pipe(TextDecoder.varchar(1, 5))
  it('should succeed', () => {
    const res = decoder('Hello')
    expect(Result.isOk(res)).toBe(true)
  })

  it('should fail as under minimum', () => {
    const res = decoder('')
    expect(Result.isKo(res)).toBe(true)
  })

  it('should fail as above maximum', () => {
    const res = decoder('Hello world')
    expect(Result.isKo(res)).toBe(true)
  })
})

describe('TextDecoder.trim', () => {
  it('should succeed', () => {
    const decoder = pipe(TextDecoder.string, TextDecoder.trim, TextDecoder.between(1, 5))
    const res = decoder('  Hello  ')
    expect(Result.isOk(res)).toBe(true)
  })

  it('should fail as applied after character verification', () => {
    const decoder = pipe(TextDecoder.varchar(1, 5), TextDecoder.trim)
    const res = decoder('  Hello  ')
    expect(Result.isKo(res)).toBe(true)
  })
})

describe('TextDecoder.uuid', () => {
  it('should succeed', () => {
    const res = TextDecoder.uuid('393963d6-ec11-42df-a33f-dd027afe8f74')
    expect(Result.isOk(res)).toBe(true)
  })

  it('should fail', () => {
    const res = TextDecoder.uuid('xxxx-xxxx-xxxx-xxxx-xxxx')
    expect(Result.isOk(res)).toBe(false)
  })
})

describe('TextDecoder.email', () => {
  it('should succeed', () => {
    expect(pipe('john.doe@gmail.com', TextDecoder.email, Result.isOk)).toBe(true)
    expect(pipe('john@gmail.com', TextDecoder.email, Result.isOk)).toBe(true)
    expect(pipe('john@test.example.com', TextDecoder.email, Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe('john.doe', TextDecoder.email, Result.isKo)).toBe(true)
    expect(pipe('john.doe@gmail', TextDecoder.email, Result.isKo)).toBe(true)
    expect(pipe('@gmail.com', TextDecoder.email, Result.isKo)).toBe(true)
    expect(pipe('john.doe@.com', TextDecoder.email, Result.isKo)).toBe(true)
  })
})

describe('TextDecoder.nullable', () => {
  const decoder = pipe(TextDecoder.string, TextDecoder.nullable)
  it('should succeed', () => {
    expect(pipe('Test', decoder, Result.get)).toBe('Test')
    expect(pipe('', decoder, Result.get)).toBe(null)
    expect(pipe(null, decoder, Result.get)).toBe(null)
  })

  it('should fail', () => {
    expect(pipe(undefined, decoder, Result.isKo)).toBe(true)
  })
})

describe('TextDecoder.optional', () => {
  const decoder = pipe(TextDecoder.string, TextDecoder.optional)
  it('should succeed', () => {
    expect(pipe('Test', decoder, Result.get)).toBe('Test')
    expect(pipe('', decoder, Result.get)).toBe(undefined)
    expect(pipe(undefined, decoder, Result.get)).toBe(undefined)
  })

  it('should fail', () => {
    expect(pipe(null, decoder, Result.isKo)).toBe(true)
  })
})
