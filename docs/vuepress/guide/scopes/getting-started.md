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

There are however a few issues:

- They are mostly used with classes and decorators

- They don't support custom scopes creation: Most only have a singleton scope, transient scope and maybe request scope

- Most of them don't have a clear shutdown mechanism, to gracefully shutdown the services

## Goal

This package is a more functional based dependency injection solution, with the following characteristics:

- Without classes / decorators: This encourages better code splitting, and makes it a lot easier to expose primitives, async values, functions, etc... instead of mostly class instances only. It also encourages composition.

- Typescript friendly

- Custom scopes: You will have complete control over how many scopes and child scopes you create. This makes it very easy to create, for example, a separate scope for each "Job", containing the data of the job that is being currently processed.

- Lazy loading: If your application contains hundreds of services, why should we start them all up if only a handful are needed on program startup?

- Powerful scope shutdown mechanism: In production environments, we most probably want to shutdown our application properly before restarting it (example: Wait for current HTTP requests to finish, then close server, then close database connection, etc...)

- Easier testability

## Example

**Note**: The entire source code of the examples will be available under the *examples/scopes* folder.

First, we will need to declare some injectables using the utils in the `Var` namespace:

```ts

// This injectable does not have any dependencies. As such we simply use `Var.thunk`
const Env = Var.thunk(async () => {
  // Load env variables from .env files
  // Validate env variables
  // etc...
  return {
    PORT: parseInt(process.PORT) || 3000
  }
})

const Config = {
  API: pipe(
    Env,
    Var.map(env => ({
      port: env.PORT
    }))
  )
}

const HealthRoutes = pipe(
  Var.empty,
  Var.map(() => {
    const route = Router()

    route.get('/', (req, res) => {
      res.json({
        status: 'OK'
      })
    })

    return route
  })
)

const TodoRoutes = pipe(
  Var.empty,
  Var.map(() => {
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
)

export const Routes = pipe(
  Var.struct({
    health: HealthRoutes,
    todos: TodoRoutes
  }),
  Var.map((routes) => {
    const route = Router()
    route.use('/health', routes.health)
    route.use('/todos', routes.todos)
    return route
  })
)

const API = pipe(
  Var.struct({
    config: Config.API, 
    routes: Routes
  }),
  Var.resource(async ({ config, routes }) => {

    const app = express()
    // use middlewares
    // ...
    // use routes
    app.use(routes)

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
)
```

Once all the variables you need have been created, you need to create a scope that will host / manage these variables for you.

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
