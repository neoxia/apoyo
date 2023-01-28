import { PassThrough } from 'stream'
import { createLogger, LoggerContext, LogLevel } from '../src'

const mockStdout = (fn: (str: string) => any) => {
  const passthrough = new PassThrough()
  const stdout = jest.fn()
  passthrough.on('data', (data: Buffer) => {
    const str = data.toString('utf8')
    stdout(fn(str))
  })

  return {
    passthrough,
    stdout
  }
}

describe('LoggerContext', () => {
  it('should add additional information to each logger in async scope', async () => {
    const { stdout, passthrough } = mockStdout((str) => JSON.parse(str))

    const context = new LoggerContext()
    const logger = createLogger(
      {
        destination: passthrough
      },
      context
    )

    const featureLogger = logger.child({
      name: 'MyFeature',
      hello: 'John'
    })

    const reqLogger = logger.child({
      name: 'Http',
      hello: 'Doe',
      req: {
        id: 'xxxx-xxxx-xxxx',
        method: 'GET',
        ip: '192.168.0.0'
      }
    })

    await context.attachBindings(reqLogger.bindings(), async () => {
      const contextBindings = context.bindings()

      expect(contextBindings).toEqual({
        name: 'Http',
        hello: 'Doe',
        req: expect.objectContaining({
          id: expect.any(String)
        })
      })

      featureLogger.info(
        {
          foo: 'bar'
        },
        'Info'
      )

      expect(stdout).toBeCalledTimes(1)

      const log = stdout.mock.calls[0][0]
      expect(log).toEqual(
        expect.objectContaining({
          name: 'MyFeature',
          level: logger.levels.values[LogLevel.INFO],
          msg: 'Info',
          foo: 'bar',
          hello: 'John',
          req: expect.objectContaining({
            id: expect.anything()
          })
        })
      )
    })

    stdout.mockReset()

    logger.info(
      {
        foo: 'bar'
      },
      'Info'
    )

    expect(stdout).toBeCalledTimes(1)

    const log = stdout.mock.calls[0][0]
    expect(log.req).toBe(undefined)
    expect(log).toEqual(
      expect.objectContaining({
        level: logger.levels.values[LogLevel.INFO],
        msg: 'Info',
        foo: 'bar'
      })
    )
  })
})
