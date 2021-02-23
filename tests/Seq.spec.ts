import { pipe, Seq } from '../src'

class TestIterator implements Iterable<{ foo: string }> {
  constructor(public components: Array<{ foo: string }>) {}

  [Symbol.iterator]() {
    let pointer = 0
    const components = this.components

    return {
      next(): IteratorResult<{ foo: string }> {
        if (pointer < components.length) {
          return {
            done: false,
            value: components[pointer++]
          }
        } else {
          return {
            done: true,
            value: null
          }
        }
      }
    }
  }
}

describe('Seq.map', () => {
  const a = new TestIterator([{ foo: 'bar' }, { foo: 'baz' }, { foo: 'bazinga' }])
  const b = pipe(
    a,
    Seq.map((a) => a.foo + '!')
  )
  const expected = ['bar!', 'baz!', 'bazinga!']

  it('should create a new iterable', () => {
    expect(a).not.toBe(b)
  })

  it('should return expected values', () => {
    let i = 0
    for (const value of b) {
      expect(value).toEqual(expected[i])
      ++i
    }
  })
})

describe('Seq.filter', () => {
  const a = new TestIterator([{ foo: 'bar' }, { foo: 'baz' }, { foo: 'bazinga' }])
  const b = pipe(
    a,
    Seq.filter((a) => a.foo.length === 3)
  )
  const expected = [{ foo: 'bar' }, { foo: 'baz' }]

  it('should create a new iterable', () => {
    expect(a).not.toBe(b)
  })

  it('should return expected values', () => {
    let i = 0
    for (const value of b) {
      expect(value).toEqual(expected[i])
      ++i
    }
  })
})

describe('Seq.uniq', () => {
  const a = new TestIterator([
    { foo: 'bar' },
    { foo: 'baz' },
    { foo: 'bar' },
    { foo: 'bazinga' },
    { foo: 'bar' },
    { foo: 'bazinga' },
    { foo: 'baz' }
  ])
  const b = pipe(
    a,
    Seq.uniq((a) => a.foo)
  )
  const expected = [{ foo: 'bar' }, { foo: 'baz' }, { foo: 'bazinga' }]

  it('should create a new iterable', () => {
    expect(a).not.toBe(b)
  })

  it('should return expected values', () => {
    let i = 0
    for (const value of b) {
      expect(value).toEqual(expected[i])
      ++i
    }
  })
})

describe('Seq.slice', () => {
  const a = new TestIterator([
    { foo: 'zero' },
    { foo: 'one' },
    { foo: 'two' },
    { foo: 'three' },
    { foo: 'for' },
    { foo: 'five' },
    { foo: 'six' }
  ])
  const b = pipe(a, Seq.slice())
  const c = pipe(a, Seq.slice(2))
  const d = pipe(a, Seq.slice(2, 4))
  const e = pipe(a, Seq.slice(undefined, 4))

  it('should create a new iterable', () => {
    expect(a).not.toBe(b)
  })

  it('should return expected values [no index]', () => {
    const expected = [
      { foo: 'zero' },
      { foo: 'one' },
      { foo: 'two' },
      { foo: 'three' },
      { foo: 'for' },
      { foo: 'five' },
      { foo: 'six' }
    ]
    let i = 0
    for (const value of b) {
      expect(value).toEqual(expected[i])
      ++i
    }
  })

  it('should return expected values [just start]', () => {
    const expected = [{ foo: 'two' }, { foo: 'three' }, { foo: 'for' }, { foo: 'five' }, { foo: 'six' }]
    let i = 0
    for (const value of c) {
      expect(value).toEqual(expected[i])
      ++i
    }
  })

  it('should return expected values [start + end]', () => {
    const expected = [{ foo: 'two' }, { foo: 'three' }]
    let i = 0
    for (const value of d) {
      expect(value).toEqual(expected[i])
      ++i
    }
  })

  it('should return expected values [just end]', () => {
    const expected = [{ foo: 'zero' }, { foo: 'one' }, { foo: 'two' }, { foo: 'three' }]
    let i = 0
    for (const value of e) {
      expect(value).toEqual(expected[i])
      ++i
    }
  })
})

describe('Seq.take', () => {
  const a = new TestIterator([
    { foo: 'zero' },
    { foo: 'one' },
    { foo: 'two' },
    { foo: 'three' },
    { foo: 'for' },
    { foo: 'five' },
    { foo: 'six' }
  ])
  const b = pipe(a, Seq.take(3))
  it('should create a new iterable', () => {
    expect(a).not.toBe(b)
  })

  it('should return expected values [no index]', () => {
    const expected = [{ foo: 'zero' }, { foo: 'one' }, { foo: 'two' }]
    let i = 0
    for (const value of b) {
      expect(value).toEqual(expected[i])
      ++i
    }
  })
})

describe('Seq.skip', () => {
  const a = new TestIterator([
    { foo: 'zero' },
    { foo: 'one' },
    { foo: 'two' },
    { foo: 'three' },
    { foo: 'for' },
    { foo: 'five' },
    { foo: 'six' }
  ])
  const b = pipe(a, Seq.skip(2))

  it('should create a new iterable', () => {
    expect(a).not.toBe(b)
  })

  it('should return expected values [no index]', () => {
    const expected = [{ foo: 'two' }, { foo: 'three' }, { foo: 'for' }, { foo: 'five' }, { foo: 'six' }]
    let i = 0
    for (const value of b) {
      expect(value).toEqual(expected[i])
      ++i
    }
  })
})

describe('Seq.head', () => {
  const a = new TestIterator([
    { foo: 'zero' },
    { foo: 'one' },
    { foo: 'two' },
    { foo: 'three' },
    { foo: 'for' },
    { foo: 'five' },
    { foo: 'six' }
  ])
  const empty = new TestIterator([])
  const b = Seq.head(a)

  it('should return expected values [defined]', () => {
    expect(b).toEqual({ foo: 'zero' })
  })
  it('should return expected values [undefined]', () => {
    expect(Seq.head(empty)).toBe(undefined)
  })
})

describe('Seq.last', () => {
  const a = new TestIterator([
    { foo: 'zero' },
    { foo: 'one' },
    { foo: 'two' },
    { foo: 'three' },
    { foo: 'for' },
    { foo: 'five' },
    { foo: 'six' }
  ])
  const empty = new TestIterator([])
  const b = Seq.last(a)

  it('should return expected values [defined]', () => {
    expect(b).toEqual({ foo: 'six' })
  })
  it('should return expected values [undefined]', () => {
    expect(Seq.last(empty)).toBe(undefined)
  })
})

describe('Seq.toArray', () => {
  const a = new TestIterator([{ foo: 'bar' }, { foo: 'baz' }, { foo: 'bazinga' }])
  const b = Seq.toArray(a)
  const expected = [{ foo: 'bar' }, { foo: 'baz' }, { foo: 'bazinga' }]

  it('should create a new iterable', () => {
    expect(a).not.toBe(b)
  })

  it('should return expected values', () => {
    expect(b).toEqual(expected)
  })
})

describe('Seq.range', () => {
  const b = Seq.range(-3, 3)
  const c = Seq.range(-9, 9, 3)

  it('should return expected values [default step]', () => {
    const expected = [-3, -2, -1, 0, 1, 2]
    let i = 0
    for (const item of b) {
      expect(item).toBe(expected[i])
      i++
    }
  })
  it('should return expected values [defined step]', () => {
    const expected = [-9, -6, -3, 0, 3, 6]
    let i = 0
    for (const item of c) {
      expect(item).toBe(expected[i])
      i++
    }
  })
})
