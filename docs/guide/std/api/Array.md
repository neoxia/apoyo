# Array overview

The `Arr` namespace contains all utilities related to Arrays.

The utilities in this namespace are similar to the array utilities you can find in `underscore` or `lodash`.

The big difference however is that they are pipeable, which means they can be chained like in the example below.

```ts
const nb = pipe(
  [1,2,-3,4,-5],
  Arr.map(a => a * 2),
  Arr.filter(a => a >= 0),
  Arr.last
)

expect(nb).toBe(8)
```

## Summary

[[toc]]

## Functions

### Arr.of

#### Description

Create array from value

```ts
<A>(value: A) => NonEmptyArray<A>
```

### Arr.from

#### Description

Create array from an iterable

```ts
<A>(value: Seq<A> | Array<A>) => Array<A>
```

### Arr.length

#### Description

Get length of array

```ts
<A>(arr: Array<A>) => number
```

### Arr.isArray

#### Description

Check if the variable is an array

```ts
(arr: unknown) => arr is Array<unknown>
```

### Arr.isEmpty

#### Description

Check if the array is empty

```ts
<A>(arr: Array<A>) => arr is []
```

### Arr.isNonEmpty

#### Description

Check if the array is non empty

```ts
<A>(arr: Array<A>) => arr is NonEmptyArray<A>
```

### Arr.head

#### Description

Returns the first value in the array.
This function returns `undefined` when the array is empty.

```ts
<A>(arr: Array<A>) => Option<A>
```

#### Example
```ts
const first = pipe(
  [1,2,3,4],
  Arr.head
)

expect(first).toEqual(1)
```

### Arr.last

#### Description

Returns the last value in the array.
This function returns `undefined` when the array is empty.

```ts
<A>(arr: Array<A>) => Option<A>
```

#### Example
```ts
const last = pipe(
  [1,2,3,4],
  Arr.last
)

expect(last).toEqual(4)
```

### Arr.map

#### Description

Calls a defined callback function on each element of an array, and returns an array that contains the results.

```ts
<A, B>(fn: (value: A) => B) => (arr: Array<A>) => Array<B>
```

#### Example
```ts
const nbs = pipe(
  [1,2,3],
  Arr.map(a => a + 1)
)

expect(nbs).toEqual([2,3,4])
```

#### References
- `Arr.mapIndexed` if you need the index

### Arr.mapIndexed

#### Description

Calls a defined callback function on each element of an array, and returns an array that contains the results.

```ts
<A, B>(fn: (value: A, index: number, arr: Array<A>) => B) => (arr: Array<A>) => Array<B>
```

#### Example
```ts
const nbs = pipe(
  [1,2],
  Arr.mapIndexed((a, index) => `index ${index} = ${a}`)
)

expect(nbs).toEqual([
 `index 0 = 1`,
 `index 1 = 2`
])
```

#### References
- `Arr.map` if you don't need the index

### Arr.chain

#### Description

Chain over array.

```ts
<A, B>(fn: (value: A) => Array<B>) => (arr: Array<A>) => Array<B>
```

#### Example
```ts
const array = pipe(
  [1,2,3],
  Arr.chain(value => [value, value])
)

expect(array).toEqual([1, 1, 2, 2, 3, 3])
```

#### References
- `Arr.chainIndexed` if you need the index
- `Arr.map`
- `Arr.flatten`

### Arr.chainIndexed

#### Description

Chain over an array with an index.

```ts
<A, B>(fn: (value: A, index: number, arr: Array<A>) => Array<B>) => (arr: Array<A>) => Array<B>
```

#### Example
```ts
const nbs = pipe(
  [1,2],
  Arr.chainIndexed((a, index) => [a, index])
)

expect(nbs).toEqual([1,0,2,1])
```

#### References
- `Arr.chain` if you don't need the index
- `Arr.map`
- `Arr.flatten`

### Arr.some

#### Description

Check if at least one element in the array matches the predicate

```ts
<A>(fn: (value: A) => boolean) => (arr: Array<A>) => boolean
```

#### Example
```ts
const childrenAges = [8, 11, 19]
const hasAdult = pipe(childrenAges, Arr.some(age => age >= 18))

expect(hasAdult).toBe(true)
```

#### References
- `Arr.every`

### Arr.every

#### Description

Check if all elements in the array match the predicate

```ts
<A>(fn: (value: A) => boolean) => (arr: Array<A>) => boolean
```

#### Example
```ts
const childrenAges = [8, 11, 19]
const allAdults = pipe(childrenAges, Arr.every(age => age >= 18))

expect(allAdults).toBe(false)
```

#### References
- `Arr.some`

### Arr.join

#### Description

Join array values by the given separator

```ts
(sep?: string | undefined) => <A>(arr: Array<A>) => string
```

### Arr.reduce

#### Description

Aggregate / accumulate all values in the array into a single value

```ts
<A, B>(fn: (acc: B, current: A) => B, initial: B) => (arr: Array<A>) => B
```

#### Example
```ts
const nbs = [1,2,3,4]
const total = pipe(
  nbs,
  Arr.reduce((a, b) => a + b, 0)
)
```

### Arr.reject

#### Description

Filter items out of the array

```ts
<A, B extends A>(fn: Arr.Refinement<A, B>): (arr: Array<A>) => Array<InverseRefinement<A, B>>
<A>(fn: Arr.Predicate<A>): (arr: Array<A>) => Array<A>
```

#### Example
```ts
const array = pipe(
  [1,-2,3],
  Arr.reject(value => value >= 0)
)

expect(array).toEqual([-2])
```

#### References
- `Arr.filter`
- `Arr.filterMap`

### Arr.filter

#### Description

Filter items out of the array

```ts
<A, B extends A>(fn: Arr.Refinement<A, B>): (arr: Array<A>) => Array<B>
<A>(fn: Arr.Predicate<A>): (arr: Array<A>) => Array<A>
```

#### Example
```ts
const array = pipe(
  [1,-2,3],
  Arr.filter(value => value >= 0)
)

expect(array).toEqual([1, 3])
```

#### References
- `Arr.reject`
- `Arr.filterMap`

### Arr.filterMap

#### Description

Map and filter `undefined` values out of the array

```ts
<A, B>(fn: (value: A) => Option<B>) => (arr: Array<A>) => Array<B>
```

#### Example
```ts
const values = pipe(
  [1,-2,3,4],
  Arr.filterMap(x => x >= 0 ? x + 1 : undefined)
)

expect(values).toEqual([1, 3, 4])
```

#### References
- `Arr.filter`
- `Arr.reject`
- `Arr.compact`

### Arr.compact

#### Description

Filter `undefined` values out of the array

```ts
<A>(arr: Array<Option<A>>) => Array<A>
```

#### Example
```ts
const values = pipe(
  [1,2,undefined,3,undefined,4],
  Arr.compact
)

expect(values).toEqual([1, 2, 3, 4])
```

#### References
- `Arr.filterMap`

### Arr.concat

#### Description

Concat a value or an array to an existing array. This function does not modify the existing array, but creates a new one.

```ts
<A>(value: A | Array<A>) => (arr: Array<A>) => Array<A>
```

#### Example
```ts
const array = pipe(
  [1,2],
  Arr.concat([3,4,5])
)

expect(array).toEqual([1, 2, 3, 4, 5])
```

#### References
- `Arr.flatten`

### Arr.flatten

#### Description

Flatten nested arrays

```ts
<A>(arr: Array<Array<A>>) => Array<A>
```

#### Example
```ts
const array = pipe(
  [[1,2], [3,4,5]],
  Arr.flatten
)

expect(array).toEqual([1, 2, 3, 4, 5])
```

#### References
- `Arr.chain`

### Arr.slice

#### Description

Returns a section of an array.

```ts
(start?: number | undefined, end?: number | undefined) => <A>(arr: Array<A>) => Array<A>
```

#### Example
```ts
const nbs = pipe(
  [1,2,3,4],
  Arr.slice(1,2)
)

expect(nbs).toEqual([2])
```

#### References
- `Arr.take`
- `Arr.skip`

### Arr.take

#### Description

Take n elements at the start of the array

```ts
(nb: number) => <A>(arr: Array<A>) => Array<A>
```

#### Example
```ts
const nbs = pipe(
  [1,2,3,4],
  Arr.take(2)
)

expect(nbs).toEqual([1,2])
```

#### References
- `Arr.slice`
- `Arr.skip`

### Arr.skip

#### Description

Skip n elements from the array

```ts
(nb: number) => <A>(arr: Array<A>) => Array<A>
```

#### Example
```ts
const nbs = pipe(
  [1,2,3,4],
  Arr.take(2)
)

expect(nbs).toEqual([3,4])
```

#### References
- `Arr.slice`
- `Arr.take`

### Arr.sort

#### Description

Sort array by the given `Ord` function.

```ts
<A>(ord: Ord<A>) => <C extends A>(arr: Array<C>) => Array<C>
```

#### Example
```ts
const nbs = pipe(
  [1,4,2,3],
  Arr.sort(Ord.number)
)

expect(nbs).toEqual([1,2,3,4])
```

### Arr.chunksOf

#### Description

Split up the array in multiple chunks of the specified length

```ts
(size: number) => <A>(arr: Array<A>) => Array<NonEmptyArray<A>>
```

#### Example
```ts
const chunks = pipe(
  [1,2,3,4,5,6,7,8,9],
  Arr.chunksOf(4)
)

expect(chunks).toEqual([[1, 2, 3, 4], [5, 6, 7, 8], [9]])
```

### Arr.groupBy

#### Description

Split array into multiple arrays grouped by keys.

```ts
<A>(fn: (value: A, index: number) => string | number) => (arr: Array<A>) => Dict<NonEmptyArray<A>>
```

#### Example
```ts
const groups = pipe(
  ["John", "Jerry", "Betty"],
  Arr.groupBy(str => str[0])
)

expect(groups).toEqual({
  "B": ["Betty"],
  "J": ["John", "Jerry"]
})
```

### Arr.countBy

#### Description

Count array elements matching a given key

```ts
<A>(fn: (value: A, index: number) => string | number) => (arr: Array<A>) => Dict<number>
```

#### Example
```ts
const groups = pipe(
  ["John", "Jerry", "Betty"],
  Arr.countBy(str => str[0])
)

expect(groups).toEqual({
  "B": 1,
  "J": 2
})
```

### Arr.indexBy

#### Description

Index each array element by a given key

```ts
<A>(fn: (value: A, index: number) => string | number, strategy?: (a: A, b: A) => A) => (arr: Array<A>) => Dict<A>
```

#### Example
```ts
const items = pipe(
  [{ id: 1, name: "John" }, { id: 2, name: "Betty" }],
  Arr.indexBy(item => item.id)
)

expect(items).toEqual({
  "1": { id: 1, name: "John" },
  "2": { id: 2, name: "Betty" }
})
```

### Arr.uniq

#### Description

Make all array values unique, by removing all value duplicates.

This is a specialized version of `Arr.uniqBy` and internally uses `Set`s.

```ts
(arr: Array<string>): Array<string>
(arr: Array<number>): Array<number>
```

#### Example
```ts
const uniqNumbers = pipe(
  [1,4,2,2,2,1,4,3],
  Arr.uniq
)

expect(uniqNumbers).toEqual([1,4,2,3])
```

#### References
- `Arr.uniqBy`

### Arr.uniqBy

#### Description

Make all array values unique, by removing all value duplicates
The returned array will be automatically sorted by the unique identifiers used for each value

```ts
<A>(fn: (value: A) => string | number) => (arr: Array<A>) => Array<A>
```

#### Example
```ts
const uniqNumbers = pipe(
  [1,4,2,2,2,1,4,3],
  Arr.uniqBy(identity)
)

expect(uniqNumbers).toEqual([1,2,3,4])
```

### Arr.union

#### Description

Combine the unique values of 2 arrays.
This means, all unique values of both arrays will be kept.

The returned array will be automatically sorted by the unique identifiers used for each value

```ts
<A>(fn: (value: A) => string | number, member: Array<A>) => (arr: Array<A>) => Array<A>
```

#### Example
```ts
const uniqNumbers = pipe(
  [1,4,2,2],
  Arr.union(identity, [2,1,4,3])
)

expect(uniqNumbers).toEqual([1,2,3,4])
```

#### References
- `Arr.intersect`
- `Arr.difference`

### Arr.intersect

#### Description

Intersect the unique values of 2 arrays.
This means, only the values that are both in `member` and the original array will be kept.

The returned array will be automatically sorted by the unique identifiers used for each value

```ts
<A>(fn: (value: A) => string | number, member: Array<A>) => (arr: Array<A>) => Array<A>
```

#### Example
```ts
const uniqNumbers = pipe(
  [1,4,2,2],
  Arr.intersect(identity, [2,1,4,3])
)

expect(uniqNumbers).toEqual([1,2,4])
```

#### References
- `Arr.union`
- `Arr.difference`

### Arr.difference

#### Description

Compute the difference between both arrays.
This means, all values in `member` will be removed from the original array.

The returned array will be automatically sorted by the unique identifiers used for each value

```ts
<A>(fn: (value: A) => string | number, member: Array<A>) => (arr: Array<A>) => Array<A>
```

#### Example
```ts
const uniqNumbers = pipe(
  [1,4,2,2,5],
  Arr.difference(identity, [2,1,4,3])
)

expect(uniqNumbers).toEqual([5])
```

#### References
- `Arr.union`
- `Arr.intersect`

### Arr.pluck

#### Description

Pluck a specific property out of the objects in the array

```ts
<K extends string>(key: K) => <A extends Record<K, any>>(arr: Array<A>) => Array<A[K]>
```

#### Example
```ts
const ids = pipe(
  [{ id: 1 }, { id: 2 }, { id: 3}],
  Arr.pluck('id')
)

expect(ids).toEqual([1,2,3])
```

### Arr.partition

#### Description

Partitions the array in 2 separate arrays.

```ts
<A, B extends A>(fn: Refinement<A, B>): (arr: Array<A>) => [Array<B>, Array<InverseRefinement<A, B>>]
<A>(fn: Predicate<A>): (arr: Array<A>) => [Array<A>, Array<A>]
```

#### Example
```ts
const [positives, negatives] = pipe(
  [1, -3, 2, 9],
  Arr.partition(nb => nb >= 0)
)

expect(positives).toEqual([1,2,9])
expect(negatives).toEqual([-3])
```

#### References
- `Arr.partitionMap`
- `Arr.separate`

### Arr.partitionMap

#### Description

Maps and partitions the array in 2 separate arrays.

```ts
<A, B, C>(fn: (value: A) => Result<B, C>) => (arr: Array<A>) => [Array<B>, Array<C>]
```

#### Example
```ts
const [positives, negatives] = pipe(
  [1, -3, 2, 9],
  Arr.partitionMap(nb => nb >= 0
    ? Result.ok(nb + 1)
    : Result.ko(nb - 1)
  )
)

expect(positives).toEqual([2,3,10])
expect(negatives).toEqual([-4])
```

#### References
- `Arr.partition`
- `Arr.separate`

### Arr.separate

#### Description

Separate array of `Result`s in `Ok` and `Ko` values

```ts
<A, E>(arr: Array<Result<A, E>>) => [Array<A>, Array<E>]
```

#### Example
```ts
const [ok, ko] = pipe(
  [Result.ok(1), Result.ko(9), Result.ok(3)],
  Arr.separate
)

expect(ok).toEqual([1,3])
expect(ko).toEqual([9])
```

#### References
- `Arr.partition`
- `Arr.partitionMap`

### Arr.min

#### Description

Returns the smallest value in the array.
This function may return undefined if the array is empty.

```ts
<A>(ord: Ord<A>) => <C extends A>(arr: Array<C>) => Option<C>
```

#### Example
```ts
const smallestNb = pipe(
  [1, 7, 3, 4, 2],
  Arr.min(Ord.number)
)

expect(smallestNb).toBe(1)
```

#### References
- `Arr.min`

### Arr.max

#### Description

Returns the greatest value in the array.
This function may return undefined if the array is empty.

```ts
<A>(ord: Ord<A>) => <C>(arr: Array<C>) => Option<C>
```

#### Example
```ts
const greatestNb = pipe(
  [1, 7, 3, 4, 2],
  Arr.max(Ord.number)
)

expect(greatestNb).toBe(7)
```

#### References
- `Arr.min`

### Arr.reverse

#### Description

Reverse the array

```ts
<A>(arr: Array<A>) => Array<A>
```

#### Example
```ts
const nbs = pipe(
  [1, 2, 3],
  Arr.reverse
)

expect(nbs).toEqual([3,2,1])
```

### Arr.find

#### Description

Find the first element in the array matching the given predicate

```ts
<A>(fn: (value: A, index: number) => boolean) => (arr: Array<A>) => Option<A>
```

#### Example
```ts
const nb = pipe(
  [1, 2, 3],
  Arr.find(a => a === 1)
)

expect(nb).toEqual(1)
```

### Arr.includes

#### Description

Check if the array includes a specific element

```ts
<A>(fn: (value: A, index: number) => boolean) => (arr: Array<A>) => boolean
```

#### Example
```ts
const eqNumber = pipe(
  Ord.number,
  Ord.eq
)

const hasNumber = pipe(
  [1, 2, 3],
  Arr.includes(eqNumber(2))
)

expect(hasNumber).toBe(true)
```

### Arr.empty

#### Description

Returns a new empty array

```ts
<A>() => Array<A>
```

### Arr.sum

#### Description

Sum all numbers in the array

```ts
(arr: Array<number>) => number
```

#### Example
```ts
const nb = pipe(
  [1,2,3,4],
  Arr.sum
)

expect(nb).toBe(10)
```

#### References
- `Arr.sumBy`

### Arr.sumBy

#### Description

Sum all items in the array

```ts
<A>(fn: (value: A) => number) => (arr: Array<A>) => number
```

#### Example
```ts
const nb = pipe(
  [1,2,3,4],
  Arr.sumBy(identity)
)

expect(nb).toBe(10)
```

#### References
- `Arr.sum`

### Arr.push

#### Description

Push a new value into an existing array.
This function will mutate the given array and will not create a new one.

```ts
<T>(arr: Array<T>, value: T): NonEmptyArray<T>
<T>(value: T): (arr: Array<T>) => NonEmptyArray<T>
```

#### Example
```ts
const array = pipe(
  [],
  Arr.push("A"),
  Arr.push(undefined),
  Arr.push("B"),
  Arr.compact
)
```

