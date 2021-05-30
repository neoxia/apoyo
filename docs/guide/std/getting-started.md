# Getting Started

**Warning**: This package is still in development and features may still change, be renamed or removed.

However, we would appreciate any feedback you have on how to improve this library:

- Which features are missing?
- Which features are hard to understand or unnecessary?
- Which features need to be improved?

## Installation

`npm install @apoyo/std`

## Examples

- Chaining errors:

```ts
const users = await pipe(
  findUsers(),
  Prom.mapError(Err.chain('findUsers failed'))
)
```

- Execute `Promise`s in sequence or concurrently:

```ts
await pipe(
  tasks,
  Task.concurrent(4),
  Task.run
)
```

- Accumulate results without throwing:

```ts

const operation = (value) => {
  if (value < 0) {
    throw new Error('number should be positive')
  }
  return value
}

const [ok, ko] = pipe(
  [1,-2,3],
  Arr.map(Result.tryCatchFn(operation)),
  Arr.separate
)

expect(ok).toEqual([1,3])
expect(ko).toEqual([-2])
```

- And more...
