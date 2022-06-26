# Containers

A scope contains all injectable that have been loaded until now. As such, a scope is very similar to the "Container" implementation you may know from other libraries.

There are however a few big differences:

- You may only re-bind / mock injectables when creating the scope.

- Once the container has been created, it is not possible to change it anymore.

- ... and a few more that we will cover later.

## Creating a container

```ts
const $env = Injectable.define(async () => {
  // Load .env files, ..
  return process.env
})

// Create a new root scope
const container = Container.create({
  bindings: []
})

// Get the value of the injectable. 
// Once an injectable has been loaded for a given scope, it will stay loaded until the scope is destroyed.
const env = await container.get($env)
```

## Closing a scope

```ts
// Create new root scope
const scope = Scope.create()

// Load injectables, etc...

// Close all loaded resources
await scope.close()
```
