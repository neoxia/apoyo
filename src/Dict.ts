import { identity, pipe } from './function'
import * as Obj from './Object'
import { isSome, Option } from './Option'

export type Dict<A = unknown> = Record<string, A>

export const isDict = (input: unknown): input is Dict<unknown> => typeof input === 'object' && input !== null

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
    reduce<A, Dict<B>>((acc, value, key) => ((acc[key] = fn(value, key)), acc), {})
  )

export const map = <A, B>(fn: (value: A) => B) => mapIndexed<A, B>((v) => fn(v))

export const filterMap = <A, B>(fn: (value: A, key: string) => Option<B>) => (dict: Dict<A>) =>
  pipe(
    dict,
    reduce<A, Dict<B>>(
      (acc, value, key) => pipe(fn(value, key), (value) => (isSome(value) ? ((acc[key] = value), acc) : acc)),
      {}
    )
  )

export const compact = filterMap(identity)

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
  map,
  mapIndexed,
  filterMap,
  compact,
  reduce,
  collect,
  isDict,
  lookup,
  keys,
  values,
  fromPairs,
  toPairs,
  union,
  intersect,
  difference
}
