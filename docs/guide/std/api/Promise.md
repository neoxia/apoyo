# Promise overview

This namespace contains various utilities for `Promise`s, as well as pipeable versions of most native methods.

A `Promise` represents an **eager** asynchroneous action.

## Summary

[[toc]]

## Functions

### Prom.of

#### Description

Creates a promise that resolves.

```ts
<A>(value: A) => Promise<A>
```

### Prom.resolve

#### Description

Creates a promise that resolves.

```ts
<A>(value: A) => Promise<A>
```

### Prom.reject

#### Description

Creates a promise that rejects.

```ts
<A>(value: A) => Promise<never>
```

### Prom.thunk

#### Description

Creates a promise from a thunk.
If the thunk throws, `fromIO` will catch the error and create a promise that rejects.

```ts
<A>(fn: () => A | PromiseLike<A>) => Promise<A>
```

### Prom.sleep

#### Description

Creates a promise that waits a specific amount of milliseconds before resolving.

```ts
(ms: number) => Promise<void>
```

#### References
- `Prom.delay`

### Prom.delay

#### Description

Taps the promise and delays the resolving by a specific amount of milliseconds.

```ts
(ms: number) => <A>(prom: PromiseLike<A>) => Promise<A>
```

#### Example
```ts
const result = await pipe(
  Prom.of(42),
  Prom.delay(1000) // Waits 1 second before resolving 42
)
```

#### References
- `Prom.sleep`

### Prom.map

#### Description

Maps over the value of a resolving promise.

```ts
<A, B>(fn: (value: A) => Prom.Not<B>) => (promise: PromiseLike<A>) => Promise<Prom.Not<B>>
```

#### Example
```ts
const result = await pipe(
  Prom.of(1),
  Prom.map(a => a + 1)
)

expect(result).toBe(2)
```

#### References
- `Prom.mapError`
- `Prom.chain`

### Prom.mapError

#### Description

Maps over the error of a rejecting promise.

```ts
<B>(fn: (err: any) => Prom.Not<B>) => <A>(promise: PromiseLike<A>) => Promise<A>
```

#### Example
```ts
try {
  await pipe(
    Prom.reject(Err.of('some error')),
    Prom.mapError(Err.chain('could not execute xxxx'))
  )
} catch (err) {
  expect(err.message).toBe("could not execute xxxx: some error")
}
```

#### References
- `Prom.map`
- `Prom.catchError`

### Prom.chain

#### Description

Chain another promise to execute when the promise resolves.

```ts
<A, B>(fn: (value: A) => PromiseLike<B>) => (promise: PromiseLike<A>) => Promise<B>
```

#### Example
```ts
const result = await pipe(
  Prom.of(1),
  Prom.chain(a => pipe(
    Prom.of(a + 1),
    Prom.delay(1000)
  ))
)

expect(result).toBe(2)
```

#### References
- `Prom.map`
- `Prom.catchError`

### Prom.catchError

#### Description

Chain another promise to execute when the promise rejects.

```ts
<B>(fn: (err: any) => PromiseLike<B>) => <A>(promise: PromiseLike<A>) => Promise<B | A>
```

#### Example
```ts
const result = await pipe(
  Prom.reject(Err.of('some error', { name: 'SomeError' })),
  Prom.catchError(err =>
    pipe(err, Err.hasName('SomeError'))
     ? Prom.of('success')
     : Prom.reject('reject')
  )
)

expect(result).toBe('success')
```

#### References
- `Prom.mapError`
- `Prom.chain`

### Prom.then

#### Description

Pipeable version of the native Promise.then function.

```ts
<A, B>(fn: (value: A) => B | PromiseLike<B>) => (promise: PromiseLike<A>) => Promise<B>
```

### Prom.tap

#### Description

When the promise resolves, execute a side-effect on the current value without modifying the value

```ts
<A, B>(fn: (value: A) => B | PromiseLike<B>) => (promise: PromiseLike<A>) => Promise<A>
```

#### Example
```ts
const result = await pipe(
  Prom.of(42),
  Prom.tap(value => console.log('received value', value)),
  Prom.map(a => a + 1)
)

expect(result).toBe(43)
```

### Prom.tapError

#### Description

When the promise rejects, execute a side-effect on the current error without modifying the error

```ts
<B>(fn: (err: any) => B | PromiseLike<B>) => <A>(promise: PromiseLike<A>) => Promise<A>
```

#### Example
```ts
const [, error] = await pipe(
  Prom.reject(new Error('Internal error')),
  Prom.tapError(err => console.error('An error occured', err)),
  Prom.tryCatch,
  Prom.map(Result.mapError(Err.toError)),
  Prom.map(Result.tuple)
)

expect(error?.message).toBe('Internal error')
```

### Prom.all

#### Description

Combine an array of promises into a single promise.
As promises are eager and executed directly, all promises are executed in parallel.

To execute promises in sequence / in concurrency, use `Task`s.

```ts
<A>(promises: Array<PromiseLike<A>>) => Promise<Array<A>>
```

#### Example
```ts
const results = await pipe(
  [Prom.of(1), Prom.of(2), Prom.of(3)],
  Prom.all
)

expect(results).toEqual([1,2,3])
```

#### References
- `Task.all`
- `Task.sequence`
- `Task.concurrent`

### Prom.tryCatch

#### Description

Try/catch a promise:
- A promise that resolves will return an `Ok`.
- A promise that rejects will return a `Ko`.

```ts
<A, E = unknown>(promise: PromiseLike<A>) => Promise<any>
```

#### Example
```ts
const result = await pipe(
  Prom.reject(4),
  Prom.tryCatch
)

expect(result).toEqual(Result.ko(4))
```

### Prom.struct

#### Description

Merge a struct of `Promise`s into a single `Promise`.

```ts
<A extends any>(obj: A): Prom.Struct<A>
(obj: any): Promise<any>
```

#### Example
```ts
const relations = await pipe(
  {
    profiles: findProfilesByUserId(userId),
    permissions: findPermissionsByUserId(userId),
    posts: findPostsByUserId(userId),
    friends: findFriendsByUserId(userId),
  },
  Prom.struct
)
```

#### References
- `Task.struct` if you want to limit concurrency

### Prom.timeout

#### Description

Timeout a promise after the given amount of milliseconds.

```ts
<A>(ms: number, fn: () => A | PromiseLike<A>) => (promise: PromiseLike<A>) => Promise<A>
```

#### Example
```ts
const original = pipe(
  Prom.sleep(10000),
  Prom.map(() => "Hello!")
)

const withTimeout = await pipe(
  original,
  Prom.timeout(5000, () => Prom.reject(Err.of('Timeout!'))),
  Prom.tryCatch
)

expect(pipe(withTimeout, Result.isKo)).toBe(true)
```

