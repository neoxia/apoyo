import { pipe, Dict, isNull, or, isUndefined, Option, identity, Arr } from '../src'

describe('Dict.isEmpty', () => {
  it('should be true when empty', () => {
    expect(Dict.isEmpty({})).toBe(true)
  })

  it('should be false when not empty', () => {
    expect(
      Dict.isEmpty({
        firstName: 'John'
      })
    ).toBe(false)
  })
})

describe('Dict.isDict', () => {
  it('should be true when valid', () => {
    expect(Dict.isDict({})).toBe(true)
    expect(
      Dict.isDict({
        firstName: 'John'
      })
    ).toBe(true)
  })

  it('should be false when invalid', () => {
    expect(Dict.isDict('')).toBe(false)
    expect(Dict.isDict(undefined)).toBe(false)
    expect(Dict.isDict(null)).toBe(false)
  })
})

describe('Dict.mapIndexed', () => {
  it('should map with key', () => {
    const res = pipe(
      {
        firstName: 'John',
        lastName: 'Doe'
      },
      Dict.mapIndexed((_v, key) => key)
    )
    expect(res).toEqual({
      firstName: 'firstName',
      lastName: 'lastName'
    })
  })
})

describe('Dict.filter', () => {
  it('should filter out elements', () => {
    const props = new Set(['firstName', 'lastName'])
    const res = pipe(
      {
        firstName: 'John',
        lastName: null,
        gender: undefined
      },
      Dict.filter((_value, key) => props.has(key))
    )
    expect(res).toEqual({
      firstName: 'John',
      lastName: null
    })
  })

  it('should be called with value and key', () => {
    const res = pipe(
      {
        firstName: 'John',
        lastName: null,
        gender: undefined
      },
      Dict.filter((_, key) => key === 'lastName')
    )

    expect(res).toEqual({
      lastName: null
    })
  })

  it('should refine elements', () => {
    const res: Dict<string | null> = pipe(
      {
        firstName: 'John',
        lastName: null,
        gender: undefined
      },
      Dict.filter(Option.isSome)
    )
    expect(res).toEqual({
      firstName: 'John',
      lastName: null
    })
  })
})

describe('Dict.reject', () => {
  it('should reject elements matching the predicate', () => {
    const res: Dict<string> = pipe(
      {
        firstName: 'John',
        lastName: null,
        gender: undefined
      },
      Dict.reject(or(isUndefined, isNull))
    )

    expect(res).toEqual({
      firstName: 'John'
    })
  })

  it('should be called with value and key', () => {
    const res = pipe(
      {
        firstName: 'John',
        lastName: null,
        gender: undefined
      },
      Dict.reject((_, key) => key === 'lastName')
    )

    expect(res).toEqual({
      firstName: 'John',
      gender: undefined
    })
  })
})

describe('Dict.filterMap', () => {
  it('should return expected results', () => {
    const res: Dict<string | null> = pipe(
      {
        firstName: 'John',
        lastName: null,
        gender: undefined
      },
      Dict.filterMap(identity)
    )

    expect(res).toEqual({
      firstName: 'John',
      lastName: null
    })
  })
})

describe('Dict.compact', () => {
  it('should return expected results', () => {
    const res: Dict<string | null> = pipe(
      {
        firstName: 'John',
        lastName: null,
        gender: undefined
      },
      Dict.compact
    )

    expect(res).toEqual({
      firstName: 'John',
      lastName: null
    })
  })
})

describe('Dict.fromPairs', () => {
  it('should create a dict from pairs', () => {
    interface Todo {
      id: number
      title: string
    }
    const todos: Todo[] = [
      {
        id: 1,
        title: 'test'
      },
      {
        id: 2,
        title: 'test2'
      }
    ]

    const res: Dict<Todo> = pipe(
      todos,
      Arr.map((todo) => [todo.id, todo] as const),
      Dict.fromPairs
    )

    expect(res).toEqual({
      1: todos[0],
      2: todos[1]
    })
  })
})

describe('Dict.concat', () => {
  it('should concat dicts correctly', () => {
    const merged = pipe(
      {
        firstName: 'John',
        lastName: 'Doe'
      },
      Dict.concat({
        lastName: 'Smith',
        gender: 'M'
      })
    )
    expect(merged).toEqual({
      firstName: 'John',
      lastName: 'Smith',
      gender: 'M'
    })
  })
})

describe('Dict.union', () => {
  it('should merge dicts correctly', () => {
    const merged = pipe(
      {
        firstName: 'John',
        lastName: 'Doe'
      },
      Dict.union({
        lastName: 'Smith',
        gender: 'M'
      })
    )
    expect(merged).toEqual({
      firstName: 'John',
      lastName: 'Doe',
      gender: 'M'
    })
  })
})

describe('Dict.intersect', () => {
  it('should return expected results', () => {
    const intersection = pipe(
      {
        firstName: 'John',
        lastName: 'Doe'
      },
      Dict.intersect({
        lastName: 'Smith',
        gender: 'M'
      })
    )
    expect(intersection).toEqual({
      lastName: 'Doe'
    })
  })
})

describe('Dict.difference', () => {
  it('should return expected results', () => {
    const diff = pipe(
      {
        firstName: 'John',
        lastName: 'Doe'
      },
      Dict.difference({
        lastName: 'Smith',
        gender: 'M'
      })
    )
    expect(diff).toEqual({
      firstName: 'John'
    })
  })
})
