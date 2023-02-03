import { isNull, not, Option, pipe, throwError } from '../src'

describe('Option.isSome', () => {
  it('should be true for any other value than undefined', () => {
    expect(pipe('test', Option.isSome)).toBe(true)
    expect(pipe('', Option.isSome)).toBe(true)
    expect(pipe(0, Option.isSome)).toBe(true)
    expect(pipe(false, Option.isSome)).toBe(true)
    expect(pipe(null, Option.isSome)).toBe(true)
  })

  it('should be false for undefined', () => {
    expect(pipe(undefined, Option.isSome)).toBe(false)
  })
})

describe('Option.isNone', () => {
  it('should be false for any other value than undefined', () => {
    expect(pipe('test', Option.isNone)).toBe(false)
    expect(pipe('', Option.isNone)).toBe(false)
    expect(pipe(0, Option.isNone)).toBe(false)
    expect(pipe(false, Option.isNone)).toBe(false)
    expect(pipe(null, Option.isNone)).toBe(false)
  })

  it('should be true for undefined', () => {
    expect(pipe(undefined, Option.isNone)).toBe(true)
  })
})

describe('Option.fromNullable', () => {
  it('should change null to undefined', () => {
    expect(pipe(null, Option.fromNullable)).toBe(undefined)
  })
  it('should not change any other value', () => {
    expect(pipe(42, Option.fromNullable)).toBe(42)
  })
})

describe('Option.fromFalsy', () => {
  it('should change falsy to undefined', () => {
    expect(pipe(null, Option.fromFalsy)).toBe(undefined)
    expect(pipe('', Option.fromFalsy)).toBe(undefined)
    expect(pipe(0, Option.fromFalsy)).toBe(undefined)
    expect(pipe(false, Option.fromFalsy)).toBe(undefined)
    expect(pipe(undefined, Option.fromFalsy)).toBe(undefined)
  })
  it('should not change any other value', () => {
    expect(pipe(42, Option.fromFalsy)).toBe(42)
  })
})

describe('Option.fromString', () => {
  it('should change empty string to undefined', () => {
    expect(pipe('', Option.fromString)).toBe(undefined)
  })
  it('should not change any other value', () => {
    expect(pipe('a', Option.fromString)).toBe('a')
  })
})

describe('Option.fromNumber', () => {
  it('should change NaN to undefined', () => {
    expect(pipe(NaN, Option.fromNumber)).toBe(undefined)
  })
  it('should not change any other number', () => {
    expect(pipe(42, Option.fromNumber)).toBe(42)
  })
})

describe('Option.fromDate', () => {
  it('should change invalid date to undefined', () => {
    expect(pipe(new Date('test'), Option.fromDate)).toBe(undefined)
  })
  it('should not change any other date', () => {
    expect(pipe(new Date('2020'), Option.fromDate)).toEqual(new Date('2020'))
  })
})

describe('Option.map', () => {
  it('should map over some values', () => {
    const a = 42 as Option<number>
    const result = pipe(
      a,
      Option.map((a) => a + 1)
    )
    expect(result).toBe(43)
  })

  it('should not map over undefined values', () => {
    const a = undefined as Option<number>
    const result = pipe(
      a,
      Option.map((a) => a + 1)
    )
    expect(result).toBe(undefined)
  })
})

describe('Option.filter', () => {
  it('should return value when predicate is true', () => {
    const result = pipe(
      42,
      Option.filter((a) => a >= 10)
    )
    expect(result).toBe(42)
  })

  it('should return undefined when predicate is false', () => {
    const result = pipe(
      42,
      Option.filter((a) => a < 10)
    )
    expect(result).toBe(undefined)
  })

  it('should refine value when true', () => {
    const a = 10 as number | null
    const result = pipe(a, Option.filter(not(isNull)))
    expect(result).toBe(10)
  })

  it('should return undefined when refinement is false', () => {
    const a = null as number | null
    const result = pipe(a, Option.filter(not(isNull)))
    expect(result).toBe(undefined)
  })
})

describe('Option.reject', () => {
  it('should return value when predicate is false', () => {
    const result = pipe(
      42,
      Option.reject((a) => a < 10)
    )
    expect(result).toBe(42)
  })

  it('should return undefined when predicate is true', () => {
    const result = pipe(
      42,
      Option.reject((a) => a >= 10)
    )
    expect(result).toBe(undefined)
  })

  it('should exclude refined type when false', () => {
    const a = 10 as number | null
    const result = pipe(a, Option.reject(isNull))
    expect(result).toBe(10)
  })

  it('should return undefined when false', () => {
    const a = null as number | null
    const result = pipe(a, Option.reject(isNull))
    expect(result).toBe(undefined)
  })
})

describe('Option.get', () => {
  it('should return value if value is not undefined', () => {
    const res: number = pipe(42, Option.get(10))
    expect(res).toBe(42)
  })

  it('should return default if value is undefined', () => {
    const res: number = pipe(undefined, Option.get(10))
    expect(res).toBe(10)
  })

  it('should call default function if value is undefined', () => {
    const res: number = pipe(
      undefined,
      Option.get(() => 10)
    )
    expect(res).toBe(10)
  })

  it('should call default function if value is undefined', () => {
    expect.assertions(1)

    try {
      pipe(
        undefined,
        Option.get(() => throwError(10))
      )
      throw new Error('Should throw')
    } catch (err) {
      expect(err).toBe(10)
    }
  })
})

describe('Option.throwError', () => {
  it('should throw if undefined', () => {
    expect(() => pipe(undefined, Option.throwError(new Error('Undefined variable')))).toThrowError('Undefined variable')
    expect(() =>
      pipe(
        undefined,
        Option.throwError(() => new Error('Undefined variable'))
      )
    ).toThrowError('Undefined variable')
  })
  it('should return value if defined', () => {
    expect(pipe(0, Option.throwError(new Error('Undefined variable')))).toBe(0)
  })
})
