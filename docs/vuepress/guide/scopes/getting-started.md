# Getting started

## Installation

Install peer dependencies:
`npm install @apoyo/std`

Install package:
`npm install @apoyo/ioc`

## Motivation

Today, a lot of solutions exists for dependency injection in JS/TS, the most popular solutions being:

- Typedi
- Inversify
- Nestjs
- etc...

However, very few DI solutions exist for people wanting a more functional approach, while keeping everything fully typed.

Here a few unique features of this library:

1/ Everything is fully typed by default:

```ts
import { Injectable } from '@apoyo/ioc'

// Define an injectable without dependencies
export const $env = Injectable.define(async () => {
  // Load env variables from .env files
  // Validate env variables
  // etc...
  return {
    PORT: parseInt(process.PORT) || 3000
  }
})

// Define an injectable with one or multiple dependencies
export const $config = Injectable.define([$env], (env) => ({
  port: env.PORT
}))
```

**Note**: Keep in mind that all injectables are lazy and will only be initialized / loaded when required. As such, the code above does not execute anything yet!

2/ Very easy to **integrate with existing libraries**, without being required to create "wrappers" around every third party code:

```ts
const $routes = Injectable.define(() => {
  const route = Router()

  route.get('/todos', (req, res) => {
    res.json([
      {
        id: 1,
        title: 'Eat breakfast',
        done: false
      },
      {
        id: 2,
        title: 'Go to work',
        done: false
      }
    ])
  })

  return route
})
```

3/ **Encourages composition**: An injectable is a simple variable. This means we can also pass them as parameters to functions and dynamically create new ones:

*Example*:

```ts
export const createDiskModule = (
  $strategy: Injectable<'s3' | 'local'>, 
  configs: {
    $s3: Injectable<S3DiskStrategyConfig>
    $local: Injectable<LocalDiskStrategyConfig>
  }): Injectable<DiskService> => {

  const strategies = {
    s3: Injectable.define([configs.$s3], (config) => new S3DiskStrategy(config)),
    local: Injectable.define([configs.$local], (config) => new LocalDiskStrategy(config))
  }

  const $disk = Injectable.define([$strategy], (strategy) => {
    return strategies[strategy]
  })

  return $disk
}

// Create file modules

const $diskStrategy = Injectable.define(() => process.env.DISK_STRATEGY as 's3' | 'local')

const $localDiskConfig = Injectable.define((): LocalDiskStrategyConfig => ({
  path: '/uploads/'
}))

const $bucket1Config = Injectable.define((): S3DiskStrategyConfig => ({
  bucketName: 'bucket-1'
}))

const $bucket2Config = Injectable.define((): S3DiskStrategyConfig => ({
  bucketName: 'bucket-2'
}))

export const $disk1 = createDiskModule($diskStrategy, {
  $s3: $bucket1Config,
  $local: $localDiskConfig
})

export const $disk2 = createDiskModule($diskStrategy, {
  $s3: $bucket2Config,
  $local: $localDiskConfig
})
```

**Note**: Only the injectable that are actually used are loaded: If you choose the `s3` strategy, the `$localDiskConfig` configuration and the injectable for `LocalDiskStrategy` will not be loaded.

4/ **Disposable resources** that can be cleaned up when the container is closed:

```ts
const $app = Injectable.define([$routes], (routes) => {
  const app = express()
  app.use(express.json())
  app.use(routes)
  return app
})

const $server = Injectable.define([$app, $config], (app, config) => {
  const port = config.port
  const server = await new Promise((resolve, reject) => {
    const server = app.listen(port, (err) => err ? reject(err) : resolve(server))
  })

  const close = async () => {
    return new Promise((resolve, reject) => {
      server.close((err) => err ? reject(err) : resolve(err))
    })
  }

  return Resource.of(server, close)
})
```

5/ **No native support decorators**: while this is opiniated, there are not supported for multiple reasons:

- Decorators have the issue of not always being type-safe:

```ts
@Injectable()
class Foo {
  // How should we know if MY_TOKEN is a "string"? It may as well be a "number". 
  // There is no type verification here at all.
  // It also makes injecting non-class variables a real pain.
  constructor(@Inject(MY_TOKEN) myToken: string) {

  }
}
```

- Decorators also only work with classes, and classes are harder to compose than simple functions or objects.

6/ **No circular dependencies are supported**. As such, the following is impossible:

```ts
// This does not work
const $a = Injectable.define([$b], (b) => b)
const $b = Injectable.define([$a], (a) => a)

// This does not work either
const a = b
const b = a
```

Most of the time, circular dependencies can be avoided by splitting up your code correctly, which is very easy with this library by simply using functions.

## Example

First, we will need to declare some injectables using the utils in the `Injectable` namespace:

```ts
export const $env = Injectable.define(async () => {
  return {
    PORT: parseInt(process.PORT) || 3000
  }
})

export const $config = Injectable.define([$env], env => ({
  port: env.PORT
}))

export const $routes = Injectable.define(() => {
  const route = Router()

  route.get('/todos', (req, res) => {
    res.json([
      {
        id: 1,
        title: 'Eat breakfast',
        done: false
      },
      {
        id: 2,
        title: 'Go to work',
        done: false
      }
    ])
  })

  return route
})

export const $app = Injectable.define([$routes], (routes) => {
  const app = express()
  app.use(express.json())
  app.use('/todos', routes)
  return app
})

export const $server = Injectable.define([$app, $config], (app, config) => {
  const port = config.port
  const server = await new Promise((resolve, reject) => {
    const server = app.listen(port, (err) => err ? reject(err) : resolve(server))
  })

  const close = async () => {
    return new Promise((resolve, reject) => {
      server.close((err) => err ? reject(err) : resolve(err))
    })
  }

  return Resource.of(server, close)
})
```

Once all the injectables you need have been created, you need to create a container that will host / manage these injectables for you.

```ts
const main = async () => {
  const container = Container.create({
    bindings: []
  })
  
  try {
    await container.get($server)

    // It is recommended to add logic to await the end of the process and close the server gracefully.
    // Check out the examples for an example implementation.
  } catch (err) {
    await container.close()
    throw err
  }
}

main()
```

That's it. Now, when you start your application, a container will be created which will load an express server, including all required dependencies.
