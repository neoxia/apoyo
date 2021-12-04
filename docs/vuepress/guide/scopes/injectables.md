# Injectables

In IOCs, we **mostly** use classes to define our services / repositories / etc...

In this library, an injectable can contain **any variable** you need:

- Functions / Async functions
- Values
- etc...

As such, we will refer to these as "*Injectable variables*".
All functions for creating and managing these are available in the `Var` namespace.

## Create an injectable variable

There are multiple ways to create an injectable variable.

1. From a constant:

```ts
const MockConfig = Var.of<Config>({
  api: {
    port: 3000
  }
})
```

These may be used to mock injectables.

2. From a function without any parameters (without any dependencies):

```ts
const Env = Var.thunk(async () => {
  // This function may also be asynchroneous
  // Load env
  return process.env
})
```

These may be used to create injectables **that do not depend** on any other injectable.
Another advantage compared to `Var.of` is that `Var.thunk` is lazy, and will only execute the function if the injectable is required / loaded.

3. As an abstract value:

```ts
interface ILogger {
  log(message: string): void
}

const ILogger = Var.abstract<ILogger>("ILogger")
```

There are a lot of use-cases where it is useful to write code for a given interface instead of an implementation. `Var.abstract` can be used to cover for this situation.

**Warning**: You will need to **bind** this abstract injectable to a specific value, or to another implemented injectable when creating a scope, or you will receive a **runtime error** when this abstract injectable is loaded.

It is also possible to specify a default implementation to use for this abstract injectable:

```ts
interface ILogger {
  log(message: string): void
}

const NoopLogger = Var.of<ILogger>({
  log: (_message: string) => {}
})

const ILogger = pipe(
  Var.abstract<ILogger>("ILogger"),
  Var.default(NoopLogger)
)
```

## Creating injectables based on other injectables

Most of the time, you will need to create injectable variables based on other injectables.

For those situations, you will need to use `Var.map`:

```ts
const Config = pipe(
  Env,
  Var.map(env => {
    return {
      api: {
        port: env.API_PORT
      }
    }
  })
)
```

`Var.map` allows us create a new injectable `Var<B>` from an injectable `Var<A>`.

If you require multiple dependencies, you have 2 possibilities:

1. You can use `Var.struct` to combine multiple injectable variables into a single variable. This single variable can then be mapped:

```ts
const A = Var.of(1)
const B = Var.of(2)

const C = pipe(
  Var.struct({
    a: A,
    b: B
  }),
  Var.map(({ a, b }) => a + b)
)
```

2. You can use `Var.tuple` to combine multiple injectable variables into a single tuple. This single variable can then be mapped:

```ts
const A = Var.of(1)
const B = Var.of(2)

const add = (a: number, b: number) => a + b

const C = pipe(
  Var.tuple(A, B),
  Var.map(([a, b]) => add(a, b))
)
```

As it may become cumbersome to "untuple" the parameters of your function, you may also want to use `Var.mapArgs` in conjunction with `Var.tuple`. This allows you to more easily extract logic into a separate function:

```ts
const C = pipe(
  Var.tuple(A, B),
  Var.mapArgs(add)
)
```

## Creating a disposable variable

Sometimes, you may want to create a variable that needs to be closed / disposed when it is not used anymore.

*Example: Database connections, Http servers, etc...*

This type of variable can be created in the following way:

```ts
const Api = pipe(
  Var.struct({
    config: ApiConfig
  }),
  Var.resource(({ config }) => {

    const app = express()

    const server = app.listen(config.port)

    const close = async () => {
      return new Promise((resolve, reject) => {
        server.close((err) => err ? reject(err) : resolve(err))
      })
    }

    return Resource.of(app, close)
  })
)
```

**Note**: The variable will only be disposed when the scope into which the variable has been mounted is closed.

## Switching between multiple injectables

Sometimes, we may want to dynamically switch between multiple implementations based on another injectable.
In those cases, you may use `Var.chain`:

```ts
const FileProvider = pipe(
  Env,
  Var.chain(env => {
    const provider = env.FILE_PROVIDER
    if (provider === 'aws') return S3FileProvider
    if (provider === 'azure') return AzureFileProvider 
    throw new Error(`Unimplemented file provider ${JSON.stringify(provider)}`)
  })
)
```

**Note**: Variables that are not returned are not loaded. As such, this operation is more efficient than loading all injectables and switching on their values.

## Dynamically create an injectable

Abstracts help you create injectables for a specific interface. This also means that it can only have 1 implementation at a time.

Sometimes, you may need to create multiple injectables per scope depending on a dynamic value.
In this case, you can simply create a function returning a new injectable:

```ts
const forParam = (name: string) => pipe(
  Request,
  Var.map(req => req.params[name])
)

const Params = {
  Id: forParam('id'), // Var<string>
  Slug: forParam('slug') // Var<string>
}
```

**Note**: Each injectable has his own "reference". If you call the same function `forParam` twice with the same parameters, it will return 2 different injectables. This means that those injectable will be re-computed when called.
