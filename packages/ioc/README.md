# Apoyo - IoC

[![npm version](https://badgen.net/npm/v/@apoyo/ioc)](https://www.npmjs.com/package/@apoyo/ioc)
[![build size](https://badgen.net/bundlephobia/min/@apoyo/ioc)](https://bundlephobia.com/result?p=@apoyo/ioc)
[![three shaking](https://badgen.net/bundlephobia/tree-shaking/@apoyo/ioc)](https://bundlephobia.com/result?p=@apoyo/ioc)

**Warning**: This package is still in development and features may still change, be renamed or removed.

However, we would appreciate any feedback you have on how to improve this library:

- Which features are missing?
- Which features are hard to understand or unnecessary?
- Which features need to be improved?

## Installation

**Warning**: This package has not been deployed to NPM yet and may still be renamed.

`npm install @apoyo/ioc`

## Description

Ths package contains utilities to setup and manage projects:

- Class-less service creation
- Dependencies management
- Service binding and mocking
- Async setup & teardown support

The main goal of this package is to provide a progressive solution that is easily integrated in an existing projects / non-Typescript projects without decorators.

## Example

```ts

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
```
