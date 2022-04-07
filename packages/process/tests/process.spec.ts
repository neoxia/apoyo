import { Scope } from '@apoyo/scopes'

import { NodeEnvironment, Process } from '../src'

describe('Process', () => {
  let scope: Scope

  beforeAll(() => {
    scope = Scope.create({
      bindings: [
        // Bindings
        Scope.bind(Process.$envDir, __dirname),
        Scope.bind(Process.$nodeEnv, NodeEnvironment.DEV)
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
