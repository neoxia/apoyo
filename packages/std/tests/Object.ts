import { Obj, pipe } from '../src'

describe('Object.copy', () => {
  it('should shallow copy object', () => {
    const source = { firstName: 'John' }
    const res = Obj.copy(source)
    res.firstName = 'Smith'

    expect(source !== res).toBe(true)
    expect(res.firstName).toBe('Smith')
    expect(source.firstName).toBe('John')
  })
})

describe('Object.merge', () => {
  it('should merge types', () => {
    const res: { firstName: string; lastName: string } = Obj.merge({ firstName: 'John' }, { lastName: 'Doe' })

    expect(res).toEqual({
      firstName: 'John',
      lastName: 'Doe'
    })
  })
})

describe('Object.property', () => {
  it('should get property in object from path', () => {
    const path = 'user.profile.email'
    const res = pipe(
      {
        user: {
          profile: {
            email: 'john.doe@example.com'
          }
        }
      },
      Obj.property(path)
    )
    expect(res).toEqual('john.doe@example.com')
  })

  it('should return undefined if path does not exist', () => {
    const path = 'user.profile.email'
    const res = pipe(
      {
        user: {
          email: 'john.doe@example.com'
        }
      },
      Obj.property(path)
    )
    expect(res).toEqual(undefined)
  })

  it('should work with array elements', () => {
    const path = 'user.profiles.0.email'
    const res = pipe(
      {
        user: {
          profiles: [
            {
              email: 'john.doe@example.com'
            }
          ]
        }
      },
      Obj.property(path)
    )
    expect(res).toEqual('john.doe@example.com')
  })
})

describe('Object.omit', () => {
  it('should omit props', () => {
    const source = { firstName: 'John', lastName: 'Doe' }
    const res: {
      firstName: string
    } = pipe(source, Obj.omit(['lastName']))
    expect(res !== source).toBe(true)
    expect(res).toEqual({
      firstName: 'John'
    })
  })
})

describe('Object.pick', () => {
  it('should omit props', () => {
    const source = { firstName: 'John', lastName: 'Doe' }
    const res: {
      lastName: string
    } = pipe(source, Obj.pick(['lastName']))
    expect(res !== source).toBe(true)
    expect(res).toEqual({
      lastName: 'Doe'
    })
  })
})

describe('Object.compact', () => {
  it('should remove enumerable keys with undefined values', () => {
    const input: Partial<{ firstName: string; lastName: string }> = { firstName: 'John', lastName: undefined }
    const res = Obj.compact({ firstName: 'John' })

    expect(input).toEqual(res)
  })

  it('should keep symbols', () => {
    const sym = Symbol('test')
    const input: Partial<{ [sym]: boolean; firstName: string; lastName: string }> = {
      [sym]: true,
      firstName: 'John',
      lastName: undefined
    }
    const res = Obj.compact({ [sym]: true, firstName: 'John' })

    expect(input).toEqual(res)
  })
})
