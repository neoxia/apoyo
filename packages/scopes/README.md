# Apoyo - Scopes

[![npm version](https://badgen.net/npm/v/@apoyo/scopes)](https://www.npmjs.com/package/@apoyo/scopes)
[![build size](https://badgen.net/bundlephobia/min/@apoyo/scopes)](https://bundlephobia.com/result?p=@apoyo/scopes)
[![three shaking](https://badgen.net/bundlephobia/tree-shaking/@apoyo/scopes)](https://bundlephobia.com/result?p=@apoyo/scopes)

## Installation

Install peer dependencies:
`npm install @apoyo/std`

Install package:
`npm install @apoyo/decoders`

## Motivation

Today, a lot of solutions exists for dependency injection in JS/TS, the most popular solutions being:

- Typedi
- Inversify
- Nestjs
- etc...

Here however a few issues:

- They are mostly used with classes and decorators

- They don't support custom scopes creation: Most only have a singleton scope, transient scope and maybe request scope

- Most of them don't have a clear shutdown mechanism, to gracefully shutdown the services

## Goal

This package is a more functional based dependency injection solution, with the following characteristics:

- Without classes / decorators: This encourages better code splitting, and makes it a lot easier to expose primitives, async values, functions, etc... instead of mostly class instances only.

- Typescript friendly

- Custom scopes: You will have complete control over how many scopes and child scopes you create. This makes it very easy to create, for example, a separate scope for each "Job", containing the data of the job that is being currently processed.

- Lazy loading of dependencies: If your application contains hundreds of services... why should we startup them all up if only a handful are needed on program startup.

- Powerful scope shutdown mechanism

- Easier testability

## Getting started

**Note**: The entire source code of the examples will be available under the *examples/scopes* folder.

Before starting, there are a few very essential things you need to know:

- `Var`s are like injectables, and you can inject any other `Var` that you have declared.

- `Var`s are cached in the scope it has been mounted on. This means that the `Var` will only be computed once, even if it is used multiple times.

- `Scope`s are like containers, with a few important differences:
  - Scopes may also have sub-scopes
  - Scopes track all `Var`s that need to be unmounted / closed.

### Example

First, we will need to declare some `Var`s:

```ts
const Env = Var.thunk(async () => {
  // Add env validation, etc...
  return process.env as Dict
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
  Var.inject(),
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
  Var.inject(),
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
  Var.inject(Config.API, Routes),
  Var.map(async ([config, routes]) => {

    const app = express()
    // use middlewares
    // ...
    // use routes
    app.use(routes)

    const port = config.port
    const server = await new Promise((resolve, reject) => {
      const server = app.listen(port, (err) => err ? reject(err) : resolve(server))
    })

    return server
  }),
  Var.closeWith(server => {
    // close http server
  })
)

const Main = pipe(
  API,
  Var.map(async () => {
    await Process.end() // Not implemented here, to keep the examples shorter, look up the examples folder for the full implementation
  })
)
```

Once all the variables you need have been created, you need to create a scope that will host / manage these variables for you:

```ts
// 1. Manually create root scope
const scope = pipe(
  Scope.create(),
  Scope.get
)

try {
  await scope.get(Main)
  await scope.close()
} catch (err) {
  await scope.close()
  throw err
}

// 2. Automatically handle closing of scope after variable execution
pipe(
  Scope.create(),
  Scope.run(Main)
)
```

That's it. Now, when you start your application, the Main variable will automatically load all dependencies and clean up everything once the scope closes.

## Child scopes

While the root scope can already handle a lot of use-cases, sometimes having sub-scopes with additional data is very useful.

Sub-scopes will re-use, when possible, the services from parent scopes. As such, if a service is, for example, already mounted on the root scope, the service will not be mounted again and will re-use the cached value.

### Example

In this section, we will discover how to create a request based scope.

TODO

## Documentation

Please visit the [documentation](https://nx-apoyo.netlify.app/guide/decoders/getting-started.html) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
