# Option overview

The `Option` namespace contains utilities to improve the handling of optional values.
The `Option` type is expressed as following:

```ts
type Option<A> = A | undefined
```

**Note**: In other libraries, the `Option` type is often either `Some` value, or `None` / `Nothing`.

## Summary

[[toc]]

## Types

### Option

```ts
type Option<A> = A | undefined
```

## Functions

### Option.isSome

#### Description

Check if an optional value is not `undefined`

```ts
<A>(value: Option<A>) => value is A
```

### Option.isNone

#### Description

Check if an optional value is `undefined`

```ts
<A>(value: Option<A>) => value is undefined
```

### Option.map

#### Description

Map over an optional value, without worrying about the value being undefined

```ts
<A, B>(fn: (value: A) => Option<B>) => (value: Option<A>) => Option<B>
```

#### Example
```ts
const a: Option<number> = undefined
const b = pipe(
  a,
  Option.map(nb => nb * 2)
)

expect(b).toBe(undefined)
```

### Option.filter

#### Description

If the predicate is false, the value becomes `undefined`

```ts
<A, B extends A>(fn: Refinement<A, B>): (value: Option<A>) => Option<B>
<A>(fn: Predicate<A>): (value: Option<A>) => Option<A>
```

#### Example
```ts
const result = pipe(
  NaN,
  Option.filter(nb => !isNaN(nb))
)

expect(result).toBe(undefined)
```

#### References
- `Option.reject`

### Option.reject

#### Description

If the predicate is true, the value becomes `undefined`

```ts
<A, B extends A>(fn: Refinement<A, B>): (value: Option<A>) => Option<B>
<A>(fn: Predicate<A>): (value: Option<A>) => Option<A>
```

#### Example
```ts
const result = pipe(
  NaN,
  Option.reject(nb => isNaN(nb))
)

expect(result).toBe(undefined)

#### References
- `Option.filter`

### Option.get

#### Description

For a given `Option<A>`, returns either:
- The value `A`
- The given default value if the optional value is `undefined`

```ts
(onNone: () => never): <A>(value: Option<A>) => never
(onNone: () => Array<never>): <A extends Array<any>>(value: Option<A>) => Some<A>
(defaultValue: Array<never>): <A extends Array<any>>(value: Option<A>) => Some<A>
<B>(onNone: () => B): <A>(value: Option<A>) => B | Some<A>
<B>(defaultValue: B): <A>(value: Option<A>) => B | Some<A>
```

#### Example
```ts
const a: Option<number> = undefined
const b: number = pipe(
  nb,
  Option.get(0)
)

expect(b).toBe(0)
```

#### References
- `Option.throwError`

### Option.throwError

#### Description

For a given `Option<A>`, either:
- Return the value `A`
- Throw the given error if the optional value is `undefined`

```ts
<A>(onNone: () => Error): (value: Option<A>) => A
<A>(err: Error): (value: Option<A>) => A
```

#### Example
```ts
const a: Option<number> = undefined
const b: number = pipe(
  nb,
  Option.get(0)
)

expect(b).toBe(0)
```

#### References
- `Option.get`

### Option.fromNullable

#### Description

Returns an optional value from a nullable value

```ts
<T>(value: T | null) => Option<T>
```

#### Example
```ts
const a: number | null = null
const b: Option<number> = Option.fromNullable(a)

expect(b).toBe(undefined)
```

### Option.fromFalsy

#### Description

Returns an optional value from a falsy value

**Note**: In Javascript, a falsy value may be undefined, null, 0, false and ""

```ts
<T>(value: T | Falsy) => Option<T>
```

#### Example
```ts
const a: number = 0
const b: Option<number> = Option.fromFalsy(a)

expect(b).toBe(undefined)
```

### Option.fromString

#### Description

Returns an optional value from an empty string

```ts
<T>(value: string | T) => Option<string | T>
```

#### Example
```ts
const a: string = ""
const b: Option<string> = Option.fromString(a)

expect(b).toBe(undefined)
```

### Option.fromNumber

#### Description

Returns an optional value from a number

```ts
(value: number) => Option<number>
```

#### Example
```ts
const a: number = NaN
const b: Option<number> = Option.fromNumber(a)

expect(b).toBe(undefined)
```

### Option.fromDate

#### Description

Returns an optional value from a Date object

```ts
(value: Date) => Option<Date>
```

#### Example
```ts
const a: Date = new Date("invalid")
const b: Option<Date> = Option.fromDate(a)

expect(b).toBe(undefined)
```

