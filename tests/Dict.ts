import { pipe, Dict, isNull, or, isUndefined, Option, identity } from '../src'

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
