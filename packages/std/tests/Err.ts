import { Err, Exception, Obj, pipe } from '../src'

describe('Err.of', () => {
  it('should create a new error', () => {
    const infos = { id: 'xxxx' }

    const err = Err.of('Could not find user {id}', infos)
    expect(err).toBeInstanceOf(Exception)
    expect(err.name).toBe('Exception')
    expect(err.message).toBe('Could not find user xxxx')
    expect(err.id).toEqual('xxxx')
    expect(pipe(err, Obj.copy)).toEqual(infos)
  })

  it('should create a new error with a specific name', () => {
    const infos = { id: 'xxxx', name: 'MyError' }

    const err = Err.of('Could not find user {id}', infos)
    expect(err).toBeInstanceOf(Exception)
    expect(err.name).toBe('MyError')
    expect(err.message).toBe('Could not find user xxxx')
    expect(err.id).toEqual('xxxx')
  })
})

describe('Err.toError', () => {
  it('should return error if instance of Error', () => {
    const source = new Error('error')
    const err = pipe(source, Err.toError)
    expect(err).toBe(source)
  })

  it('should return new error if not instance of Error', () => {
    const msg = 'error'
    const err = pipe(msg, Err.toError)
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toBe(msg)
    expect(pipe(err, Obj.copy)).toEqual({})
  })
})

describe('Err.wrap', () => {
  it('should override message', () => {
    const source: unknown = new Error('error')
    const err = pipe(source, Err.wrap('Could not find user'))

    expect(err).toBeInstanceOf(Exception)
    expect(err.message).toBe('Could not find user')
    expect(err.cause).toBe(source)
  })
})

describe('Err.chain', () => {
  it('should override message', () => {
    const source: unknown = new Error('error')
    const err = pipe(source, Err.chain('Could not find user'))

    expect(err).toBeInstanceOf(Exception)
    expect(err.message).toBe('Could not find user: error')
    expect(err.cause).toBe(source)
  })
})

describe('Err.find', () => {
  it('should find error in cause with given info', () => {
    const e1 = Err.of('Test {name}', { name: 'Error1' })
    const e2 = pipe(e1, Err.chain('Function X'))
    const e3 = pipe(e2, Err.chain('Chain {name}', { name: 'Error2' }))

    const cause = pipe(
      e3,
      Err.find((info) => info.name === 'Error1')
    )

    expect(cause).toBe(e1)
    expect(cause?.message).toBe('Test Error1')
  })
})

describe('Err.has', () => {
  const e1 = Err.of('Test {a}', { name: 'Error1' })
  const e2 = pipe(e1, Err.chain('Function X'))
  const e3 = pipe(e2, Err.chain('Chain {a}', { name: 'Error2' }))

  it('should have error in cause with given info', () => {
    const found = pipe(
      e3,
      Err.has((info) => info.name === 'Error1')
    )
    expect(found).toBe(true)
  })

  it('should not gave error', () => {
    const notFound = pipe(
      e3,
      Err.has((info) => info.name === 'Error0')
    )
    expect(notFound).toBe(false)
  })
})

describe('Err.hasName', () => {
  const e1 = Err.of('Test {a}', { name: 'Error1' })
  const e2 = pipe(e1, Err.chain('Function X'))
  const e3 = pipe(e2, Err.chain('Chain {a}', { name: 'Error2' }))

  it('should have error in cause with given info', () => {
    const found = pipe(e3, Err.hasName('Error1'))
    expect(found).toBe(true)
  })

  it('should not gave error', () => {
    const notFound = pipe(e3, Err.hasName('Error0'))
    expect(notFound).toBe(false)
  })
})

describe('Err.format', () => {
  it('should return expected results', () => {
    const e1 = Err.of('Select query failed: invalid characters at xxxx', { name: 'DbError', code: 'QueryError' })
    const e2 = pipe(e1, Err.chain('Could not read data'))
    const e3 = pipe(e2, Err.chain('Job {jobId} failed', { name: 'JobError', jobId: 'xxxx' }))

    const formatted = pipe(e3, Err.format)
    const withoutStack = Err.omitStack(formatted)

    expect(typeof formatted.stack).toBe('string')
    expect(withoutStack).toEqual({
      message: 'Job xxxx failed: Could not read data: Select query failed: invalid characters at xxxx',
      name: 'JobError',
      info: {
        code: 'QueryError',
        jobId: 'xxxx'
      }
    })
  })

  it('should return error name if no info has name prop', () => {
    const e = Err.of('Select query failed: invalid characters at xxxx')

    const formatted = pipe(e, Err.format)
    const withoutStack = Err.omitStack(formatted)

    expect(withoutStack).toEqual({
      message: 'Select query failed: invalid characters at xxxx',
      name: 'Exception',
      info: {}
    })
  })
})
