import { PassThrough } from 'stream'
import { createLogger, LogLevel } from '../src'

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

describe('createLogger', () => {
  it('should not use pretty print by default', async () => {
    const { stdout, passthrough } = mockStdout((str) => JSON.parse(str))

    const logger = createLogger({
      destination: passthrough
    })

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
  })

  it('should use pretty print when enabled', async () => {
    const { stdout, passthrough } = mockStdout((str) => stripAnsi(str))

    const logger = createLogger({
      prettyPrint: true,
      destination: passthrough
    })

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
  })
})
