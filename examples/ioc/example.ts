import { Container, Service } from '@apoyo/ioc'

const Env = Service.factory('Env', [], async () => {
  return {
    API_PORT: 8080,
    DATABASE_URL: 'xxxxx'
  }
})

const Config = Service.factory('Config', [Env], async (env) => {
  return {
    api: {
      port: env.API_PORT
    },
    database: {
      url: env.DATABASE_URL
    }
  }
})

// Split a big service into multiple smaller services (1 per property)
// This allows features to be more easily tested
const Configs = Service.pluckAll(Config)

const Database = Service.factory('Database', [Configs.database], (config) => {
  // for demo-purposes, use real implementation in real use-cases
  const createPool = (config: any) => {
    return {
      config,
      destroy: () => Promise.resolve()
    }
  }

  // create pool
  const pool = createPool(config)

  return Service.result(pool, {
    onDestroy: async () => {
      console.log(`Close database`)
      await pool.destroy()
    }
  })
})

const Api = Service.factory('Api', [Configs.api, Database], async (apiConfig) => {
  const server = { apiConfig, close: () => Promise.resolve() }

  console.log(`Start Api`)
  setTimeout(() => ({}), 10000)

  return Service.result(server, {
    onDestroy: async () => {
      console.log(`Close server`)
      await server.close()
    }
  })
})

const main = async () => {
  // Create mocks
  const Mocks = {
    ApiConfig: Service.constant('Mocks.ApiConfig', {
      port: 9090
    })
  }

  // Setup root services, all child dependencies will be loaded automatically
  const app = await Container.bootstrap({
    services: [Api],
    bindings: [Service.bind(Configs.api, Mocks.ApiConfig)]
  })

  console.log(`Application started`)

  // Await an exit signal
  await new Promise((resolve) => {
    process.once('exit', resolve)
    process.once('uncaughtException', resolve)
    process.once('unhandledRejection', resolve)
    process.once('SIGTERM', resolve)
    process.once('SIGINT', resolve)
    process.once('SIGUSR1', resolve)
    process.once('SIGUSR2', resolve)
  })

  console.log(`Stopping services...`)

  // Teardown all mounted services
  await Container.destroy(app)

  console.log(`Exiting application`)
}

main()
