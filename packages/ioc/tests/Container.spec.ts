import { pipe, Prom, Result } from '@apoyo/std'
import { Container, Service } from '../src'

const Env = Service.factory('Env', [], async () => {
  return {
    API_PORT: 8080
  }
})

const Config = Service.factory('Config', [Env], async (env) => {
  return {
    api: {
      port: env.API_PORT
    }
  }
})

const ApiConfig = Service.factory('Config.api', [Config], (config) => config.api)

const Api = Service.factory('Api', [ApiConfig], async (apiConfig) => {
  const server = { apiConfig, close: () => Promise.resolve() }

  return Service.result(server, {
    onDestroy: () => server.close()
  })
})

describe('Container.bootstrap', () => {
  it('should bootstrap all services', async () => {
    const app = await Container.bootstrap({
      services: [Api]
    })

    const apiConfig = await Container.find(app, ApiConfig)

    expect(apiConfig).toEqual({
      port: 8080
    })

    await Container.destroy(app)

    expect(app.services.size).toBe(0)
  })

  it('should bootstrap all services with correct bindings', async () => {
    const Mocks = {
      ApiConfig: Service.constant('Mocks.ApiConfig', {
        port: 9090
      })
    }

    const app = await Container.bootstrap({
      services: [Api],
      bindings: [Service.bind(ApiConfig, Mocks.ApiConfig)]
    })

    const config = await Container.find(app, ApiConfig)

    expect(config).toEqual({
      port: 9090
    })

    await Container.destroy(app)

    expect(app.services.size).toBe(0)
  })

  it('should throw on unimplemented error', async () => {
    const Mocks = {
      Env: Service.abstract<any>('TestEnv')
    }

    const result = await pipe(
      Container.bootstrap({
        services: [Api],
        bindings: [Service.bind(Env, Mocks.Env)]
      }),
      Prom.tryCatch
    )

    const error = Result.isKo(result) ? (result.ko as Error) : undefined

    expect(pipe(result, Result.isKo)).toBe(true)
    expect(error).toBeInstanceOf(Error)
    expect(error?.message).toBe(
      `An error occured while bootstrapping the container: Could not initialize service "TestEnv" at <root> → Api → Config.api → Config → TestEnv: Service "TestEnv" has not been implemented`
    )
  })

  it('should throw on internal error', async () => {
    const Mocks = {
      Env: Service.factory('TestEnv', [], () => {
        throw new Error('Internal error')
      })
    }

    const result = await pipe(
      Container.bootstrap({
        services: [Api],
        bindings: [Service.bind(Env, Mocks.Env)]
      }),
      Prom.tryCatch
    )

    const error = Result.isKo(result) ? (result.ko as Error) : undefined

    expect(pipe(result, Result.isKo)).toBe(true)
    expect(error).toBeInstanceOf(Error)
    expect(error?.message).toBe(
      `An error occured while bootstrapping the container: Could not initialize service "TestEnv" at <root> → Api → Config.api → Config → TestEnv: Internal error`
    )
  })
})

describe('Container.destroy', () => {
  it('should destroy in correct order', async () => {
    const mock = jest.fn()

    const A = Service.factory('A', [], () => {
      return Service.result('A', {
        onDestroy: () => mock('A')
      })
    })

    const B = Service.factory('B', [A], () => {
      return Service.result('B', {
        onDestroy: () =>
          pipe(
            Prom.thunk(() => mock('B')),
            Prom.delay(100)
          )
      })
    })

    const C = Service.factory('C', [B], () => {
      return Service.result('C', {
        onDestroy: () =>
          pipe(
            Prom.thunk(() => mock('C')),
            Prom.delay(100)
          )
      })
    })

    const app = await Container.bootstrap({
      services: [C]
    })

    await Container.destroy(app)

    expect(mock.mock.calls.length).toBe(3)
    expect(mock.mock.calls).toEqual([['C'], ['B'], ['A']])
  })
})
