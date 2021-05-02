import type { Option } from './Option'

import * as A from './Array'
import { identity, InverseRefinement, not, pipe } from './function'
import * as Obj from './Object'
import { isSome } from './Option'

export type Dict<A = any> = Record<string, A>
export namespace Dict {
  export interface Predicate<A> {
    (value: A, key: string): boolean
  }
  export interface Refinement<A, B extends A> {
    (value: A, key: string): value is B
  }
}

export const isDict = (input: unknown): input is Dict<unknown> => typeof input === 'object' && input !== null

export const isEmpty = (dict: Dict<unknown>): boolean => pipe(dict, keys, A.isEmpty)

export const set = <A>(key: string | number, value: A) => (dict: Dict<A>): Dict<A> => ((dict[key] = value), dict)

export const lookup = (key: string | number) => <A>(dict: Dict<A>): Option<A> => dict[key]

export const reduce = <A, B>(fn: (acc: B, value: A, key: string) => B, initial: B) => (dict: Dict<A>): B => {
  let result: B = initial
  const props = Object.keys(dict)
  const len = props.length
  for (let i = 0; i < len; ++i) {
    const key = props[i]
    const value = dict[key]
    result = fn(result, value, key)
  }
  return result
}

export const mapIndexed = <A, B>(fn: (value: A, key: string) => B) => (dict: Dict<A>) =>
  pipe(
    dict,
    reduce<A, Dict<B>>((acc, value, key) => pipe(acc, set(key, fn(value, key))), {})
  )

export const map = <A, B>(fn: (value: A) => B) => mapIndexed<A, B>((v) => fn(v))

export function filter<A, B extends A>(fn: Dict.Refinement<A, B>): (dict: Dict<A>) => Dict<B>
export function filter<A>(fn: Dict.Predicate<A>): (arr: Dict<A>) => Dict<A>
export function filter(fn: any) {
  return (arr: Dict<unknown>) =>
    pipe(
      arr,
      reduce<unknown, Dict>((acc, value, key) => (fn(value, key) ? pipe(acc, set(key, value)) : acc), {})
    )
}

export function reject<A, B extends A>(fn: Dict.Refinement<A, B>): (arr: Dict<A>) => Dict<InverseRefinement<A, B>>
export function reject<A>(fn: Dict.Predicate<A>): (arr: Dict<A>) => Dict<A>
export function reject(fn: any) {
  return filter(not(fn))
}

export const filterMap = <A, B>(fn: (value: A, key: string) => Option<B>) => (dict: Dict<A>): Dict<B> =>
  pipe(
    dict,
    reduce<A, Dict<B>>(
      (acc, value, key) => pipe(fn(value, key), (value) => (isSome(value) ? pipe(acc, set(key, value)) : acc)),
      {}
    )
  )

export const compact = <A>(value: Dict<Option<A>>): Dict<A> => pipe(value, filterMap(identity))

export const collect = <A, B>(fn: (value: A, key: string) => B) => (dict: Dict<A>) =>
  pipe(
    dict,
    reduce<A, B[]>((acc, value, key) => (acc.push(fn(value, key)), acc), [])
  )

export const values = <A>(dict: Dict<A>): Array<A> => pipe(dict, collect(identity))

export const keys = <A>(dict: Dict<A>): Array<string> => Object.keys(dict)

export const fromPairs = <A>(pairs: [string, A][]): Dict<A> => {
  const dict: Dict<A> = {}
  for (let i = 0; i < pairs.length; ++i) {
    const [key, value] = pairs[i]
    dict[key] = value
  }
  return dict
}

export const toPairs = <A>(dict: Dict<A>) =>
  pipe(
    dict,
    collect<A, [string, A]>((value, key) => [key, value])
  )

export const union = <A>(member: Dict<A>) => (dict: Dict<A>): Dict<A> => Obj.merge(member, dict)
export const intersect = <A>(member: Dict<A>) => (dict: Dict<A>): Dict<A> =>
  pipe(
    dict,
    filterMap((value, key) => (isSome(member[key]) ? value : undefined))
  )

export const difference = <A>(member: Dict<A>) => (dict: Dict<A>): Dict<A> =>
  pipe(
    dict,
    filterMap((value, key) => (isSome(member[key]) ? undefined : value))
  )

export const Dict = {
  /**
   * @description
   * Check if object is empty
   *
   * @example
   * ```ts
   * expect(Dict.isEmpty({})).toBe(true)
   * ```
   */
  isEmpty,

  /**
   * @description
   * Lookup a specific key from the dict
   *
   * @example
   * ```ts
   * const value = pipe(
   *   {
   *     firstName: 'John',
   *     lastName: 'Doe'
   *   },
   *   Dict.lookup('lastName')
   * )
   *
   * expect(value).toBe('Doe')
   * ```
   */
  lookup,

  /**
   * @description
   * Set the value of a specific key in a `Dict`
   *
   * @sideEffects this method mutates the given `Dict`
   *
   * @example
   * ```ts
   * const original = {
   *   firstName: 'John'
   * }
   * const mutated = pipe(
   *   original,
   *   Dict.set('lastName', 'Doe')
   * )
   *
   * expect(mutated === original).toBe(true)
   * expect(mutated.lastName).toBe('Doe')
   * ```
   */
  set,

  /**
   * @description
   * Calls a defined callback function on each element of a `Dict`.
   * This function returns a new `Dict` that contains the results.
   *
   * @param fn - How to map each value
   *
   * @see `Dict.mapIndexed` if you need the key
   *
   * @example
   * ```ts
   * const result = pipe(
   *   {
   *     firstName: 'John',
   *     lastName: 'Doe'
   *   },
   *   Dict.map(Str.upper)
   * )
   *
   * expect(attrs !== result).toBe(true)
   * expect(result.firstName).toBe('JOHN')
   * expect(result.lastName).toBe('DOE')
   * ```
   */
  map,

  /**
   * @description
   * Calls a defined callback function on each element of a `Dict`.
   * This function returns a new `Dict` that contains the results.
   *
   * @param fn - How to map each value
   *
   * @see `Dict.map` if you don't need the key
   *
   * @example
   * ```ts
   * const result = pipe(
   *   {
   *     firstName: 'John',
   *     lastName: 'Doe'
   *   },
   *   Dict.map((str, key) => `${key} = ${str}`)
   * )
   *
   * expect(attrs !== result).toBe(true)
   * expect(result.firstName).toBe('firstName = John')
   * expect(result.lastName).toBe('lastName = Doe')
   * ```
   */
  mapIndexed,

  /**
   * @description
   * Filter items out of the array
   *
   * @param fn - Predicate or refinement on which items to keep in the `Dict`
   *
   * @see `Dict.reject`
   * @see `Dict.filterMap`
   *
   * @example
   * ```ts
   * const result = pipe(
   *   {
   *     nb1: 1,
   *     nb2: -3,
   *     nb3: 2,
   *   },
   *   Dict.filter(value => value >= 0)
   * )
   *
   * expect(result).toEqual({
   *   nb1: 1,
   *   nb3: 2
   * })
   * ```
   */
  filter,

  /**
   * @description
   * Filter items out of the array
   *
   * @param fn - Predicate or refinement on which items to remove from the `Dict`
   *
   * @see `Dict.filter`
   * @see `Dict.filterMap`
   *
   * @example
   * ```ts
   * const result = pipe(
   *   {
   *     nb1: 1,
   *     nb2: -3,
   *     nb3: 2,
   *   },
   *   Dict.reject(value => value >= 0)
   * )
   *
   * expect(result).toEqual({
   *   nb2: -3
   * })
   * ```
   */
  reject,

  /**
   * @description
   * Map and filter `undefined` values out of the `Dict`
   *
   * @param fn - How to map each value of the `Dict`
   *
   * @see `Dict.filter`
   * @see `Dict.reject`
   * @see `Dict.compact`
   *
   * @example
   * ```ts
   * const result = pipe(
   *   {
   *     firstName: "John",
   *     lastName: null
   *   },
   *   Dict.filterMap(value => value !== null
   *     ? pipe(value, Str.upper)
   *     : undefined
   *   )
   * )
   *
   * expect(result).toEqual({
   *   firstName: "JOHN"
   * })
   * ```
   */
  filterMap,

  /**
   * @description
   * Filter `undefined` values out of the `Dict`
   *
   * @see `Dict.filterMap`
   *
   * @example
   * ```ts
   * const values = pipe(
   *   {
   *     firstName: "John",
   *     lastName: undefined
   *   },
   *   Dict.compact
   * )
   *
   * expect(values).toEqual({
   *   firstName: "John"
   * })
   * ```
   */
  compact,

  /**
   * @description
   * Iterate through and accumulate / aggregate a value with a `Dict`
   *
   * @example
   * ```ts
   * const value = pipe(
   *   {
   *     nb1: 2,
   *     nb2: 5,
   *     nb3: 3
   *   },
   *   Dict.reduce((a, b) => a + b, 0)
   * )
   *
   * expect(value).toEqual(10)
   * ```
   */
  reduce,

  /**
   * @description
   * Map over a `Dict` and return an array
   *
   * @see `Dict.keys`
   * @see `Dict.values`
   * @see `Dict.toPairs`
   *
   * @example
   * ```ts
   * const arr = pipe(
   *   {
   *     nb1: 1,
   *     nb2: -3,
   *     nb3: 2
   *   },
   *   Dict.collect((value, key) => [key, value])
   * )
   *
   * expect(arr).toEqual([
   *   ['nb1', 1],
   *   ['nb2', -3],
   *   ['nb3', 2]
   * ])
   * ```
   */
  collect,

  /**
   * @description
   * Checks if the variable is an object
   */
  isDict,

  /**
   * @description
   * Collect all keys of the `Dict`
   *
   * @see `Dict.collect`
   * @see `Dict.values`
   * @see `Dict.toPairs`
   *
   * @example
   * ```ts
   * const arr = Dict.keys({ firstName: 'John' })
   * expect(arr).toEqual(['firstName'])
   * ```
   */
  keys,

  /**
   * @description
   * Collect all values of the `Dict`
   *
   * @see `Dict.collect`
   * @see `Dict.keys`
   * @see `Dict.toPairs`
   *
   * @example
   * ```ts
   * const arr = Dict.values({ firstName: 'John' })
   * expect(arr).toEqual(['John'])
   * ```
   */
  values,

  /**
   * @description
   * Create a dict from an array of key/value pairs
   *
   * @see `Dict.toPairs`
   *
   * @example
   * ```ts
   * const dict = Dict.fromPairs([
   *   ['firstName', 'John'],
   *   ['lastName', 'Doe']
   * ])
   * expect(dict).toEqual({
   *   firstName: 'John',
   *   lastName: 'Doe'
   * })
   * ```
   */
  fromPairs,

  /**
   * @description
   * Create an array of key/value pairs from the `Dict`
   *
   * @see `Dict.collect`
   * @see `Dict.keys`
   * @see `Dict.values`
   * @see `Dict.fromPairs`
   *
   * @example
   * ```ts
   * const arr = Dict.toPairs({
   *   firstName: 'John',
   *   lastName: 'Doe'
   * })
   * expect(arr).toEqual([
   *   ['firstName', 'John'],
   *   ['lastName', 'Doe']
   * ])
   * ```
   */
  toPairs,

  /**
   * @description
   * Merge both `Dict`s.
   * The values of the original `Dict` have higher priority than the member `Dict`.
   *
   * As such, this method corresponds to:
   * ```ts
   * {
   *   ...member,
   *   ...original
   * }
   * ```
   *
   * @param member - The `Dict` with which the original `Dict` should be combined
   *
   * @example
   * ```ts
   * const merged = pipe(
   *   {
   *     firstName: 'John',
   *     lastName: 'Doe'
   *   },
   *   Dict.union({
   *     lastName: 'Smith',
   *     gender: 'M'
   *   })
   * )
   *
   * expect(merge).toEqual({
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   gender: 'M'
   * })
   * ```
   */
  union,

  /**
   * @description
   * Intersection of both `Dict`s based on their keys.
   * This means, only the keys that are both in `member` and the original `Dict` will be kept.
   *
   * @param member - The `Dict` with which the original `Dict` should be intersected
   *
   * @example
   * ```ts
   * const intersection = pipe(
   *   {
   *     firstName: 'John',
   *     lastName: 'Doe'
   *   },
   *   Dict.intersect({
   *     lastName: 'Smith',
   *     gender: 'M'
   *   })
   * )
   *
   * expect(intersection).toEqual({
   *   lastName: 'Doe'
   * })
   * ```
   */
  intersect,

  /**
   * @description
   * The difference between both `Dict`s based on their keys.
   * This means, all keys in `member` will be removed from the original `Dict`.
   *
   * @param member - The `Dict` with all keys to remove from the original `Dict`
   *
   * @example
   * ```ts
   * const diff = pipe(
   *   {
   *     firstName: 'John',
   *     lastName: 'Doe'
   *   },
   *   Dict.difference({
   *     lastName: 'Smith',
   *     gender: 'M'
   *   })
   * )
   *
   * expect(diff).toEqual({
   *   firstName: 'John'
   * })
   * ```
   */
  difference
}
