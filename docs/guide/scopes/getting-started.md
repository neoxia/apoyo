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

- Powerful scope shutdown mechanism

- Easier testability

## How this library works

As this library is very different from existing DI libraries, you will first need to understand in which way it is different.

### Javascript scopes

In fact, this dependency injector has heavily inspired itself from how Javascript scopes work:

[javascript scopes](./images/scopes-js.jpg)

1. The `root` function does not take any parameters.

2. All variables declared in the `root` scope (like `userRepository`) will be available in the `request` function.

3. The `request` function takes a parameter `req`.

4. The `req` variable is only available to the scope of the `request` function.

5. The variable `body` is also only available in the `request` function. We could not declare this variable in the `root` function, because it depends on `req`.

6. Each time the `request` function is called, Javascript creates a new scope, in which `req` is equal to the given value, and `body` is computed based on this value.

### Apoyo scopes

`@apoyo/scopes` work quite a bit like Javascript scopes: You can create scopes and sub-scopes, and you can bind values to variables when creating those scopes.

But instead of manually having to declare and write variables, the library will **automatically deduce** into which scope your variable needs to be **declared** / **mounted**, depending on it's dependencies.

As such, if you create for example a sub-scope for each request, which binds the variable named `Req` to the currently ongoing request, all variables depending on `Req` will be mounted in this sub-scope.

Here a schema to illustrate this in more details:

[apoyo scopes](./images/scopes-apoyo.jpg)

### Summary

- `Var`s are like injectables, and you can inject any other `Var` that you have declared.

- `Var`s are cached in the scope it has been mounted on.

- `Scope`s are like containers, with a few important differences:
  - Scopes may also have sub-scopes.
  - Sub-scopes may mount `Var`s into parent scopes, if this `Var` can be mounted at a higher scope.
  - Scopes track all `Var`s that need to be unmounted / closed.

## Example

**Note**: The entire source code of the examples will be available under the *examples/scopes* folder.

### Declare variables

First, we will need to declare some `Var`s:

```ts
const Env = pipe(
  Var.inject(),
  Var.mapWith(async () => {
    // Load env variables from .env files
    // Validate env variables
    // etc...
    return process.env as Dict
  })
)

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
  Var.mapWith(() => {
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
  Var.mapWith(() => {
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
  Var.mapWith(async (config, routes) => {

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
```

Once all the variables you need have been created, you need to create a scope that will host / manage these variables for you.

### Create scope manually

```ts
const main = async () => {
  const scope = pipe(
    Scope.create(),
    Scope.get
  )
  
  try {
    await scope.get(API)

    // Optionally, we cannot also add logic to await the end of the process and close the server gracefully.
    // Check out the examples for an example implementation.
  } catch (err) {
    await scope.close()
    throw err
  }
}

main()
```

### Create and run scope automatically

```ts
const Main = pipe(
  Var.sequence([
    API
  ]),
  Var.map(async () => {
    // Await the end of the process.
    // Check out the examples for an example implementation.
    await Process.end()
  })
)

pipe(
  Scope.create(),
  Scope.run(Main)
)
```

That's it. Now, when you start your application, a scope will be created that will load the given variable and all his dependencies.

### Child scopes

TODO
