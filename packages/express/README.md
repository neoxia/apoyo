# Apoyo - Express

HTTP server utilities for express.

## Features

- Better async support for handlers

```ts
const getHealth = Request.reply(async () => {
  return Http.Ok({
    message: 'Everything is alright'
  })
})
```

- Dependency injection integration with `@apoyo/scopes`

```ts
const listTodos = Request.reply(
  TodoService.$findAll, 
  async (req, findTodos) => {
    const todos = await findTodos()
    return Http.Ok(todos)
})
```

- Validation with `@apoyo/decoders`

```ts
const TodoCreateDto = ObjectDecoder.struct({
  title: TextDecoder.string,
  completed: BooleanDecoder.boolean
})

const createTodo = Request.reply(
  TodoService.$createTodo,
  (req, createTodo) => {
    const dto = Request.validate(req.body, TodoCreateDto)
    const saved = await createTodo(body)
    return Http.Created(saved)
})
```

- Easier routing configuration:

```ts
const todoRoutes = Route.group('/todos', {
  children: [
    Route.get('/', listTodos),
    Route.get('/:id', getTodo),
    Route.post('/', createTodo)
  ]
})

const routes = Route.group({
  middlewares: [],
  children: [
    Route.get('/health', getHealth),
    todoRoutes
  ]
})
```

- Easier error catching and handling:

```ts
// You can create error handlers easily: dependency injection works here as well!
const catchAll =
  Request.catch(
    [$logger],
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

- Exception filtering can be done via error catchers

```ts
const catchCustomErrors = Request.catch((err) => {
  if (err instanceof AccessException) {
    throw Http.Forbidden({ 
      message: err.message 
    })
  }
  // Re-throw non-http error to continue to the next error handler
  throw err
})

const todoRoutes = Route.group('/todos', {
  children: [
    Route.get('/', ListTodos),
    Route.get('/:id', GetTodo),
    Route.post('/', CreateTodo)
  ],
  catch: [
    // They can also be added for a specific group of routes. 
    // This error handler will not be executed for /health for example.
    catchCustomErrors
  ]
})
```

- Easy to setup from scratch:

```ts
const $router = Express.createRouter(routes)

const $config = Injectable.of({
  port: 3000
})

// Returning our app without starting it allows us to:
// - Easily combine multiple apps if necessary.
// - Test our endpoints with the "supertest" package.
const $app = Injectable.define([$router], (router) => {
  const app = express()

  // Configure your express app
  ...
  app.use(router)

  return app
})

// We start our application on the given port
const $server = Express.createServer($app, $config)

// This example has been simplified.
// As such, it does not listen to exit signals to gracefully exit the app.
// Usually, you should call `container.close` to close the resources that have been opened.
async function main () {
  const container = Container.create()
  await container.get($server)
}

main()
```

- Easy to integrate in existing applications: you only need a `Container` instance to create the router middleware

```ts
const app = express()

// Configure your express app
...

// Create new container for your application and register router
const $router = Express.createRouter(routes)
const container = Container.create()
const router = await container.get($router)

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
