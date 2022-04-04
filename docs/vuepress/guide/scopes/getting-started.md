# Getting started

## Installation

Install peer dependencies:
`npm install @apoyo/std`

Install package:
`npm install @apoyo/scopes`

## Motivation

Today, a lot of solutions exists for dependency injection in JS/TS, the most popular solutions being:

- Typedi
- Inversify
- Nestjs
- etc...

However, very few DI solutions exist for people wanting a more functional approach, while keeping everything fully typed.

Here a few unique features of this library:

1/ Building injectables from primitives, async values, functions, etc... while keeping everything fully typed:

```ts
import { Injectable } from '@apoyo/scopes'

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
export const $apiConfig = Injectable.define($env, env => ({
  port: env.PORT
}))
```

**Note**: Keep in mind that all injectables are lazy and will only be initialized / loaded when required. As such, the code above does not execute anything yet!

2/ Very easy to integrate with existing libraries, without being required to create "wrappers" around every third party code:

```ts
const $todoRoutes = Injectable.define(() => {
  const route = Router()

  route.get('/', (req, res) => {
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

3/ Encourages composition: As an injectable is a simple variable, we can also pass them as parameters to functions and build upon them to create new ones:

*Example*:

```ts
// define some utils
export const prefixRoute = (prefix: string, $route: Injectable<Router>) => 
  Injectable.define($route, (route) => {
    const router = Router()
    router.use(route)
    return router
  })

export const combineRoutes = (routes: Array<Injectable<Router>>) => {
  const $routes = Injectable.sequence(routes) // returns Injectable<Router[]>
  return Injectable.define($routes, routes => {
    const router = Router()
    for (const route of routes) {
      router.use(route)
    }
    return router
  })
}

// define some routes
const $routes = combineRoutes([
  prefixRoutes('/health', $healthRoutes),
  prefixRoutes('/todos', $todoRoutes),
])
```

4/ Disposable resources that can be cleaned up when the scope / container is closed:

```ts
// Create some utils
const listen = (app: Express.Application, port: number) => new Promise<Server>((resolve, reject) => {
  const server = app.listen(port, (err) => err ? reject(err) : resolve(server))
})

const close = (server: Server) => new Promise<void>((resolve, reject) => {
  server.close((err) => err ? reject(err) : resolve())
})

export const createExpressServer = ($app: Injectable<Express.Application>, $config: Injectable<{ port: number }>) =>
  Injectable.define($app, $config, (app, config) => {
    const port = config.port
    const server = await listen(app, port)

    const close = async () => {
      await close(server)
    }
    // Return a resource to specify a cleanup function for an injectable
    return Resource.of(server, close)
  })

const $app = Injectable.define($routes, (routes) => {
  const app = express()
  app.use(express.json())
  app.use(routes)
  return app
})

const $server = createExpressServer($app, $apiConfig)
```

5/ No native support decorators: while this is opiniated, there are not supported for multiple reasons:

- Decorators have the issue of not always being type-safe:

```ts
@Injectable()
class Foo {
  // How should we know if MY_TOKEN is a "string"? It may as well be a "number" or anything else. 
  // There is no type verification here at all.
  // It also makes injecting non-class variables a real pain.
  constructor(@Inject(MY_TOKEN) myToken: string) {

  }
}
```

- Decorators also only work with classes, and classes are harder to compose than simple functions or objects.

6/ No circular dependencies are supported. As such, the following is impossible:

```ts
// This does not work
const $a = Injectable.define($b, (b) => b)
const $b = Injectable.define($a, (a) => a)

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

export const $config = Injectable.define($env, env => ({
  port: env.PORT
}))

export const $todoRoutes = Injectable.define(() => {
  const route = Router()

  route.get('/', (req, res) => {
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

export const $app = Injectable.define($todoRoutes, (todoRoutes) => {
  const app = express()
  app.use(express.json())
  app.use('/todos', todoRoutes)
  return app
})

export const $server = Injectable.define($app, $config, (app, config) => {
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

Once all the injectables you need have been created, you need to create a scope that will host / manage these injectables for you.

```ts
const main = async () => {
  const scope = Scope.create({
    bindings: []
  })
  
  try {
    await scope.get(API)

    // It is recommended to add logic to await the end of the process and close the server gracefully.
    // Check out the examples for an example implementation.
  } catch (err) {
    await scope.close()
    throw err
  }
}

main()
```

That's it. Now, when you start your application, a scope will be created which will load an express server, including all required dependencies.
