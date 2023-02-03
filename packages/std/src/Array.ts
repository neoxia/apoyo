import type { NonEmptyArray } from './NonEmptyArray'
import type { Dict } from './Dict'
import type { Option } from './Option'
import type { Ord } from './Ord'
import type { Result } from './Result'

import * as D from './Dict'
import {
  add,
  constant,
  fcurry2,
  first,
  identity,
  InverseRefinement,
  last as _last2,
  not,
  pipe,
  Predicate,
  Refinement
} from './function'
import * as NEA from './NonEmptyArray'
import { isSome } from './Option'
import { contramap, inverse } from './Ord'
import { isOk, ko, ok } from './Result'

export type Arr<A = any> = Array<A>
export namespace Arr {
  export interface Predicate<A> {
    (value: A, index: number): boolean
  }
  export interface Refinement<A, B extends A> {
    (value: A, index: number): value is B
  }
}

export const isArray = (arr: unknown): arr is unknown[] => Array.isArray(arr)

export const isEmpty = <A>(arr: A[]): arr is [] => arr.length === 0

export const length = <A>(arr: A[]) => arr.length

export const of = <A>(value: A): NonEmptyArray<A> => [value]

export const from = <A>(value: A[] | Iterable<A>) => Array.from(value)

export const head = <A>(arr: A[]): Option<A> => (arr.length > 0 ? arr[0] : undefined)

export const last = <A>(arr: A[]): Option<A> => (arr.length > 0 ? arr[arr.length - 1] : undefined)

export const mapIndexed = <A, B>(fn: (value: A, index: number, arr: A[]) => B) => (arr: A[]) => arr.map(fn)

export const map = <A, B>(fn: (value: A) => B) => (arr: A[]) => arr.map((value) => fn(value))

export const filterMap = <A, B>(fn: (value: A) => Option<B>) => (arr: A[]): B[] => {
  const out: B[] = []
  for (let i = 0; i < arr.length; ++i) {
    const result = fn(arr[i])
    if (isSome(result)) {
      out.push(result)
    }
  }
  return out
}

export const compact = <A>(arr: Option<A>[]): A[] => pipe(arr, filterMap(identity))

export const concat = <A>(value: A | A[]) => (arr: A[]): A[] => arr.concat(value)

export const flatten = <A>(arr: A[][]): A[] => ([] as A[]).concat.apply([], arr)

export const chain = <A, B>(fn: (value: A) => B[]) => (arr: A[]) => pipe(arr, map(fn), flatten)

export const chainIndexed = <A, B>(fn: (value: A, index: number, arr: A[]) => B[]) => (arr: A[]) =>
  pipe(arr, mapIndexed(fn), flatten)

export const some = <A>(fn: (value: A) => boolean) => (arr: A[]) => arr.some(fn)
export const every = <A>(fn: (value: A) => boolean) => (arr: A[]) => arr.every(fn)

export const join = (sep?: string) => <A>(arr: A[]) => arr.join(sep)

export function filter<A, B extends A>(fn: Arr.Refinement<A, B>): (arr: A[]) => B[]
export function filter<A>(fn: Arr.Predicate<A>): (arr: A[]) => A[]
export function filter(fn: any) {
  return (arr: any[]) => arr.filter(fn)
}

export function reject<A, B extends A>(fn: Arr.Refinement<A, B>): (arr: A[]) => InverseRefinement<A, B>[]
export function reject<A>(fn: Arr.Predicate<A>): (arr: A[]) => A[]
export function reject(fn: any) {
  return (arr: any[]) => arr.filter(not(fn))
}

export const reduce = <A, B>(fn: (acc: B, current: A) => B, initial: B) => (arr: A[]) => arr.reduce(fn, initial)

export const slice = (start?: number, end?: number) => <A>(arr: A[]) => arr.slice(start, end)
export const take = (nb: number) => slice(0, nb)
export const skip = (nb: number) => slice(nb)

export const sort = <A>(ord: Ord<A>) => <C extends A>(arr: C[]): C[] =>
  arr
    .map(of)
    .sort(pipe(ord, contramap(NEA.head)))
    .map(NEA.head)

export const reverse = <A>(arr: A[]) => arr.slice().reverse()

export const toDict = <A, B>(
  fn: (value: A, index: number) => string | number,
  reducer: (acc: B, current: A) => B,
  initial: (value: A) => B
) => (arr: A[]) => {
  const res: Dict<B> = {}
  for (let i = 0; i < arr.length; ++i) {
    const value = arr[i]
    const key = fn(value, i)
    const curr = res[key]
    res[key] = isSome(curr) ? reducer(curr, value) : initial(value)
  }
  return res
}

export const groupBy = <A>(fn: (value: A, index: number) => string | number) =>
  toDict<A, NonEmptyArray<A>>(fn, (arr, value) => (arr.push(value), arr), of)

export const indexBy = <A>(fn: (value: A, index: number) => string | number, strategy: (a: A, b: A) => A = _last2) =>
  toDict<A, A>(fn, strategy, identity)

export const countBy = <A>(fn: (value: A, index: number) => string | number) =>
  toDict<A, number>(fn, add(1), constant(1))

export const chunksOf = (size: number) => <A>(arr: A[]) => {
  const count = Math.ceil(arr.length / size)
  const chunks: Array<NonEmptyArray<A>> = Array(count)
  for (let i = 0; i < count; ++i) {
    const start = i * size
    const end = Math.min(start + size, arr.length)
    chunks[i] = arr.slice(start, end) as NonEmptyArray<A>
  }
  return chunks
}

export function uniq<T>(arr: T[] | readonly T[]): T[] {
  return from(new Set<T>(arr))
}

export const uniqBy = <A>(fn: (value: A) => string | number) => (arr: A[]): A[] =>
  pipe(arr, indexBy(fn, first), D.values)

export const union = <A>(fn: (value: A) => string | number, member: A[]) => (arr: A[]): A[] =>
  pipe(arr, indexBy(fn, first), D.union(pipe(member, indexBy(fn, first))), D.values)

export const intersect = <A>(fn: (value: A) => string | number, member: A[]) => (arr: A[]): A[] =>
  pipe(arr, indexBy(fn, first), D.intersect(pipe(member, indexBy(fn, first))), D.values)

export const difference = <A>(fn: (value: A) => string | number, member: A[]) => (arr: A[]): A[] =>
  pipe(arr, indexBy(fn, first), D.difference(pipe(member, indexBy(fn, first))), D.values)

export const pluck = <K extends string>(key: K) => <A extends Record<K, any>>(arr: A[]) => arr.map((v) => v[key])

export function partition<A, B extends A>(fn: Refinement<A, B>): (arr: A[]) => [B[], InverseRefinement<A, B>[]]
export function partition<A>(fn: Predicate<A>): (arr: A[]) => [A[], A[]]
export function partition(fn: any) {
  return partitionMap((value) => (fn(value) ? ok(value) : ko(value)))
}

export const partitionMap = <A, B, C>(fn: (value: A) => Result<B, C>) => (arr: Array<A>): [B[], C[]] => {
  const ok: B[] = []
  const ko: C[] = []
  for (let i = 0; i < arr.length; ++i) {
    const value = arr[i]
    const res = fn(value)
    if (isOk(res)) {
      ok.push(res.ok)
    } else {
      ko.push(res.ko)
    }
  }
  return [ok, ko]
}

export const separate = <A, E>(arr: Array<Result<A, E>>) => pipe(arr, partitionMap(identity))

export const isNonEmpty = <A>(arr: A[]): arr is NonEmptyArray<A> => arr.length > 0

export const min = <A>(ord: Ord<A>) => <C extends A>(arr: C[]): Option<C> =>
  isNonEmpty(arr) ? pipe(arr, NEA.min(ord)) : undefined

export const max = <A>(ord: Ord<A>) => min(inverse(ord))

export const find = <A>(fn: (value: A, index: number) => boolean) => (arr: A[]): Option<A> => arr.find(fn)

export const includes = <A>(fn: (value: A, index: number) => boolean) => (arr: A[]): boolean => isSome(arr.find(fn))

export const empty = <A>(): A[] => []

export const sum = (arr: number[]) => arr.reduce(add, 0)
export const sumBy = <A>(fn: (value: A) => number) => (arr: A[]) => arr.reduce((a, b) => a + fn(b), 0)

export const push = fcurry2((arr: any[], value: any): any[] => (arr.push(value), arr)) as {
  <T>(arr: T[], value: T): NonEmptyArray<T>
  <T>(value: T): (arr: T[]) => NonEmptyArray<T>
}

/**
 * @namespace Arr
 *
 * @description
 *
 * The `Arr` namespace contains all utilities related to Arrays.
 *
 * The utilities in this namespace are similar to the array utilities you can find in `underscore` or `lodash`.
 *
 * The big difference however is that they are pipeable, which means they can be chained like in the example below.
 *
 * ```ts
 * const nb = pipe(
 *   [1,2,-3,4,-5],
 *   Arr.map(a => a * 2),
 *   Arr.filter(a => a >= 0),
 *   Arr.last
 * )
 *
 * expect(nb).toBe(8)
 * ```
 *
 * @see `NonEmptyArray` namespace, if you are handling arrays containing at least one element.
 *
 */
export const Arr = {
  /**
   * @description
   * Create array from value
   */
  of,

  /**
   * @description
   * Create array from an iterable
   */
  from,

  /**
   * @description
   * Get length of array
   */
  length,

  /**
   * @description
   * Check if the variable is an array
   */
  isArray,

  /**
   * @description
   * Check if the array is empty
   */
  isEmpty,

  /**
   * @description
   * Check if the array is non empty
   */
  isNonEmpty,

  /**
   * @description
   * Returns the first value in the array.
   * This function returns `undefined` when the array is empty.
   *
   * @example
   * ```ts
   * const first = pipe(
   *   [1,2,3,4],
   *   Arr.head
   * )
   *
   * expect(first).toEqual(1)
   * ```
   */
  head,

  /**
   * @description
   * Returns the last value in the array.
   * This function returns `undefined` when the array is empty.
   *
   * @example
   * ```ts
   * const last = pipe(
   *   [1,2,3,4],
   *   Arr.last
   * )
   *
   * expect(last).toEqual(4)
   * ```
   */
  last,

  /**
   * @description
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   *
   * @param fn - How to map each value
   *
   * @see `Arr.mapIndexed` if you need the index
   *
   * @example
   * ```ts
   * const nbs = pipe(
   *   [1,2,3],
   *   Arr.map(a => a + 1)
   * )
   *
   * expect(nbs).toEqual([2,3,4])
   * ```
   */
  map,

  /**
   * @description
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   *
   * @param fn - How to map each value
   *
   * @see `Arr.map` if you don't need the index
   *
   * @example
   * ```ts
   * const nbs = pipe(
   *   [1,2],
   *   Arr.mapIndexed((a, index) => `index ${index} = ${a}`)
   * )
   *
   * expect(nbs).toEqual([
   *  `index 0 = 1`,
   *  `index 1 = 2`
   * ])
   * ```
   */
  mapIndexed,

  /**
   * @description
   * Chain over array.
   *
   * @param fn - Map and return new array from value
   *
   * @see `Arr.chainIndexed` if you need the index
   * @see `Arr.map`
   * @see `Arr.flatten`
   *
   * @example
   * ```ts
   * const array = pipe(
   *   [1,2,3],
   *   Arr.chain(value => [value, value])
   * )
   *
   * expect(array).toEqual([1, 1, 2, 2, 3, 3])
   * ```
   */
  chain,

  /**
   * @description
   * Chain over an array with an index.
   *
   * @param fn - Map and return new array from value
   *
   * @see `Arr.chain` if you don't need the index
   * @see `Arr.map`
   * @see `Arr.flatten`
   *
   * @example
   * ```ts
   * const nbs = pipe(
   *   [1,2],
   *   Arr.chainIndexed((a, index) => [a, index])
   * )
   *
   * expect(nbs).toEqual([1,0,2,1])
   * ```
   */
  chainIndexed,

  /**
   * @description
   * Check if at least one element in the array matches the predicate
   *
   * @see `Arr.every`
   *
   * @example
   * ```ts
   * const childrenAges = [8, 11, 19]
   * const hasAdult = pipe(childrenAges, Arr.some(age => age >= 18))
   *
   * expect(hasAdult).toBe(true)
   * ```
   */
  some,

  /**
   * @description
   * Check if all elements in the array match the predicate
   *
   * @see `Arr.some`
   *
   * @example
   * ```ts
   * const childrenAges = [8, 11, 19]
   * const allAdults = pipe(childrenAges, Arr.every(age => age >= 18))
   *
   * expect(allAdults).toBe(false)
   * ```
   */
  every,

  /**
   * @description
   * Join array values by the given separator
   */
  join,

  /**
   * @description
   * Aggregate / accumulate all values in the array into a single value
   *
   * @example
   * ```ts
   * const nbs = [1,2,3,4]
   * const total = pipe(
   *   nbs,
   *   Arr.reduce((a, b) => a + b, 0)
   * )
   * ```
   */
  reduce,

  /**
   * @description
   * Filter items out of the array
   *
   * @param fn - Predicate or refinement on which items to remove from the array
   *
   * @see `Arr.filter`
   * @see `Arr.filterMap`
   *
   * @example
   * ```ts
   * const array = pipe(
   *   [1,-2,3],
   *   Arr.reject(value => value >= 0)
   * )
   *
   * expect(array).toEqual([-2])
   * ```
   */
  reject,

  /**
   * @description
   * Filter items out of the array
   *
   * @param fn - Predicate or refinement on which items to keep in the array
   *
   * @see `Arr.reject`
   * @see `Arr.filterMap`
   *
   * @example
   * ```ts
   * const array = pipe(
   *   [1,-2,3],
   *   Arr.filter(value => value >= 0)
   * )
   *
   * expect(array).toEqual([1, 3])
   * ```
   */
  filter,

  /**
   * @description
   * Map and filter `undefined` values out of the array
   *
   * @param fn - How to map each value of the array
   *
   * @see `Arr.filter`
   * @see `Arr.reject`
   * @see `Arr.compact`
   *
   * @example
   * ```ts
   * const values = pipe(
   *   [1,-2,3,4],
   *   Arr.filterMap(x => x >= 0 ? x + 1 : undefined)
   * )
   *
   * expect(values).toEqual([1, 3, 4])
   * ```
   */
  filterMap,

  /**
   * @description
   * Filter `undefined` values out of the array
   *
   * @see `Arr.filterMap`
   *
   * @example
   * ```ts
   * const values = pipe(
   *   [1,2,undefined,3,undefined,4],
   *   Arr.compact
   * )
   *
   * expect(values).toEqual([1, 2, 3, 4])
   * ```
   */
  compact,

  /**
   * @description
   * Concat a value or an array to an existing array. This function does not modify the existing array, but creates a new one.
   *
   * @see `Arr.flatten`
   *
   * @example
   * ```ts
   * const array = pipe(
   *   [1,2],
   *   Arr.concat([3,4,5])
   * )
   *
   * expect(array).toEqual([1, 2, 3, 4, 5])
   * ```
   */
  concat,

  /**
   * @description
   * Flatten nested arrays
   *
   * @see `Arr.chain`
   *
   * @example
   * ```ts
   * const array = pipe(
   *   [[1,2], [3,4,5]],
   *   Arr.flatten
   * )
   *
   * expect(array).toEqual([1, 2, 3, 4, 5])
   * ```
   */
  flatten,

  /**
   * @description
   * Returns a section of an array.
   *
   * @param start - The beginning of the specified portion of the array.
   * @param end - The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
   *
   * @see `Arr.take`
   * @see `Arr.skip`
   *
   * @example
   * ```ts
   * const nbs = pipe(
   *   [1,2,3,4],
   *   Arr.slice(1,2)
   * )
   *
   * expect(nbs).toEqual([2])
   * ```
   */
  slice,

  /**
   * @description
   * Take n elements at the start of the array
   *
   * @param n - The number of elements to take
   *
   * @see `Arr.slice`
   * @see `Arr.skip`
   *
   * @example
   * ```ts
   * const nbs = pipe(
   *   [1,2,3,4],
   *   Arr.take(2)
   * )
   *
   * expect(nbs).toEqual([1,2])
   * ```
   */
  take,

  /**
   * @description
   * Skip n elements from the array
   *
   * @param n - The number of elements to skip
   *
   * @see `Arr.slice`
   * @see `Arr.take`
   *
   * @example
   * ```ts
   * const nbs = pipe(
   *   [1,2,3,4],
   *   Arr.take(2)
   * )
   *
   * expect(nbs).toEqual([3,4])
   * ```
   */
  skip,

  /**
   * @description
   * Sort array by the given `Ord` function.
   *
   * @param ord - The order is used to determine which element is greater
   *
   * @example
   * ```ts
   * const nbs = pipe(
   *   [1,4,2,3],
   *   Arr.sort(Ord.number)
   * )
   *
   * expect(nbs).toEqual([1,2,3,4])
   * ```
   */
  sort,

  /**
   * @description
   * Split up the array in multiple chunks of the specified length
   *
   * @param size - Maximum chunk size
   *
   * @example
   * ```ts
   * const chunks = pipe(
   *   [1,2,3,4,5,6,7,8,9],
   *   Arr.chunksOf(4)
   * )
   *
   * expect(chunks).toEqual([[1, 2, 3, 4], [5, 6, 7, 8], [9]])
   * ```
   */
  chunksOf,

  /**
   * @description
   * Split array into multiple arrays grouped by keys.
   *
   * @param fn - How to group the elements
   *
   * @example
   * ```ts
   * const groups = pipe(
   *   ["John", "Jerry", "Betty"],
   *   Arr.groupBy(str => str[0])
   * )
   *
   * expect(groups).toEqual({
   *   "B": ["Betty"],
   *   "J": ["John", "Jerry"]
   * })
   * ```
   */
  groupBy,

  /**
   * @description
   * Count array elements matching a given key
   *
   * @param fn - How to group and count the elements
   * @example
   * ```ts
   * const groups = pipe(
   *   ["John", "Jerry", "Betty"],
   *   Arr.countBy(str => str[0])
   * )
   *
   * expect(groups).toEqual({
   *   "B": 1,
   *   "J": 2
   * })
   * ```
   */
  countBy,

  /**
   * @description
   * Index each array element by a given key
   *
   * @param fn - Returns the key for this element
   * @param strategy - Which value to retain when multiple elements are found with the same key. By default, the last value is kept
   *
   * @example
   * ```ts
   * const items = pipe(
   *   [{ id: 1, name: "John" }, { id: 2, name: "Betty" }],
   *   Arr.indexBy(item => item.id)
   * )
   *
   * expect(items).toEqual({
   *   "1": { id: 1, name: "John" },
   *   "2": { id: 2, name: "Betty" }
   * })
   * ```
   */
  indexBy,

  /**
   * @description
   * Make all array values unique, by removing all value duplicates.
   *
   * This is a specialized version of `Arr.uniqBy` and internally uses `Set`s.
   *
   * @see `Arr.uniqBy`
   *
   * @example
   * ```ts
   * const uniqNumbers = pipe(
   *   [1,4,2,2,2,1,4,3],
   *   Arr.uniq
   * )
   *
   * expect(uniqNumbers).toEqual([1,4,2,3])
   * ```
   */
  uniq,

  /**
   * @description
   * Make all array values unique, by removing all value duplicates
   * The returned array will be automatically sorted by the unique identifiers used for each value
   *
   * @param fn - Return an unique identifier for each array value
   *
   * @example
   * ```ts
   * const uniqNumbers = pipe(
   *   [1,4,2,2,2,1,4,3],
   *   Arr.uniqBy(identity)
   * )
   *
   * expect(uniqNumbers).toEqual([1,2,3,4])
   * ```
   */
  uniqBy,

  /**
   * @description
   * Combine the unique values of 2 arrays.
   * This means, all unique values of both arrays will be kept.
   *
   * The returned array will be automatically sorted by the unique identifiers used for each value
   *
   * @param fn - Return an unique identifier for each array value
   * @param member - The array with which the original array should be combined
   *
   * @see `Arr.intersect`
   * @see `Arr.difference`
   *
   * @example
   * ```ts
   * const uniqNumbers = pipe(
   *   [1,4,2,2],
   *   Arr.union(identity, [2,1,4,3])
   * )
   *
   * expect(uniqNumbers).toEqual([1,2,3,4])
   * ```
   */
  union,

  /**
   * @description
   * Intersect the unique values of 2 arrays.
   * This means, only the values that are both in `member` and the original array will be kept.
   *
   * The returned array will be automatically sorted by the unique identifiers used for each value
   *
   * @param fn - Return an unique identifier for each array value
   * @param member - The array with which the original array should be intersected
   *
   * @see `Arr.union`
   * @see `Arr.difference`
   *
   * @example
   * ```ts
   * const uniqNumbers = pipe(
   *   [1,4,2,2],
   *   Arr.intersect(identity, [2,1,4,3])
   * )
   *
   * expect(uniqNumbers).toEqual([1,2,4])
   * ```
   */
  intersect,

  /**
   * @description
   * Compute the difference between both arrays.
   * This means, all values in `member` will be removed from the original array.
   *
   * The returned array will be automatically sorted by the unique identifiers used for each value
   *
   * @param fn - Return an unique identifier for each array value
   * @param member - The array with all values to remove from the original array
   *
   * @see `Arr.union`
   * @see `Arr.intersect`
   *
   * @example
   * ```ts
   * const uniqNumbers = pipe(
   *   [1,4,2,2,5],
   *   Arr.difference(identity, [2,1,4,3])
   * )
   *
   * expect(uniqNumbers).toEqual([5])
   * ```
   */
  difference,

  /**
   * @description
   * Pluck a specific property out of the objects in the array
   *
   * @param key - Which key to pluck
   *
   * @example
   * ```ts
   * const ids = pipe(
   *   [{ id: 1 }, { id: 2 }, { id: 3}],
   *   Arr.pluck('id')
   * )
   *
   * expect(ids).toEqual([1,2,3])
   * ```
   */
  pluck,

  /**
   * @description
   * Partitions the array in 2 separate arrays.
   *
   * @param fn - Predicate or refinement on how to split the array
   *
   * @see `Arr.partitionMap`
   * @see `Arr.separate`
   *
   * @example
   * ```ts
   * const [positives, negatives] = pipe(
   *   [1, -3, 2, 9],
   *   Arr.partition(nb => nb >= 0)
   * )
   *
   * expect(positives).toEqual([1,2,9])
   * expect(negatives).toEqual([-3])
   * ```
   */
  partition,

  /**
   * @description
   * Maps and partitions the array in 2 separate arrays.
   *
   * @param fn - How to partition the array, by returning a `Result` that can either be `Ok` or `Ko`
   *
   * @see `Arr.partition`
   * @see `Arr.separate`
   *
   * @example
   * ```ts
   * const [positives, negatives] = pipe(
   *   [1, -3, 2, 9],
   *   Arr.partitionMap(nb => nb >= 0
   *     ? Result.ok(nb + 1)
   *     : Result.ko(nb - 1)
   *   )
   * )
   *
   * expect(positives).toEqual([2,3,10])
   * expect(negatives).toEqual([-4])
   * ```
   */
  partitionMap,

  /**
   * @description
   * Separate array of `Result`s in `Ok` and `Ko` values
   *
   * @see `Arr.partition`
   * @see `Arr.partitionMap`
   *
   * @example
   * ```ts
   * const [ok, ko] = pipe(
   *   [Result.ok(1), Result.ko(9), Result.ok(3)],
   *   Arr.separate
   * )
   *
   * expect(ok).toEqual([1,3])
   * expect(ko).toEqual([9])
   * ```
   */
  separate,

  /**
   * @description
   * Returns the smallest value in the array.
   * This function may return undefined if the array is empty.
   *
   * @param ord - The order is used to determine which element is smaller
   *
   * @see `Arr.min`
   *
   * @example
   * ```ts
   * const smallestNb = pipe(
   *   [1, 7, 3, 4, 2],
   *   Arr.min(Ord.number)
   * )
   *
   * expect(smallestNb).toBe(1)
   * ```
   */
  min,

  /**
   * @description
   * Returns the greatest value in the array.
   * This function may return undefined if the array is empty.
   *
   * @param ord - The order is used to determine which element is greater
   *
   * @see `Arr.min`
   *
   * @example
   * ```ts
   * const greatestNb = pipe(
   *   [1, 7, 3, 4, 2],
   *   Arr.max(Ord.number)
   * )
   *
   * expect(greatestNb).toBe(7)
   * ```
   */
  max,

  /**
   * @description
   * Reverse the array
   *
   * @example
   * ```ts
   * const nbs = pipe(
   *   [1, 2, 3],
   *   Arr.reverse
   * )
   *
   * expect(nbs).toEqual([3,2,1])
   * ```
   */
  reverse,

  /**
   * @description
   * Find the first element in the array matching the given predicate
   *
   * @param fn - How to find the value
   *
   * @example
   * ```ts
   * const nb = pipe(
   *   [1, 2, 3],
   *   Arr.find(a => a === 1)
   * )
   *
   * expect(nb).toEqual(1)
   * ```
   */
  find,

  /**
   * @description
   * Check if the array includes a specific element
   *
   * @param value - The value to find
   * @param eq - Optional function to customize comparison function
   *
   * @example
   * ```ts
   * const eqNumber = pipe(
   *   Ord.number,
   *   Ord.eq
   * )
   *
   * const hasNumber = pipe(
   *   [1, 2, 3],
   *   Arr.includes(eqNumber(2))
   * )
   *
   * expect(hasNumber).toBe(true)
   * ```
   */
  includes,

  /**
   * @description
   * Returns a new empty array
   */
  empty,

  /**
   * @description
   * Sum all numbers in the array
   *
   * @see `Arr.sumBy`
   *
   * @example
   * ```ts
   * const nb = pipe(
   *   [1,2,3,4],
   *   Arr.sum
   * )
   *
   * expect(nb).toBe(10)
   * ```
   */
  sum,

  /**
   * @description
   * Sum all items in the array
   *
   * @param fn - How to sum the items
   *
   * @see `Arr.sum`
   *
   * @example
   * ```ts
   * const nb = pipe(
   *   [1,2,3,4],
   *   Arr.sumBy(identity)
   * )
   *
   * expect(nb).toBe(10)
   * ```
   */
  sumBy,

  /**
   * @description
   * Push a new value into an existing array.
   * This function will mutate the given array and will not create a new one.
   *
   * @example
   * ```ts
   * const array = pipe(
   *   [],
   *   Arr.push("A"),
   *   Arr.push(undefined),
   *   Arr.push("B"),
   *   Arr.compact
   * )
   * ```
   */
  push
}
