# Result overview

A `Result` can either `Ok` or `Ko`:
- `Ok` signifies the operation succeeded
- `Ko` signifies the operation failed

A `Result`, being a simple variable, may also allow you to handle multiple operations that may fail, without throwing / stopping on the first failure

```ts
const divide = (a, b) => {
  if (b === 0) {
    throw Err.of('cannot divide {a} by {b}', { a, b })
  }
  return a / b
}

const [ok, ko] = pipe(
  [ [3,1], [3,0], [1,2], [4,0] ],
  Arr.map(([a, b]) => Result.tryCatch(() => divide(a, b))),
  Arr.separate
)
```

## Summary

[[toc]]

## Types

### Ok

```ts
interface Ok<T> {
  _tag: Tags.Ok
  ok: T
}
```

### Ko

```ts
interface Ko<T> {
  _tag: Tags.Ko
  ko: T
}
```

### Result

```ts
type Result<A, E = unknown> = Ok<A> | Ko<E>
```

## Functions

### Result.ok

#### Description

Create an `Ok` value

```ts
<T>(value: T) => Ok<T>
```

### Result.ko

#### Description

Create a `Ko` value

```ts
<T>(value: T) => Ko<T>
```

### Result.isOk

#### Description

Check if the result is `Ok`

```ts
<A, B>(result: Result<A, B>) => result is Ok<A>
```

#### Example
```ts
const result = Result.ok(1)

if (Result.isOk(result)) {
  console.log(result.ok)
}
```

### Result.isKo

#### Description

Check if the result is `Ko`

```ts
<A, B>(result: Result<A, B>) => result is Ko<B>
```

#### Example
```ts
const result = Result.ko(new Error('some error occured'))

if (Result.isKo(result)) {
  console.log(result.ko)
}
```

### Result.isResult

#### Description

Check if unknown variable is a `Result`

```ts
<A = unknown, B = unknown>(result: unknown) => result is Result<A, B>
```

### Result.fromOption

#### Description

Create a `Result` from an optional value

```ts
<E = unknown>(onNone: () => E) => <A>(option: Option<A>) => Result<A, E>
```

#### Example
```ts
const user: Result<User, Error> = pipe(
  users,
  Arr.find(u => u.id === 'xxxx'),
  Result.fromOption(() => new Error('could not find user'))
)
```

### Result.get

#### Description

Returns value if the result is `Ok`, or throws value if result is `Ko`.

```ts
<A, E = unknown>(result: Result<A, E>) => A
```

### Result.tuple

#### Description

Transforms the result into a tuple [ value, error ]

```ts
<A, E = unknown>(result: Result<A, E>) => [Option<A>, Option<E>]
```

#### Example
```ts
const [value, error] = Result.tryCatch(() => {
  throw new Error('Unknown')
})

expect(value).toBe(undefined)
expect(error?.message).toBe('Unknown')
```

### Result.map

#### Description

Map over the `Ok` value of the `Result`.
The callback is not called if the result is `Ko`.

```ts
<A, B>(fn: (value: A) => B) => <E = unknown>(result: Result<A, E>) => Result<B, E>
```

#### Example
```ts
const result = pipe(
  Result.ok(1),
  Result.map(nb => nb + 1)
)

expect(result).toEqual(Result.ok(2))
```

#### References
- `Result.mapError` - If you want to map over the `Ko` value instead

### Result.mapError

#### Description

Map over the `Ko` value of the `Result`.
The callback is not called if the result is `Ok`.

```ts
<B, E = unknown>(fn: (value: E) => B) => <A>(result: Result<A, E>) => Result<A, B>
```

#### Example
```ts
const result = pipe(
  Result.ko(new Error('some error')),
  Result.mapError(Err.chain('operation failed'))
)
```

#### References
- `Result.map` - If you want to map over the `Ok` value instead

### Result.join

#### Description

Flatten a `Result` in a `Ok` value

```ts
<A, E>(result: Result<Result<A, E>, E>) => Result<A, E>
```

#### Example
```ts
const result: Result<Result<number, Error>, unknown> = pipe(
  Result.ok(1),
  Result.map(nb => nb >= 0
    ? Result.ok(nb + 1)
    : Result.ko(new Error('only positives'))
  )
)

const after: Result<number, Error | unknown> = Result.join(result)
```

#### References
- `Result.chain` - Chain another operation returning a `Result` over an `Ok` value
- `Result.catchError` - Chain another operation returning a `Result` over an `Ko` value

### Result.chain

#### Description

Chain another operation returning a `Result` over an `Ok` value

```ts
<A, B, E = unknown>(fn: (value: A) => Result<B, E>) => (result: Result<A, E>) => Result<B, E>
```

#### Example
```ts
const result: Result<number, Error | unknown> = pipe(
  Result.ok(1),
  Result.chain(nb => nb >= 0
    ? Result.ok(nb + 1)
    : Result.ko(new Error('only positives'))
  )
)
```

#### References
- `Result.catchError` - Chain another operation returning a `Result` over an `Ko` value

### Result.catchError

#### Description

Chain another operation returning a `Result` over an `Ko` value.

```ts
<A, E = unknown>(fn: (err: E) => Result<A, E>) => (result: Result<A, E>) => Result<A, E>
```

#### Example
```ts
const result: Result<number, Error> = pipe(
  Result.ko(Err.of('some error', { name: 'SomeError' })),
  Result.catchError(err => pipe(err, Err.hasName('SomeError'))
    ? Result.ok(1)
    : Result.ko(err)
  )
)
```

#### References
- `Result.chain` - Chain another operation returning a `Result` over an `Ok` value

### Result.fold

#### Description

Fold over a `Result`:
- call `onOk` callback when the value is `Ok`
- call `onKo` callback when the value is `Ko`

```ts
<R, A, E = unknown>(onOk: (value: A) => R, onKo: (value: E) => R) => (result: Result<A, E>) => R
```

#### Example
```ts
const str = pipe(
  Result.ok(1),
  Result.fold(
    (value) => `Ok = ${value}`,
    (err: Error) => `An error occured: ${err.message}`
  )
)

expect(str).toBe(`Ok = 1`)
```

#### References
- `Result.get`

### Result.swap

#### Description

Swap `Ok` and `Ko` value

```ts
<A, E>(result: Result<A, E>) => Result<E, A>
```

#### Example
```ts
const result = pipe(
  Result.ok(1),
  Result.swap
)

expect(result).toEqual(Result.ko(1))
```

### Result.tryCatch

#### Description

Try/catch an operation. The return value becomes the `Ok`, and the thrown value becomes the `Ko`

```ts
<A>(fn: () => A) => Result<A, unknown>
```

#### Example
```ts
const divide = (a, b) => b === 0
  ? throwError(Err.of('cannot divide by zero'))
  : a / b

const result = Result.tryCatch(() => divide(1, 0))
```

#### References
- `Result.fn`

### Result.tryCatchFn

#### Description

Resultify the given function, making it return a `Result` instead of throwing / returning a normal value

```ts
<Args extends Array<any>, T>(fun: (...args: Args) => T) => (...args: Args) => Result<T, unknown>
```

#### Example
```ts
const divide = (a, b) => b === 0
  ? throwError(Err.of('cannot divide by zero'))
  : a / b

const [ok, ko] = pipe(
  [ [1,2], [3,0], [2,3], [4,0] ],
  Arr.map(Result.tryCatchFn(([a, b]) => divide(a, b))),
  Arr.separate
)
```

#### References
- `Result.tryCatch`

### Result.unionBy

#### Description

Takes a list of value as an input.
Applies the function one by one, and returns the first succeeding `Result` or all errors

```ts
<T, A, E>(fn: (member: T, index: number) => Result<A, E>) => (members: NonEmptyArray<T>) => Result<A, Array<E>>
```

#### Example
```ts
const numbers = [-2, -3, 1, -7, -12, -6]

const firstPositive = Result.unionBy(nb => nb >= 0
  ? Result.ok(nb)
  : Result.ko(`${nb} is negative`)
)

expect(pipe([-2, -3, 1, -7, -12], firstPositive)).toBe(1)
expect(pipe([-2, -3, -7, -12], firstPositive)).toEqual([
  `-2 is negative`,
  `-3 is negative`,
  `-7 is negative`,
  `-12 is negative`
])
```

### Result.union

#### Description

Returns the first succeeding `Result` or all errors

```ts
<A, E>(members: NonEmptyArray<Result<A, E>>) => Result<A, Array<E>>
```

#### Example
```ts
const results = [Result.ko(`-2 is negative`), Result.ko(`-3 is negative`), Result.ok(1)]

expect(pipe(results, Result.union, Result.get)).toBe(1)
```

### Result.structBy

#### Description

Takes an object of values as an input and applies a function to all properties, to transform each property to a `Result`.
If all properties are `Ok`, return an `Ok` with all values.
If one or more properties are `Ko`, return the list of errors.

```ts
<T, A, E>(fn: (prop: T, key: string) => Result<A, E>) => (props: any) => Result<any, Array<E>>
```

#### Example
```ts
const parseNbs = Result.structBy((prop, key) => {
  const nb = parseInt(prop)
  return isNaN(nb)
    ? Result.ko(Err.of(`Invalid number {value} at property {key}`, { value, key }))
    : Result.ok(nb)
})

const result1 = pipe(
  {
    a: "13",
    b: "24",
    d: "6"
  },
  parseNbs
)

expect(pipe(result1, Result.get)).toEqual({
  a: 13,
  b: 24,
  d: 6
})
```

### Result.struct

#### Description

Takes an object of results as an input.
If all properties are `Ok`, return an `Ok` with all values.
If one or more properties are `Ko`, return the list of errors.

```ts
<T extends any>(props: T) => Result<Struct<T>, Array<StructErrors<T>>>
```

#### Example
```ts
const all = pipe(
  {
    a: Result.ok(13),
    b: Result.ok(24),
    d: Result.ok(6)
  },
  Result.struct
)

expect(pipe(all, Result.get)).toEqual({
  a: 13,
  b: 24,
  d: 6
})
```

