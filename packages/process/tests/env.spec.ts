import { IntegerDecoder } from '@apoyo/decoders'
import { Container } from '@apoyo/ioc'

import { Env, AppEnvironment, Process } from '../src'

process.env['C'] = '10'

describe('Env.load', () => {
  const env = Env.load({
    path: __dirname,
    node_env: AppEnvironment.DEV.name
  })

  it('should load env files correctly', () => {
    expect(env['A']).toBe('2')
    expect(env['B']).toBe('3')

    expect(env['DB_HOST']).toBe('localhost')
    expect(env['DB_PORT']).toBe('4000')
  })

  it('should expand variables correctly', () => {
    expect(env['DB_CONNECTION_URL']).toBe('localhost:4000')
  })

  it('should not override process.env', () => {
    expect(process.env['A']).toBe(undefined)
    expect(process.env['B']).toBe(undefined)
  })

  it('process.env variables should have higher priority', () => {
    expect(process.env['C']).toBe('10')
  })
})

describe('Env.validate', () => {
  const env = process.env

  it('should validate variables with the given schema', () => {
    const parsed = Env.validate(env, {
      C: IntegerDecoder.int
    })

    expect(parsed).toEqual({
      C: 10
    })
  })
})

describe('Env.define', () => {
  let container: Container

  beforeAll(() => {
    container = Container.create({
      bindings: [
        // Bindings
        Container.bind(Process.$envDir, __dirname),
        Container.bind(Process.$appEnv, AppEnvironment.DEV)
      ]
    })
  })

  afterAll(async () => {
    await container.close()
  })

  it('should get the $env injectable', async () => {
    const $parsed = Env.define({
      C: IntegerDecoder.int
    })

    const parsed = await container.get($parsed)

    expect(parsed).toEqual({
      C: 10
    })
  })
})
