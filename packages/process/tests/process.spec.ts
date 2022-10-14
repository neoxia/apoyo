import { Container } from '@apoyo/ioc'

import { AppEnvironment, Process } from '../src'

describe('Process', () => {
  let scope: Container

  beforeAll(() => {
    scope = Container.create({
      bindings: [
        // Bindings
        Container.bind(Process.$envDir, __dirname),
        Container.bind(Process.$appEnv, AppEnvironment.DEV)
      ]
    })
  })

  afterAll(async () => {
    await scope.close()
  })

  it('should get the $env injectable', async () => {
    const env = await scope.get(Process.$env)

    expect(env['A']).toBe('2')
    expect(env['B']).toBe('3')
  })
})
