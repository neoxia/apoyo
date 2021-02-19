import { pipe, Dict } from '../src'

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
