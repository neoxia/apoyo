import { IO, pipe } from '../src'

describe('IO.of', () => {
  it('should return a new IO', () => {
    const io = IO.of(5)
    expect(io()).toBe(5)
  })
})

describe('IO.reject', () => {
  it('should return a new throwing IO', () => {
    const io = IO.reject('error')
    expect(io).toThrow('error')
  })
})

describe('IO.run', () => {
  it('should run a IO', () => {
    const value = IO.run(() => {
      return 42
    })
    expect(value).toBe(42)
  })
})

describe('IO.map', () => {
  it('should map over a IO', () => {
    const value = pipe(
      IO.of(42),
      IO.map((a) => a + 1),
      IO.run
    )
    expect(value).toBe(43)
  })

  it('should not map over a throwing IO', () => {
    const io = pipe(
      IO.reject('error'),
      IO.map((a: number) => a + 1)
    )
    expect(io).toThrow('error')
  })
})

describe('IO.mapError', () => {
  it('should not map over a IO', () => {
    const value = pipe(
      IO.of(42),
      IO.mapError((a) => a + 1),
      IO.run
    )
    expect(value).toBe(42)
  })

  it('should map over a throwing IO', () => {
    const io = pipe(
      IO.reject('error'),
      IO.mapError((a: string) => `Test ${a}`)
    )
    expect(io).toThrow('Test error')
  })
})

describe('IO.chain', () => {
  it('should chain a IO', () => {
    const value = pipe(
      IO.of(42),
      IO.chain((a) => IO.of(a + 1)),
      IO.run
    )
    expect(value).toBe(43)
  })

  it('should not chain a throwing IO', () => {
    const io = pipe(
      IO.reject('error'),
      IO.chain((a: number) => IO.of(a + 1))
    )
    expect(io).toThrow('error')
  })
})
