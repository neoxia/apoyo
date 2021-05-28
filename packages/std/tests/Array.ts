import { pipe, Arr, first, identity, Result, Ord } from '../src'

describe('Array.head', () => {
  it('should return first value when not empty', () => {
    const a = [1, 2, 2, 3, 5]
    const b = Arr.head(a)
    const expected = 1
    expect(b).toEqual(expected)
  })
  it('should return undefined when empty', () => {
    const a: number[] = []
    const b = Arr.head(a)
    const expected = undefined
    expect(b).toEqual(expected)
  })
})

describe('Array.last', () => {
  it('should return last value when not empty', () => {
    const a = [1, 2, 2, 3, 5]
    const b = Arr.last(a)
    const expected = 5
    expect(b).toEqual(expected)
  })
  it('should return undefined when empty', () => {
    const a: number[] = []
    const b = Arr.last(a)
    const expected = undefined
    expect(b).toEqual(expected)
  })
})

describe('Array.reduce', () => {
  const a = [1, 2, 3]
  const b = pipe(
    a,
    Arr.reduce((a, b) => a + b, 0)
  )
  const expected = 6

  it('should return expected values', () => {
    expect(b).toBe(expected)
  })
})

describe('Array.map', () => {
  const a = [1, 2, 3]
  const b = pipe(
    a,
    Arr.map((a) => a + 1)
  )
  const expected = [2, 3, 4]

  it('should create a new array', () => {
    expect(a).not.toBe(b)
  })

  it('should return expected values', () => {
    expect(b).toEqual(expected)
  })
})

describe('Array.mapIndexed', () => {
  const a = [1, 2, 3]
  const b = pipe(
    a,
    Arr.mapIndexed((value, index, arr) => ({ index, value, arr }))
  )
  const expected = [
    { index: 0, value: 1, arr: a },
    { index: 1, value: 2, arr: a },
    { index: 2, value: 3, arr: a }
  ]

  it('should create a new array', () => {
    expect(a).not.toBe(b)
  })

  it('should return expected values', () => {
    expect(b).toEqual(expected)
  })
})

describe('Array.concat', () => {
  const a = [1, 2, 3]

  it('should concat simple value', () => {
    expect(pipe(a, Arr.concat(4))).toEqual([1, 2, 3, 4])
  })
  it('should concat another array', () => {
    expect(pipe(a, Arr.concat([4, 5]))).toEqual([1, 2, 3, 4, 5])
  })
})

describe('Array.flatten', () => {
  const a = [
    [
      [1, 2],
      [3, 4]
    ],
    [[5, 6]]
  ]
  const b = [
    [1, 2],
    [3, 4],
    [5, 6]
  ]
  const c = [1, 2, 3, 4, 5, 6]

  it('should flatten array', () => {
    expect(pipe(b, Arr.flatten)).toEqual(c)
  })

  it('should flatten only one depth', () => {
    expect(pipe(a, Arr.flatten)).toEqual(b)
  })
})

describe('Array.chain', () => {
  const a = [1, 2, 3]
  const b = pipe(
    a,
    Arr.chain((a) => [a, a])
  )
  const expected = [1, 1, 2, 2, 3, 3]

  it('should return expected values', () => {
    expect(b).toEqual(expected)
  })
})

describe('Array.chainIndexed', () => {
  const a = [1, 2, 3]
  const b = pipe(
    a,
    Arr.chainIndexed((value, index, arr) => [{ index, value, arr }])
  )
  const expected = [
    { index: 0, value: 1, arr: a },
    { index: 1, value: 2, arr: a },
    { index: 2, value: 3, arr: a }
  ]

  it('should create a new array', () => {
    expect(a).not.toBe(b)
  })

  it('should return expected values', () => {
    expect(b).toEqual(expected)
  })
})

describe('Array.filter', () => {
  const a = [1, 4, 2, 3, 5]
  const b = pipe(
    a,
    Arr.filter((a) => a > 2)
  )
  const expected = [4, 3, 5]

  it('should return expected values', () => {
    expect(b).toEqual(expected)
  })
})

describe('Array.reject', () => {
  const a = [1, 4, 2, 3, 5]
  const b = pipe(
    a,
    Arr.reject((a) => a > 2)
  )
  const expected = [1, 2]

  it('should return expected values', () => {
    expect(b).toEqual(expected)
  })
})

describe('Array.filterMap', () => {
  const a = [1, 4, 2, 3, 5]
  const b = pipe(
    a,
    Arr.filterMap((a) => (a > 2 ? a : undefined))
  )
  const expected = [4, 3, 5]

  it('should return expected values', () => {
    expect(b).toEqual(expected)
  })
})

describe('Array.compact', () => {
  it('should return expected values', () => {
    const a = [1, 4, undefined, null, 2, 3, 5]
    const b: Array<number | null> = pipe(a, Arr.compact)
    const expected = [1, 4, null, 2, 3, 5]
    expect(b).toEqual(expected)
  })
})

describe('Array.partition', () => {
  const a = [1, 4, 2, 3, 5]
  const b = pipe(
    a,
    Arr.partition((a) => a > 2)
  )
  const expected = [
    [4, 3, 5],
    [1, 2]
  ]

  it('should return expected values', () => {
    expect(b).toEqual(expected)
  })
})

describe('Array.partitionMap', () => {
  const a = [1, 4, 2, 3, 5]
  const b = pipe(
    a,
    Arr.partitionMap((a) => (a > 2 ? Result.ok(a) : Result.ko(a)))
  )
  const expected = [
    [4, 3, 5],
    [1, 2]
  ]

  it('should return expected values', () => {
    expect(b).toEqual(expected)
  })
})

describe('Array.groupBy', () => {
  it('should return expected values', () => {
    const a = [1, 2, 2, 3, 5, 5, 2, 1, 4]
    const b = pipe(
      a,
      Arr.groupBy((a) => a % 2)
    )
    const expected = {
      0: [2, 2, 2, 4],
      1: [1, 3, 5, 5, 1]
    }

    expect(b).toEqual(expected)
  })
})

describe('Array.indexBy', () => {
  it('should return expected values with first', () => {
    const a = [
      {
        id: 1,
        name: 'A'
      },
      {
        id: 2,
        name: 'B'
      },
      {
        id: 1,
        name: 'C'
      }
    ]

    const b = pipe(
      a,
      Arr.indexBy((a) => a.id, first)
    )
    const expected = {
      1: a[0],
      2: a[1]
    }

    expect(b).toEqual(expected)
  })

  it('should return expected values with last', () => {
    const a = [
      {
        id: 1,
        name: 'A'
      },
      {
        id: 2,
        name: 'B'
      },
      {
        id: 1,
        name: 'C'
      }
    ]

    const b = pipe(
      a,
      Arr.indexBy((a) => a.id)
    )
    const expected = {
      1: a[2],
      2: a[1]
    }

    expect(b).toEqual(expected)
  })
})

describe('Array.countBy', () => {
  it('should return expected values', () => {
    const a = [1, 2, 2, 3, 5, 5, 2, 1, 4]
    const b = pipe(a, Arr.countBy(identity))
    const expected = {
      1: 2,
      2: 3,
      3: 1,
      5: 2,
      4: 1
    }

    expect(b).toEqual(expected)
  })
})

describe('Array.chunksOf', () => {
  it('should return expected values', () => {
    const a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const b = pipe(a, Arr.chunksOf(4))
    const expected = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10]
    ]

    expect(b).toEqual(expected)
  })

  it('should not return empty chunk', () => {
    const a: number[] = []
    const b = pipe(a, Arr.chunksOf(4))
    const expected: number[][] = []

    expect(b).toEqual(expected)
  })

  it('should not create additional chunks on exact length', () => {
    const a = [1, 2, 3, 4, 5, 6, 7, 8]
    const b = pipe(a, Arr.chunksOf(4))
    const expected = [
      [1, 2, 3, 4],
      [5, 6, 7, 8]
    ]

    expect(b).toEqual(expected)
  })
})

describe('Array.uniq', () => {
  it('should return expected values', () => {
    const a = [1, 2, 2, 3, 5, 5, 2, 1, 4]
    const b = pipe(a, Arr.uniq)
    const expected = [1, 2, 3, 5, 4]
    expect(b).toEqual(expected)
  })
})

describe('Array.uniqBy', () => {
  it('should return expected values', () => {
    const a = [1, 2, 2, 3, 5, 5, 2, 1, 4]
    const b = pipe(a, Arr.uniqBy(identity))
    const expected = [1, 2, 3, 5, 4].sort()
    expect(b).toEqual(expected)
  })
})

describe('Array.union', () => {
  it('should return expected values', () => {
    const a = [1, 2, 2, 3, 5]
    const b = [5, 2, 1, 4]
    const c = pipe(a, Arr.union(identity, b))
    const expected = [1, 2, 3, 5, 4].sort()
    expect(c).toEqual(expected)
  })
})

describe('Array.intersection', () => {
  it('should return expected values', () => {
    const a = [1, 2, 2, 3, 5]
    const b = [5, 2, 1, 4]
    const c = pipe(a, Arr.intersect(identity, b))
    const expected = [1, 2, 5]
    expect(c).toEqual(expected)
  })
})

describe('Array.difference', () => {
  it('should return expected values', () => {
    const a = [1, 2, 2, 3, 5]
    const b = [5, 2, 1, 4]
    const c = pipe(a, Arr.difference(identity, b))
    const expected = [3]
    expect(c).toEqual(expected)
  })
})

describe('Array.min', () => {
  it('should return smallest', () => {
    expect(pipe([5, 2, 8, 1, 9], Arr.min(Ord.number))).toBe(1)
  })

  it('should return undefined on empty array', () => {
    expect(pipe([], Arr.min(Ord.number))).toBe(undefined)
  })
})

describe('Array.max', () => {
  it('should return greatest', () => {
    expect(pipe([5, 2, 8, 1, 9], Arr.max(Ord.number))).toBe(9)
  })

  it('should return undefined on empty array', () => {
    expect(pipe([], Arr.max(Ord.number))).toBe(undefined)
  })
})

describe('Array.reverse', () => {
  it('should work', () => {
    const a = [1, 2, 3, 4]
    const b = pipe(a, Arr.reverse)
    expect(a).toEqual([1, 2, 3, 4])
    expect(b).toEqual([4, 3, 2, 1])
  })
})

describe('Array.slice', () => {
  it('should work', () => {
    const a = [1, 2, 3, 4]
    const b = pipe(a, Arr.slice(1, 2))
    expect(a).toEqual([1, 2, 3, 4])
    expect(b).toEqual([2])
  })
})

describe('Array.take', () => {
  it('should work', () => {
    const a = [1, 2, 3, 4]
    const b = pipe(a, Arr.take(2))
    expect(a).toEqual([1, 2, 3, 4])
    expect(b).toEqual([1, 2])
  })
})

describe('Array.skip', () => {
  it('should work', () => {
    const a = [1, 2, 3, 4]
    const b = pipe(a, Arr.skip(2))
    expect(a).toEqual([1, 2, 3, 4])
    expect(b).toEqual([3, 4])
  })
})

describe('Array.sort', () => {
  it('should work', () => {
    const a = [1, 9, 3, 2, 7, 3, 4]
    const aCopy = a.slice()
    const b = pipe(a, Arr.sort(Ord.number))
    expect(a).toEqual(aCopy)
    expect(b).toEqual([1, 2, 3, 3, 4, 7, 9])
  })

  // JS sort always puts undefined at last AFTER the sort... which breaks specific order inversions if not handled correctly
  it('should work with undefined values', () => {
    const a = [1, undefined, 9, 3, undefined, 2, 7, 3, 4]
    const aCopy = a.slice()

    const ordArr = pipe(Ord.number, Ord.option, Ord.inverse)
    const b = pipe(a, Arr.sort(ordArr))
    expect(a).toEqual(aCopy)
    expect(b).toEqual([undefined, undefined, 9, 7, 4, 3, 3, 2, 1])
  })
})

describe('Array.sum', () => {
  it('should work', () => {
    const a = [1, 2, 3, 4]
    const b = pipe(a, Arr.sum)
    expect(b).toEqual(10)
  })
})

describe('Array.sumBy', () => {
  it('should work', () => {
    const a = [1, 2, 3, 4]
    const b = pipe(a, Arr.sumBy(identity))
    expect(b).toEqual(10)
  })
})
