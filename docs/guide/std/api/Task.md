# Task overview

This namespace contains various utilities for `Task`s.

A `Task` represents a **lazy** asynchroneous action.

## Summary

[[toc]]

## Types

### Task

```ts
type Task<T = any> = PromiseLike<T> & { _tag: 'Task' }
```

## Functions

### Task.isTask

#### Description

Check if variable is a task

```ts
<A>(value: unknown) => value is Task<A>
```

### Task.of

#### Description

Creates a resolving `Task`

```ts
(): Task<void>
<A>(value: A): Task<A>
```

### Task.resolve

#### Description

Creates a resolving `Task`

```ts
(): Task<void>
<A>(value: A): Task<A>
```

### Task.reject

#### Description

Creates a rejecting `Task`

```ts
(value: unknown) => Task<never>
```

### Task.run

#### Description

Runs a `Task`

```ts
<A>(task: Task<A>) => Promise<A>
```

### Task.sleep

#### Description

Creates a `Task` that waits a specific amount of milliseconds before resolving.

```ts
(ms: number) => Task<void>
```

#### References
- `Task.delay`

### Task.delay

#### Description

Taps the `Task` and delays the resolving by a specific amount of milliseconds.

```ts
(ms: number) => <A>(task: Task<A>) => Task<A>
```

#### Example
```ts
const result = await pipe(
  Task.of(42),
  Task.delay(1000), // Waits 1 second before resolving 42
  Task.run
)

expect(result).toBe(42)
```

#### References
- `Task.sleep`

### Task.map

#### Description

Maps over the value of a resolving `Task`.

```ts
<A, B>(fn: (value: A) => B) => (task: Task<A>) => Task<B>
```

#### Example
```ts
const result = await pipe(
  Task.of(1),
  Task.map(a => a + 1),
  Task.run
)

expect(result).toBe(2)
```

#### References
- `Task.mapError`
- `Task.chain`

### Task.mapError

#### Description

Maps over the error of a rejecting `Task`.

```ts
<A>(fn: (err: unknown) => unknown) => (task: Task<A>) => Task<A>
```

#### Example
```ts
try {
  await pipe(
    Task.reject(Err.of('some error')),
    Task.mapError(Err.chain('could not execute xxxx')),
    Task.run
  )
} catch (err) {
  expect(err.message).toBe("could not execute xxxx: some error")
}
```

#### References
- `Task.map`
- `Task.catchError`

### Task.chain

#### Description

Chain a `Task` or any other `PromiseLike` to execute when the `Task` resolves.

```ts
<A, B>(fn: (value: A) => PromiseLike<B>) => (task: Task<A>) => Task<B>
```

#### Example
```ts
const result = await pipe(
  Task.of(1),
  Task.chain(a => pipe(
    Task.of(a + 1),
    Task.delay(1000)
  )),
  Task.run
)

expect(result).toBe(2)
```

#### References
- `Task.map`
- `Task.catchError`

### Task.catchError

#### Description

Chain another `Task` to execute when the `Task` rejects.

```ts
<A, B>(fn: (err: unknown) => PromiseLike<B>) => (task: Task<A>) => Task<A | B>
```

#### Example
```ts
const result = await pipe(
  Task.reject(Err.of('some error', { name: 'SomeError' })),
  Task.catchError(err =>
    pipe(err, Err.hasName('SomeError'))
     ? Task.of('success')
     : Task.reject('reject')
  ),
  Task.run
)

expect(result).toBe('success')
```

#### References
- `Task.mapError`
- `Task.chain`

### Task.tap

#### Description

When the tasks resolves, execute a side-effect on the current value without modifying the value

```ts
<A, B>(fn: (value: A) => B | PromiseLike<B>) => (task: Task<A>) => Task<A>
```

#### Example
```ts
const result = await pipe(
  Task.of(42),
  Task.tap(value => console.log('received value', value)),
  Task.map(a => a + 1)
)

expect(result).toBe(43)
```

### Task.tapError

#### Description

When the task rejects, execute a side-effect on the current error without modifying the error

```ts
<A, B>(fn: (value: A) => B | PromiseLike<B>) => (task: Task<A>) => Task<A>
```

#### Example
```ts
const [, error] = await pipe(
  Task.reject(new Error('Internal error')),
  Task.tapError(err => console.error('An error occured', err)),
  Task.tryCatch,
  Task.map(Result.mapError(Err.toError)),
  Task.map(Result.tuple)
)

expect(error?.message).toBe('Internal error')
```

### Task.all

#### Description

Combine an array of `Task`s into a single `Task`.
This function will execute all tasks in parallel.

```ts
<A>(tasks: Array<Task<A>>) => Task<Array<A>>
```

#### Example
```ts
const results = await pipe(
  [Task.of(1), Task.of(2), Task.of(3)],
  Task.all,
  Task.run
)

expect(results).toEqual([1,2,3])
```

#### References
- `Task.sequence`
- `Task.concurrent`

### Task.sequence

#### Description

Combine an array of `Task`s into a single `Task`.
This function will execute all tasks in sequence.

```ts
<A>(tasks: Array<Task<A>>) => Task<Array<A>>
```

#### Example
```ts
const results = await pipe(
  [Task.of(1), Task.of(2), Task.of(3)],
  Task.sequence,
  Task.run
)

expect(results).toEqual([1,2,3])
```

#### References
- `Task.all`
- `Task.concurrent`

### Task.concurrent

#### Description

Combine an array of `Task`s into a single `Task`.
This function will execute all tasks in concurrency.

```ts
(concurrency: number) => <A>(tasks: Array<Task<A>>) => Task<Array<A>>
```

#### Example
```ts
const results = await pipe(
  [Task.of(1), Task.of(2), Task.of(3)],
  Task.concurrent(2),
  Task.run
)

expect(results).toEqual([1,2,3])
```

#### References
- `Task.all`
- `Task.sequence`

### Task.tryCatch

#### Description

Try/catch a `Task`:
- A `Task` that resolves will return an `Ok`.
- A `Task` that rejects will return a `Ko` instead of throwing.

```ts
<A, E = unknown>(task: Task<A>) => Task<any>
```

#### Example
```ts
const result = await pipe(
  Task.reject(4),
  Task.tryCatch
)

expect(result).toEqual(Result.ko(4))
```

### Task.thunk

#### Description

Creates a `Task` from a thunk.
If the thunk throws, `fromIO` will catch the error and create a `Task` that rejects.

```ts
<A>(fn: () => A | PromiseLike<A>) => Task<A>
```

### Task.from

#### Description

Creates a `Task` from a `PromiseLike`.

```ts
<A>(promise: PromiseLike<A>) => Task<A>
```

### Task.struct

#### Description

Merge a struct of `Task`s into a single `Task`.

```ts
<A extends any>(obj: A, strategy: Task.Strategy<any>): Task.Struct<A>
(obj: any, strategy: Task.Strategy<any>): Task<any>
(strategy: Task.Strategy<any>): <A extends any>(obj: A) => Task.Struct<A>
(strategy: Task.Strategy<any>): (obj: any) => Task<any>
```

#### Example
```ts
const relations = await pipe(
  {
    profiles: Task.thunk(() => findProfilesByUserId(userId)),
    permissions: Task.thunk(() => findPermissionsByUserId(userId)),
    posts: Task.thunk(() => findPostsByUserId(userId)),
    friends: Task.thunk(() => findFriendsByUserId(userId)),
  },
  Task.struct(Task.concurrent(2)),
  Task.run
)
```

#### References
- `Prom.struct`

### Task.timeout

#### Description

Timeout a task after the given amount of milliseconds.

```ts
<A>(ms: number, fn: () => A | PromiseLike<A>) => (task: Task<A>) => Task<A>
```

#### Example
```ts
const original = pipe(
  Task.sleep(10000),
  Task.map(() => "Hello!")
)

const withTimeout = await pipe(
  original,
  Task.timeout(5000, Task.reject(Err.of('Timeout!'))),
  Task.tryCatch,
  Task.run
)

expect(pipe(withTimeout, Result.isKo)).toBe(true)
```

### Task.taskify

#### Description

Transforms a function into a function returning a `Task`.

```ts
<Args extends Array<any>, R>(fn: (...args: Args) => R | PromiseLike<R>) => (...args: Args) => Task<R>
```

#### Example
```ts
const operation = async (a: number, b: number) => {
  ...
}
const lazyOperation = Task.taskify(operation)

// Create task - Operation not yet executed
const task = lazyOperation(10, 20)

// Execute task
const result = await task
```

### Task.retry

#### Description

Retry a task with the given retry strategy

```ts
(strategy: Task.RetryStrategy) => <A>(task: Task<A>) => Task<A>
```

#### Example
```ts
// Get random number and retry until we get a positiv number, with a maximum of 10 tries.
const positiveNumber = await pipe(
  Task.thunk(() => Math.random()),
  Task.chain((nb) =>
    nb > 0
      ? Task.resolve(nb)
      : Task.reject(
          Err.of('Number is negative', {
            code: 'negative_number',
            value: nb
          })
        )
  ),
  Task.retry((err, attempt) => {
    if (attempt > 10) {
      return Task.reject(err)
    }
    if (err.code === 'negative_number') {
      return Task.sleep(1000)
    }
    return Task.reject(err)
  })
)
```

### Task.retryBy

#### Description

Retry a task with the given retry options.
This function is based on the `Task.retry` function.

```ts
(options: Task.RetryOptions) => <A>(task: Task<A>) => Task<A>
```

#### Example
```ts
// Get random number and retry until we get a positiv number, with a maximum of 10 tries.
const positiveNumber = await pipe(
  Task.thunk(() => Math.random()),
  Task.chain((nb) =>
    nb > 0
      ? Task.resolve(nb)
      : Task.reject(
          Err.of('Number is negative', {
            code: 'negative_number',
            value: nb
          })
        )
  ),
  Task.retryBy({
    attemps: 10,
    delay: 1000,
    when: err => err.code === 'negative_number'
  })
)
```

