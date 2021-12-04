# Error overview

This namespace contains utilities to create custom errors.

This namespace has also heavily been inspired by verror:
https://www.npmjs.com/package/verror

As such, it contains utilities to create, chain, wrap and format errors.

However, this package has multiple advantages:
- Easier templating: usage of mustaches instead of printf style
- Better compatibility with errors from other library

## Summary

[[toc]]

## Types

### Err

```ts
type Err = Error & {
  cause?: Err
  [key: string]: any
}
```

## Functions

### Err.of

#### Description

Create a new error. You can also attach additional properties to the error

```ts
(msg: string, info?: any, cause?: Err | undefined, constructorOpt?: Function | undefined) => Err
```

#### Example
```ts
const divide = (a, b) => {
  if (b === 0) {
    throw Err.of(`cannot divide {a} by {b}`, { a, b })
  }
  return a / b
}
```

### Err.toError

#### Description

Returns the error instance or creates a new error if the `err` param is an instance of `Error`.

```ts
(err: unknown) => Err
```

### Err.wrap

#### Description

Chain an error and override the message with the new one.
This function is mostly used to hide low-level details to an user.

The original error can be accessed in the `cause` property.

```ts
(msg: string, info?: any) => (e: unknown) => Err
```

#### Example
```ts
const source = new Error('Database error')
const err = pipe(
  source,
  Err.wrap('Could not find user #{userId}', { userId: 'xxxx' })
)

expect(source.message).toBe('Database error')
expect(err.message).toBe('Could not find user xxxx')
```

#### References
- `Err.chain` - To preprend the new message to the previous one

### Err.chain

#### Description

Chain an error and preprend the new message to the previous one.

The original error can be accessed in the `cause` property.

```ts
(msg: string, info?: any) => (e: unknown) => Err
```

#### Example
```ts
const source = new Error('Database error')
const err = pipe(
  source,
  Err.chain('Could not find user #{userId}', { userId: 'xxxx' })
)

expect(source.message).toBe('Database error')
expect(err.message).toBe('Could not find user xxxx: Database error')
```

#### References
- `Err.wrap` - To override the message of the error

### Err.find

#### Description

Find a specific cause in the error matching the given predicate.

```ts
(fn: (err: Err) => boolean) => (source: unknown) => any
```

#### Example
```ts
const source = Err.of('cannot divide {a} by {b}', {
  name: 'DivideError',
  code: 'ZeroDivide',
  a: 3,
  b: 0
})

const err = pipe(
  source,
  Err.chain('Job failed', { name: 'JobError' })
)

const result = pipe(
  err,
  Err.find(e => e.name === 'DivideError')
)
expect(result === source).toBe(true)
```

#### References
- `Err.has`
- `Err.hasName`

### Err.has

#### Description

Check if the error contains a specific cause matching the given predicate.

```ts
(fn: (err: Err) => boolean) => (source: unknown) => boolean
```

#### Example
```ts
const source = Err.of('cannot divide {a} by {b}', {
  name: 'DivideError',
  code: 'ZeroDivide',
  a: 3,
  b: 0
})

const err = pipe(
  source,
  Err.chain('Job failed', { name: 'JobError' })
)

expect(pipe(err, Err.has(e => e.name === 'DivideError'))).toBe(true)
```

#### References
- `Err.find`
- `Err.hasName`

### Err.hasName

#### Description

Check if the error contains a specific cause matching the given name.

```ts
(name: string) => (source: unknown) => boolean
```

#### Example
```ts
const source = Err.of('cannot divide {a} by {b}', {
  name: 'DivideError',
  code: 'ZeroDivide',
  a: 3,
  b: 0
})

const err = pipe(
  source,
  Err.chain('Job failed', { name: 'JobError' })
)

expect(pipe(err, Err.hasName('DivideError'))).toBe(true)
```

#### References
- `Err.find`
- `Err.has`

### Err.format

#### Description

Format the given error.
This combines all informational properties of the errors into one `info` object.
This also creates a full stack trace including the stack traces from all causes.

```ts
(e: unknown) => FormattedError
```

#### Example
```ts
const source = Err.of('cannot divide {a} by {b}', {
  name: 'DivideError',
  code: 'ZeroDivide',
  a: 3,
  b: 0
})

const err = pipe(
  source,
  Err.chain('Job failed', { name: 'JobError', code: 'InternalError' })
)

const formatted = Err.format(err)

expect(formatted).toEqual({
  name: 'JobError',
  message: 'Job failed: cannot divide 3 by 0',
  stack: '...',
  info: {
    code: 'InternalError',
    name: 'JobError',
    a: 3,
    b: 0
  },
})
```

### Err.omitStack

#### Description

Omit the stack property from the error.

```ts
(obj: FormattedError) => Omit<FormattedError, "stack">
```

