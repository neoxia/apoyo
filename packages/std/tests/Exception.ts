import { Exception } from '../src'

describe('Exception', () => {
  it('should inherit from Error class', () => {
    const e = new Exception('test')

    expect(e).toBeInstanceOf(Exception)
    expect(e).toBeInstanceOf(Error)

    expect(e.name).toBe(Exception.name)
    expect(e.stack).toBeDefined()
  })

  it('should be extendable', () => {
    class AccessException extends Exception {}

    const e = new AccessException('test')

    expect(e).toBeInstanceOf(AccessException)
    expect(e).toBeInstanceOf(Exception)
    expect(e).toBeInstanceOf(Error)

    expect(e.name).toBe(AccessException.name)
    expect(e.stack).toBeDefined()
  })
})
