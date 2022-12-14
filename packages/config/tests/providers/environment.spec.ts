import { resolve } from 'path'
import { AppMode, AppParameters, getParametersFromEnvironment } from '../../src'

describe('getParametersFromEnvironment', () => {
  let parameters: AppParameters

  beforeEach(async () => {
    process.env['C'] = '10'
    process.env['D'] = '11'

    parameters = await getParametersFromEnvironment({
      path: resolve(__dirname, '..'),
      appEnv: AppMode.DEV
    })
  })

  it('should load env files correctly', () => {
    expect(parameters['A']).toBe('2')
    expect(parameters['B']).toBe('3')

    expect(parameters['DB_HOST']).toBe('localhost')
    expect(parameters['DB_PORT']).toBe('4000')
  })

  it('should expand variables correctly', () => {
    expect(parameters['DB_CONNECTION_URL']).toBe('localhost:4000')
  })

  it('should not override process.env', () => {
    expect(process.env['A']).toBe(undefined)
    expect(process.env['B']).toBe(undefined)
  })

  it('process.env variables should have higher priority', () => {
    expect(parameters['C']).toBe('10')
  })

  it('process.env variables should also be loaded', () => {
    expect(parameters['D']).toBe('11')
  })

  it('should not change when process.env changes after the parameters have been loaded', () => {
    expect(parameters['A']).toBe('2')
    expect(parameters['B']).toBe('3')

    process.env['A'] = '100'
    process.env['B'] = '100'

    expect(parameters['A']).toBe('2')
    expect(parameters['B']).toBe('3')
  })
})
