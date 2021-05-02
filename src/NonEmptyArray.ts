import { isNonEmpty } from './Array'
import { pipe } from './function'
import { Option } from './Option'
import * as Ord from './Ord'

export type NonEmptyArray<A> = [A, ...A[]]

export const of = <A>(value: A): NonEmptyArray<A> => [value]

export function fromArray<A>(arr: NonEmptyArray<A>): NonEmptyArray<A>
export function fromArray<A>(arr: A[]): Option<NonEmptyArray<A>>
export function fromArray<A>(arr: A[]) {
  return isNonEmpty(arr) ? arr : undefined
}

export const head = <A>(arr: NonEmptyArray<A>): A => arr[0]
export const last = <A>(arr: NonEmptyArray<A>): A => arr[arr.length - 1]

export const mapIndexed = <A, B>(fn: (value: A, index: number) => B) => (arr: NonEmptyArray<A>): NonEmptyArray<B> => {
  const res: NonEmptyArray<B> = [fn(arr[0], 0)]
  for (let i = 1; i < arr.length; ++i) {
    res.push(fn(arr[i], i))
  }
  return res
}

export const map = <A, B>(fn: (value: A) => B) => (arr: NonEmptyArray<A>): NonEmptyArray<B> =>
  pipe(
    arr,
    mapIndexed((value) => fn(value))
  )

export const min = <A>(ord: Ord.Ord<A>) => (arr: NonEmptyArray<A>): A => arr.reduce(Ord.min(ord), arr[0])
export const max = <A>(ord: Ord.Ord<A>) => min(Ord.inverse(ord))

/**
 * @namespace NonEmptyArray
 *
 * @description
 *
 * A `NonEmptyArray` is an array containing at least 1 item.
 * This means, that some function will always return a value, compared to the `Arr` utility variant.
 *
 * **Note**: An `NonEmptyArray` variable can still use all of the utilities of the `Arr` namespace.
 *
 * ```ts
 * const arrayA: Array<number> = []
 * const arrayB: NonEmptyArray<number> = [1]
 *
 * const a: Option<number> = Arr.head(arrayA)
 * const b: number = NonEmptyArray.head(arrayB)
 * ```
 */
export const NonEmptyArray = {
  /**
   * @description
   * Create a new NonEmptyArray, containing at least one element
   */
  of,

  /**
   * @description
   * Transforms an array into a `NonEmptyArray`
   * If the array is empty, the function will return `undefined` instead
   */
  fromArray,

  /**
   * @description
   * Returns the first value in the `NonEmptyArray`
   *
   * @see `Arr.head`
   * @see `NonEmptyArray.last`
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
   * Returns the last value in the `NonEmptyArray`
   *
   * @see `Arr.last`
   * @see `NonEmptyArray.head`
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
   * Calls a defined callback function on each element of an `NonEmptyArray`, and returns a new `NonEmptyArray` that contains the results.
   *
   * @param fn - How to map each value
   *
   * @see `NonEmptyArray.mapIndexed` if you need the index
   *
   * @example
   * ```ts
   * const nbs = pipe(
   *   [1,2,3],
   *   NonEmptyArray.map(a => a + 1)
   * )
   *
   * expect(nbs).toEqual([2,3,4])
   * ```
   */
  map,

  /**
   * @description
   * Calls a defined callback function on each element of an `NonEmptyArray`, and returns a new `NonEmptyArray` that contains the results.
   *
   * @param fn - How to map each value
   *
   * @see `NonEmptyArray.map` if you don't need the index
   *
   * @example
   * ```ts
   * const nbs = pipe(
   *   [1,2],
   *   NonEmptyArray.mapIndexed((a, index) => `index ${index} = ${a}`)
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
   * Returns the smallest value in the array.
   *
   * @param ord - The order is used to determine which element is smaller
   *
   * @see `Arr.min`
   * @see `NonEmptyArray.min`
   *
   * @example
   * ```ts
   * const smallestNb = pipe(
   *   [1, 7, 3, 4, 2],
   *   NonEmptyArray.min(Ord.number)
   * )
   *
   * expect(smallestNb).toBe(1)
   * ```
   */
  min,

  /**
   * @description
   * Returns the greatest value in the array.
   *
   * @param ord - The order is used to determine which element is greater
   *
   * @see `Arr.max`
   * @see `NonEmptyArray.min`
   *
   * @example
   * ```ts
   * const greatestNb = pipe(
   *   [1, 7, 3, 4, 2],
   *   NonEmptyArray.max(Ord.number)
   * )
   *
   * expect(greatestNb).toBe(7)
   * ```
   */
  max
}
