# NonEmptyArray overview

A `NonEmptyArray` is an array containing at least 1 item.
This means, that some function will always return a value, compared to the `Arr` utility variant.

**Note**: An `NonEmptyArray` variable can still use all of the utilities of the `Arr` namespace.

```ts
const arrayA: Array<number> = []
const arrayB: NonEmptyArray<number> = [1]

const a: Option<number> = Arr.head(arrayA)
const b: number = NonEmptyArray.head(arrayB)
```

## Summary

[[toc]]

## Functions

### NonEmptyArray.of

#### Description

Create a new NonEmptyArray, containing at least one element

```ts
<A>(value: A) => NonEmptyArray<A>
```

### NonEmptyArray.fromArray

#### Description

Transforms an array into a `NonEmptyArray`
If the array is empty, the function will return `undefined` instead

```ts
<A>(arr: readonly [A, ...A[]]): NonEmptyArray<A>
<A>(arr: NonEmptyArray<A>): NonEmptyArray<A>
<A>(arr: Array<A>): Option<NonEmptyArray<A>>
```

### NonEmptyArray.head

#### Description

Returns the first value in the `NonEmptyArray`

```ts
<A>(arr: NonEmptyArray<A> | readonly [A, ...A[]]) => A
```

#### Example
```ts
const first = pipe(
  [1,2,3,4],
  Arr.head
)

expect(first).toEqual(1)
```

#### References
- `Arr.head`
- `NonEmptyArray.last`

### NonEmptyArray.last

#### Description

Returns the last value in the `NonEmptyArray`

```ts
<A>(arr: NonEmptyArray<A> | readonly [A, ...A[]]) => A
```

#### Example
```ts
const last = pipe(
  [1,2,3,4],
  Arr.last
)

expect(last).toEqual(4)
```

#### References
- `Arr.last`
- `NonEmptyArray.head`

### NonEmptyArray.map

#### Description

Calls a defined callback function on each element of an `NonEmptyArray`, and returns a new `NonEmptyArray` that contains the results.

```ts
<A, B>(fn: (value: A) => B) => (arr: NonEmptyArray<A> | readonly [A, ...A[]]) => NonEmptyArray<B>
```

#### Example
```ts
const nbs = pipe(
  [1,2,3],
  NonEmptyArray.map(a => a + 1)
)

expect(nbs).toEqual([2,3,4])
```

#### References
- `NonEmptyArray.mapIndexed` if you need the index

### NonEmptyArray.mapIndexed

#### Description

Calls a defined callback function on each element of an `NonEmptyArray`, and returns a new `NonEmptyArray` that contains the results.

```ts
<A, B>(fn: (value: A, index: number) => B) => (arr: NonEmptyArray<A> | readonly [A, ...A[]]) => NonEmptyArray<B>
```

#### Example
```ts
const nbs = pipe(
  [1,2],
  NonEmptyArray.mapIndexed((a, index) => `index ${index} = ${a}`)
)

expect(nbs).toEqual([
 `index 0 = 1`,
 `index 1 = 2`
])
```

#### References
- `NonEmptyArray.map` if you don't need the index

### NonEmptyArray.min

#### Description

Returns the smallest value in the array.

```ts
<A>(ord: Ord<A>) => <C extends A>(arr: NonEmptyArray<C> | readonly [C, ...C[]]) => C
```

#### Example
```ts
const smallestNb = pipe(
  [1, 7, 3, 4, 2],
  NonEmptyArray.min(Ord.number)
)

expect(smallestNb).toBe(1)
```

#### References
- `Arr.min`
- `NonEmptyArray.min`

### NonEmptyArray.max

#### Description

Returns the greatest value in the array.

```ts
<A>(ord: Ord<A>) => <C>(arr: NonEmptyArray<C> | readonly [C, ...C[]]) => C
```

#### Example
```ts
const greatestNb = pipe(
  [1, 7, 3, 4, 2],
  NonEmptyArray.max(Ord.number)
)

expect(greatestNb).toBe(7)
```

#### References
- `Arr.max`
- `NonEmptyArray.min`

### NonEmptyArray.sort

#### Description

Sort array by the given `Ord` function.

This function is the same as `Arr.sort`, but for `NonEmptyArray`s.

```ts
<A>(ord: Ord<A>) => <C extends A>(arr: NonEmptyArray<C> | readonly [C, ...C[]]) => NonEmptyArray<C>
```

#### Example
```ts
const nbs = pipe(
  [1,4,2,3],
  NonEmptyArray.sort(Ord.number)
)

expect(nbs).toEqual([1,2,3,4])
```

