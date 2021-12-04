# Dictionnary overview

## Summary

[[toc]]

## Types

### Dict

```ts
type Dict<A = any> = Record<string, A>
```

## Functions

### Dict.isEmpty

#### Description

Check if object is empty

```ts
(dict: Dict<unknown>) => boolean
```

#### Example
```ts
expect(Dict.isEmpty({})).toBe(true)
```

### Dict.lookup

#### Description

Lookup a specific key from the dict

```ts
(key: string | number) => <A>(dict: Dict<A>) => Option<A>
```

#### Example
```ts
const value = pipe(
  {
    firstName: 'John',
    lastName: 'Doe'
  },
  Dict.lookup('lastName')
)

expect(value).toBe('Doe')
```

### Dict.set

#### Description

Set the value of a specific key in a `Dict`

@sideEffects this method mutates the given `Dict`

```ts
<A>(key: string | number, value: A) => (dict: Dict<A>) => Dict<A>
```

#### Example
```ts
const original = {
  firstName: 'John'
}
const mutated = pipe(
  original,
  Dict.set('lastName', 'Doe')
)

expect(mutated === original).toBe(true)
expect(mutated.lastName).toBe('Doe')
```

### Dict.map

#### Description

Calls a defined callback function on each element of a `Dict`.
This function returns a new `Dict` that contains the results.

```ts
<A, B>(fn: (value: A) => B) => (dict: Dict<A>) => Dict<B>
```

#### Example
```ts
const result = pipe(
  {
    firstName: 'John',
    lastName: 'Doe'
  },
  Dict.map(Str.upper)
)

expect(attrs !== result).toBe(true)
expect(result.firstName).toBe('JOHN')
expect(result.lastName).toBe('DOE')
```

#### References
- `Dict.mapIndexed` if you need the key

### Dict.mapIndexed

#### Description

Calls a defined callback function on each element of a `Dict`.
This function returns a new `Dict` that contains the results.

```ts
<A, B>(fn: (value: A, key: string) => B) => (dict: Dict<A>) => Dict<B>
```

#### Example
```ts
const result = pipe(
  {
    firstName: 'John',
    lastName: 'Doe'
  },
  Dict.map((str, key) => `${key} = ${str}`)
)

expect(attrs !== result).toBe(true)
expect(result.firstName).toBe('firstName = John')
expect(result.lastName).toBe('lastName = Doe')
```

#### References
- `Dict.map` if you don't need the key

### Dict.filter

#### Description

Filter items out of the array

```ts
<A, B extends A>(fn: Dict.Refinement<A, B>): (dict: Dict<A>) => Dict<B>
<A>(fn: Dict.Predicate<A>): (arr: Dict<A>) => Dict<A>
```

#### Example
```ts
const result = pipe(
  {
    nb1: 1,
    nb2: -3,
    nb3: 2,
  },
  Dict.filter(value => value >= 0)
)

expect(result).toEqual({
  nb1: 1,
  nb3: 2
})
```

#### References
- `Dict.reject`
- `Dict.filterMap`

### Dict.reject

#### Description

Filter items out of the array

```ts
<A, B extends A>(fn: Dict.Refinement<A, B>): (arr: Dict<A>) => Dict<InverseRefinement<A, B>>
<A>(fn: Dict.Predicate<A>): (arr: Dict<A>) => Dict<A>
```

#### Example
```ts
const result = pipe(
  {
    nb1: 1,
    nb2: -3,
    nb3: 2,
  },
  Dict.reject(value => value >= 0)
)

expect(result).toEqual({
  nb2: -3
})
```

#### References
- `Dict.filter`
- `Dict.filterMap`

### Dict.filterMap

#### Description

Map and filter `undefined` values out of the `Dict`

```ts
<A, B>(fn: (value: A, key: string) => Option<B>) => (dict: Dict<A>) => Dict<B>
```

#### Example
```ts
const result = pipe(
  {
    firstName: "John",
    lastName: null
  },
  Dict.filterMap(value => value !== null
    ? pipe(value, Str.upper)
    : undefined
  )
)

expect(result).toEqual({
  firstName: "JOHN"
})
```

#### References
- `Dict.filter`
- `Dict.reject`
- `Dict.compact`

### Dict.compact

#### Description

Filter `undefined` values out of the `Dict`

```ts
<A>(value: Dict<Option<A>>) => Dict<A>
```

#### Example
```ts
const values = pipe(
  {
    firstName: "John",
    lastName: undefined
  },
  Dict.compact
)

expect(values).toEqual({
  firstName: "John"
})
```

#### References
- `Dict.filterMap`

### Dict.reduce

#### Description

Iterate through and accumulate / aggregate a value with a `Dict`

```ts
<A, B>(fn: (acc: B, value: A, key: string) => B, initial: B) => (dict: Dict<A>) => B
```

#### Example
```ts
const value = pipe(
  {
    nb1: 2,
    nb2: 5,
    nb3: 3
  },
  Dict.reduce((a, b) => a + b, 0)
)

expect(value).toEqual(10)
```

### Dict.collect

#### Description

Map over a `Dict` and return an array

```ts
<A, B>(fn: (value: A, key: string) => B) => (dict: Dict<A>) => Array<B>
```

#### Example
```ts
const arr = pipe(
  {
    nb1: 1,
    nb2: -3,
    nb3: 2
  },
  Dict.collect((value, key) => [key, value])
)

expect(arr).toEqual([
  ['nb1', 1],
  ['nb2', -3],
  ['nb3', 2]
])
```

#### References
- `Dict.keys`
- `Dict.values`
- `Dict.toPairs`

### Dict.isDict

#### Description

Checks if the variable is an object

```ts
(input: unknown) => input is Dict<unknown>
```

### Dict.keys

#### Description

Collect all keys of the `Dict`

```ts
<A>(dict: Dict<A>) => Array<string>
```

#### Example
```ts
const arr = Dict.keys({ firstName: 'John' })
expect(arr).toEqual(['firstName'])
```

#### References
- `Dict.collect`
- `Dict.values`
- `Dict.toPairs`

### Dict.values

#### Description

Collect all values of the `Dict`

```ts
<A>(dict: Dict<A>) => Array<A>
```

#### Example
```ts
const arr = Dict.values({ firstName: 'John' })
expect(arr).toEqual(['John'])
```

#### References
- `Dict.collect`
- `Dict.keys`
- `Dict.toPairs`

### Dict.fromPairs

#### Description

Create a dict from an array of key/value pairs

```ts
<A>(pairs: Array<[string, A]>) => Dict<A>
```

#### Example
```ts
const dict = Dict.fromPairs([
  ['firstName', 'John'],
  ['lastName', 'Doe']
])
expect(dict).toEqual({
  firstName: 'John',
  lastName: 'Doe'
})
```

#### References
- `Dict.toPairs`

### Dict.toPairs

#### Description

Create an array of key/value pairs from the `Dict`

```ts
<A>(dict: Dict<A>) => Array<[string, A]>
```

#### Example
```ts
const arr = Dict.toPairs({
  firstName: 'John',
  lastName: 'Doe'
})
expect(arr).toEqual([
  ['firstName', 'John'],
  ['lastName', 'Doe']
])
```

#### References
- `Dict.collect`
- `Dict.keys`
- `Dict.values`
- `Dict.fromPairs`

### Dict.union

#### Description

Merge both `Dict`s.
The values of the original `Dict` have higher priority than the member `Dict`.

As such, this method corresponds to:
```ts
{
  ...member,
  ...original
}
```

```ts
<A>(member: Dict<A>) => (dict: Dict<A>) => Dict<A>
```

#### Example
```ts
const merged = pipe(
  {
    firstName: 'John',
    lastName: 'Doe'
  },
  Dict.union({
    lastName: 'Smith',
    gender: 'M'
  })
)

expect(merge).toEqual({
  firstName: 'John',
  lastName: 'Doe',
  gender: 'M'
})
```

### Dict.intersect

#### Description

Intersection of both `Dict`s based on their keys.
This means, only the keys that are both in `member` and the original `Dict` will be kept.

```ts
<A>(member: Dict<A>) => (dict: Dict<A>) => Dict<A>
```

#### Example
```ts
const intersection = pipe(
  {
    firstName: 'John',
    lastName: 'Doe'
  },
  Dict.intersect({
    lastName: 'Smith',
    gender: 'M'
  })
)

expect(intersection).toEqual({
  lastName: 'Doe'
})
```

### Dict.difference

#### Description

The difference between both `Dict`s based on their keys.
This means, all keys in `member` will be removed from the original `Dict`.

```ts
<A>(member: Dict<A>) => (dict: Dict<A>) => Dict<A>
```

#### Example
```ts
const diff = pipe(
  {
    firstName: 'John',
    lastName: 'Doe'
  },
  Dict.difference({
    lastName: 'Smith',
    gender: 'M'
  })
)

expect(diff).toEqual({
  firstName: 'John'
})
```

