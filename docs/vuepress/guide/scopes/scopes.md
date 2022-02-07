# Scopes / Containers

A scope contains all injectable that have been loaded until now. As such, a scope is very similar to the "Container" implementation you may know from other libraries.

There are however a few big differences:

- You may only re-bind / mock injectables when creating the scope.

- Once the scope has been created, it is not possible to change it anymore.

- A scope may have sub-scopes.

- ... and a few more that we will cover later.

In fact, this dependency injector has heavily inspired itself from how Javascript scopes work:

![javascript scopes](./images/scopes-javascript.png)

## Creating a scope

```ts
const Env = Injectable.thunk(async () => {
  // Load .env files, ..
  return process.env
})

// Create a new root scope
const scope = Scope.create({
  bindings: []
})

// Get the value of the injectable. 
// Once an injectable has been loaded for a given scope, it will stay loaded until the scope is destroyed.
const env = await scope.get(Env)
```

## Creating a sub-scope

There are 2 ways to create a sub-scope:

1. From the root scope

```ts
const factory = scope.factory()

const childScope = factory.create()
```

**Note**: It is always better to use a same factory to create a list of child scopes, as each factory you create mounts a new resource that will only cleanup when the scope is closed.

2. From an injectable

```ts
// Declare abstract injectables that will be implemented by the sub-scope
const Req = Injectable.abstract<Express.Request>('Request')

// Do not use in production! This example has been heavily simplified and does not handle errors correctly

const HttpFactory = Scope.Factory()

const HttpHandler = (injectable: Injectable<{ status: number, body: any }>) => {
  return pipe(
    Injectable.struct({
      factory: HttpFactory
    })
    Injectable.map(({ factory }) => {
      return (req: Express.Request, res: Express.Response) => {
        const result = factory.run(injectable, {
          bindings: [
            Scope.bind(Req, req)
          ]
        })
        res.status(result.status).json(result.body)
      }
    })
  )
}

// Example

const GetHealth = pipe(
  Injectable.empty,
  Injectable.map(() => ({
    status: 'OK',
    message: 'All services are online'
  }))
)

const HealthRoutes = pipe(
  Injectable.struct({
    getHealth: HttpHandler(GetHealth)
  }),
  Injectable.map(handlers => {
    const route = Router()

    route.get('/', handlers.getHealth)

    return route
  })
)
```

## In which scope is an injectable mounted?

The library will **automatically deduce** into which scope your injectable needs to be **mounted**, depending on it's dependencies:

- An injectable will always try to mount in the highest scope possible:
  - *Example: If the injectable does not have any dependencies, it will always be mounted in the root scope.*

- An injectable will always be mounted at the scope of the dependency with the lowest scope:
  - *Example: If the injectable has 2 dependencies A and B, with A being in the root scope and B in a sub-scope of root ("request"), the injectable will be mounted in the request scope.*

## Closing a scope

```ts
// Create new root scope
const scope = Scope.create()

// Load injectables, etc...

// Close all loaded resources
await scope.close()
```
