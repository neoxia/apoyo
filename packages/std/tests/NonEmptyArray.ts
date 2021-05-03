import { NonEmptyArray, Option, Ord, pipe } from '../src'

describe('NonEmptyArray.fromArray', () => {
  it('should return NonEmptyArray', () => {
    const a: NonEmptyArray<number> = NonEmptyArray.fromArray([1, 2, 3])
    expect(a).toEqual([1, 2, 3])
  })

  it('should return NonEmptyArray', () => {
    const a: number[] = [1, 2, 3]
    const b: Option<NonEmptyArray<number>> = NonEmptyArray.fromArray(a)
    expect(b).toEqual([1, 2, 3])
  })

  it('should return undefined', () => {
    const a: Option<NonEmptyArray<number>> = NonEmptyArray.fromArray([])
    expect(a).toEqual(undefined)
  })
})

describe('NonEmptyArray.head', () => {
  it('should return first value', () => {
    const a: number = NonEmptyArray.head([1, 2, 3])
    expect(a).toEqual(1)
  })
})

describe('NonEmptyArray.last', () => {
  it('should return last value', () => {
    const a: number = NonEmptyArray.last([1, 2, 3])
    expect(a).toEqual(3)
  })
})

describe('NonEmptyArray.mapIndexed', () => {
  it('should map over array with index', () => {
    const res: NonEmptyArray<number> = pipe(
      [1, 2, 3],
      NonEmptyArray.mapIndexed((_v, index) => index)
    )
    expect(res).toEqual([0, 1, 2])
  })
})

describe('NonEmptyArray.map', () => {
  it('should map over array without index', () => {
    const res: NonEmptyArray<number> = pipe(
      [1, 2, 3],
      NonEmptyArray.map((value) => value * 2)
    )
    expect(res).toEqual([2, 4, 6])
  })
})

describe('NonEmptyArray.min', () => {
  it('should return smallest', () => {
    const res = pipe([1, 2, 3, 0, 6], NonEmptyArray.min(Ord.number))
    expect(res).toEqual(0)
  })
})

describe('NonEmptyArray.max', () => {
  it('should return greatest', () => {
    const res = pipe([1, 2, 3, 0, 6], NonEmptyArray.max(Ord.number))
    expect(res).toEqual(6)
  })
})
