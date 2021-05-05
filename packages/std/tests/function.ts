import { add, Arr, Dict, identity, not, pipe, throwError, tuple, tupled, untupled } from '../src'

describe('add', () => {
  it('should addition 2 numbers', () => {
    expect(add(1, 3)).toBe(4)
  })

  it('should be curryable', () => {
    const res = pipe(1, add(2))
    expect(res).toBe(3)
  })
})

describe('identity', () => {
  it('should return the same value', () => {
    const a = {}
    expect(pipe(a, identity)).toBe(a)
  })
})

describe('not', () => {
  it('should inverse predicate', () => {
    const isPositive = (a: number) => a >= 0
    expect(pipe(42, isPositive)).toBe(true)
    expect(pipe(42, not(isPositive))).toBe(false)
  })

  it('should work with Arr.predicate', () => {
    // @ts-expect-error Should not match Arr.Predicate
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const arrPredErr: Arr.Predicate<number> = not((a: number, _key: string) => a % 2 === 0)

    const arrPred: Arr.Predicate<number> = not((_a: number, index: number) => index % 2 === 0)
    expect(arrPred(1, 1)).toBe(true)
  })

  it('should work with Dict.predicate', () => {
    // @ts-expect-error Should not match Arr.Predicate
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const dictPredErr: Dict.Predicate<number> = not((a: number, _index: number) => a % 2 === 0)

    const dictPred: Dict.Predicate<number> = not((_a: number, key: string) => key === 'key')
    expect(dictPred(1, 'notkey')).toBe(true)
  })
})

describe('tuple', () => {
  it('should create tuple from arguments', () => {
    expect(tuple(1, 2, 3)).toEqual([1, 2, 3])
  })
})

describe('tupled', () => {
  it('should create tupled version of function', () => {
    expect(
      pipe(
        [1, 2],
        tupled((a, b) => a + b)
      )
    ).toBe(3)
  })
})

describe('untupled', () => {
  it('should create tupled version of function', () => {
    const fn = untupled(([a, b]: [number, number]) => a + b)
    expect(fn(1, 2)).toBe(3)
  })
})

describe('throwError', () => {
  it('should throw', () => {
    expect(() => throwError('error')).toThrow('error')
  })
})
