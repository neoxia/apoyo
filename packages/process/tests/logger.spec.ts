import { Container } from '@apoyo/ioc'
import { PassThrough } from 'stream'
import { Logger, LoggerOptions, LogLevel, Process } from '../src'

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

const stripAnsi = (str: string) =>
  str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')

describe('Logger.$logger', () => {
  it('should by default use environment variables to configure logger', async () => {
    const scope = Container.create({
      bindings: [
        Container.bind(Process.$env, {
          LOG_LEVEL: LogLevel.WARN
        })
      ]
    })

    const logger = await scope.get(Logger.$logger)

    expect(logger.level).toBe(LogLevel.WARN)

    await scope.close()
  })

  it('should configure the logger correctly by overriding Logger.$config', async () => {
    const options: LoggerOptions = {
      level: LogLevel.WARN
    }

    const scope = Container.create({
      bindings: [Container.bind(Logger.$options, options)]
    })

    const logger = await scope.get(Logger.$logger)

    expect(logger.level).toBe(LogLevel.WARN)

    await scope.close()
  })

  it('should not use pretty print by default', async () => {
    const { stdout, passthrough } = mockStdout((str) => JSON.parse(str))

    const scope = Container.create({
      bindings: [
        // Bindings
        Container.bind(Logger.$out, passthrough)
      ]
    })

    const logger = await scope.get(Logger.$logger)

    logger.debug('Debug')

    expect(stdout).toBeCalledTimes(0)

    logger.info(
      {
        foo: 'bar'
      },
      'Info'
    )

    expect(stdout).toBeCalledTimes(1)

    const log = stdout.mock.calls[0][0]
    expect(log.name).toBe(undefined)
    expect(log).toEqual(
      expect.objectContaining({
        level: logger.levels.values[LogLevel.INFO],
        msg: 'Info',
        foo: 'bar'
      })
    )

    await scope.close()
  })

  it('should use pretty print when enabled', async () => {
    const { stdout, passthrough } = mockStdout((str) => stripAnsi(str))

    const scope = Container.create({
      bindings: [
        // Bindings
        Container.bind(Process.$env, {
          LOG_PRETTY: 'true'
        }),
        Container.bind(Logger.$out, passthrough)
      ]
    })

    const logger = await scope.get(Logger.$logger)

    logger.debug('Debug')

    expect(stdout).toBeCalledTimes(0)

    logger.info(
      {
        foo: 'bar'
      },
      'Info'
    )

    expect(stdout).toBeCalledTimes(1)
    expect(stdout.mock.calls[0][0]).toEqual(expect.stringContaining('INFO: Info'))

    await scope.close()
  })
})

describe('Logger.child', () => {
  it('should create child logger with given name', async () => {
    const { stdout, passthrough } = mockStdout((str) => JSON.parse(str))

    const scope = Container.create({
      bindings: [
        // Bindings
        Container.bind(Logger.$out, passthrough)
      ]
    })

    const $childLogger = Logger.child({
      name: 'child',
      level: LogLevel.DEBUG
    })

    const logger = await scope.get($childLogger)

    expect(logger.level).toBe(LogLevel.DEBUG)

    logger.debug(
      {
        foo: 'bar'
      },
      'Debug'
    )

    expect(stdout).toBeCalledTimes(1)

    logger.info(
      {
        foo: 'bar'
      },
      'Info'
    )

    expect(stdout).toBeCalledTimes(2)

    const log = stdout.mock.calls[1][0]
    expect(log.name).toBe('child')
    expect(log).toEqual(
      expect.objectContaining({
        level: logger.levels.values[LogLevel.INFO],
        msg: 'Info',
        foo: 'bar'
      })
    )

    await scope.close()
  })
})

describe('Logger.forContext', () => {
  it('should create child logger with given name', async () => {
    const { stdout, passthrough } = mockStdout((str) => JSON.parse(str))

    const scope = Container.create({
      bindings: [
        // Bindings
        Container.bind(Logger.$out, passthrough)
      ]
    })

    const $childLogger = Logger.forContext('child')
    const logger = await scope.get($childLogger)

    logger.info(
      {
        foo: 'bar'
      },
      'Info'
    )

    expect(stdout).toBeCalledTimes(1)

    const log = stdout.mock.calls[0][0]
    expect(log.name).toBe('child')
    expect(log).toEqual(
      expect.objectContaining({
        level: logger.levels.values[LogLevel.INFO],
        msg: 'Info',
        foo: 'bar'
      })
    )

    await scope.close()
  })
})

describe('Logger.$context', () => {
  it('should add additional information to each log', async () => {
    const { stdout, passthrough } = mockStdout((str) => JSON.parse(str))

    const scope = Container.create({
      bindings: [
        // Bindings
        Container.bind(Logger.$out, passthrough)
      ]
    })

    const logger = await scope.get(Logger.$logger)

    const als = await scope.get(Logger.$als)

    const reqLogger = logger.child({
      req: {
        id: 'xxxx-xxxx-xxxx',
        method: 'GET',
        ip: '192.168.0.0'
      }
    })

    await als.runAsync(reqLogger.bindings(), async () => {
      const contextBindings = als.bindings()

      expect(contextBindings).toEqual({
        req: expect.objectContaining({
          id: expect.anything()
        })
      })

      logger.info(
        {
          foo: 'bar'
        },
        'Info'
      )

      expect(stdout).toBeCalledTimes(1)

      const log = stdout.mock.calls[0][0]
      expect(log).toEqual(
        expect.objectContaining({
          level: logger.levels.values[LogLevel.INFO],
          msg: 'Info',
          foo: 'bar',
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

    await scope.close()
  })
})
