# Apoyo - Express

HTTP server utilities for express.

## Features

- Better async support for handlers

```ts
const GetHealth = Request.reply(async () => {
  return Http.Ok({
    status: 'OK',
    message: 'Everything is alright'
  })
})
```

- Dependency injection integration with `@apoyo/scopes`

```ts
const ListTodos = Request.reply(TodoService, async (todoService) => {
  const todos = await todoService.findAll()
  return Http.Ok(todos)
})
```

- Validation with `@apoyo/decoders`

```ts
// TODO
```

- Easier routing configuration:

```ts
const todoRoutes = Route.group('/todos', {
  children: [
    Route.get('/', ListTodos),
    Route.get('/:id', GetTodo),
    Route.post('/', CreateTodo)
  ]
})

const routes = Route.group({
  middlewares: [],
  children: [
    Route.get('/health', GetHealth),
    todoRoutes
  ]
})
```

- Easier error catching and handling:

```ts
// You can create error handlers easily: dependency injection works here as well!
const catchAll =
  Request.catch(
    Logger,
    async (err, logger) => {
      logger.error('An internal error occured while executing HTTP request', err)
      throw err
    }
  )

const routes = Route.group({
  middlewares: [],
  children: [
    Route.get('/health', GetHealth),
    todoRoutes
  ],
  catch: [
    // Add error catchers here!
    catchAll
  ]
})

```

- Exception filtering and mapping included. **This feature may still be removed if it is not useful enough.**

```ts
// Exception filters can be used to transform specific types of errors into HTTP responses
const catchByFilters = Request.catchFilters([
  ExceptionFilter.instanceOf(AccessException, (err) => Http.Forbidden({ 
    message: err.message 
  })),
  ExceptionFilter.instanceOf(ValidationException, (err) => Http.UnprocessableEntity({
    message: err.message, 
    errors: err.errors
  }))
])

const todoRoutes = Route.group('/todos', {
  children: [
    Route.get('/', ListTodos),
    Route.get('/:id', GetTodo),
    Route.post('/', CreateTodo)
  ],
  catch: [
    // They can also be added for a specific group of routes. 
    // This error handler will not be executed for /health for example.
    catchByFilters
  ]
})
```

- Easy to setup:

```ts
const App = pipe(
  Injectable.struct({
    router: Express.createRouter(routes)
  }),
  Injectable.map(({ router }) => {

    const app = express()

    // Configure your express app
    ...

    // Register router
    app.use(router)

    // Return our app without starting it
    return app
  })
)

const Server = Express.createServer({
  app: App,
  config: Config
})

async function main () {
  const scope = Scope.create()
  try {
    await scope.get(Server)
  } catch (err) {
    console.error('Application has crashed', err)
  } finally {
    await scope.close()
  }
}

main()
```

- Easy to integrate in existing applications: you only need a `Scope` instance to create the router middleware

```ts
const app = express()

// Configure your express app
...

// Create new scope for your application and register router
const Router = Express.createRouter(routes)
const scope = Scope.create()
const router = await scope.get(Router)
app.use(router)

...

// Start listening to your app
app.listen(3000)

```

## Installation

Install express:
`npm install express @types/express`

Install peer dependencies:
`npm install @apoyo/std @apoyo/decoders @apoyo/scopes`

Install package:
`npm install @apoyo/express`

## Documentation

Please visit the [documentation](https://nx-apoyo.netlify.app/guide/express/getting-started.html) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
