import * as A from './Array'
import { identity, InverseRefinement, not, pipe } from './function'
import * as Obj from './Object'
import { isSome, Option } from './Option'

export type Dict<A = unknown> = Record<string, A>
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
  isEmpty,
  lookup,
  set,
  map,
  mapIndexed,
  filter,
  reject,
  filterMap,
  compact,
  reduce,
  collect,
  isDict,
  keys,
  values,
  fromPairs,
  toPairs,
  union,
  intersect,
  difference
}
