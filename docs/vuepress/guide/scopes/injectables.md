# Injectables

In IOCs, we **mostly** use classes to define our services / repositories / etc...

In this library, an injectable can contain **any variable** you need:

- Functions / Async functions
- Values
- etc...

All functions for creating and managing these are available in the `Injectable` namespace.

## Create an injectable

There are multiple ways to create an injectable.

1. From a constant:

```ts
const $mockConfig = Injectable.of<Config>({
  api: {
    port: 3000
  }
})
```

2. From a function:

```ts
const $env = Injectable.define(async () => {
  // This function may also be asynchroneous
  // Load env
  return process.env
})
```

3. As an abstract value:

```ts
interface ILogger {
  log(message: string): void
}

const $logger = Injectable.abstract<ILogger>("ILogger")
```

There are a lot of use-cases where it is useful to write code for a given interface instead of an implementation. `Injectable.abstract` can be used to cover for this situation.

**Warning**: You will need to **bind** this abstract injectable to a specific value or to another injectable when creating a scope, or you will receive a **runtime error** when this abstract injectable is loaded.

It is also possible to specify a default implementation to use for this abstract injectable:

```ts
interface ILogger {
  log(message: string): void
}

const $noopLogger = Injectable.of<ILogger>({
  log: (_message: string) => {}
})

const $logger = Injectable.abstract<ILogger>("ILogger", $noopLogger)
```

## Dependencies

Most of the time, you will need to create injectables based on other injectables:

```ts
const $config = Injectable.define($env, env => {
  return {
    api: {
      port: env.API_PORT
    }
  }
})
```

If you require multiple dependencies, simply add more parameters:

```ts
const $a = Injectable.of(1)
const $b = Injectable.of(2)
const $c = Injectable.define([$a, $b], (a, b) => a + b)
```

## Unwrapping

1. You can use `Injectable.array` to combine an array of injectables into a single injectable:

```ts
const $a = Injectable.of(1)
const $b = Injectable.of(2)

// Returns Injectable<number[]>
const $c = Injectable.array([
  $a,
  $b
])
```
