import { Dict, values } from './Dict'
import { first, identity, InverseRefinement, not, pipe, Predicate, Refinement } from './function'
import { NonEmptyArray } from './NonEmptyArray'
import { isSome, Option } from './Option'
import { Ord } from './Ord'
import { Result, isOk } from './Result'

export const isArray = (arr: unknown): arr is unknown[] => Array.isArray(arr)

export const isEmpty = <A>(arr: A[]): arr is [] => arr.length === 0

export const length = <A>(arr: A[]) => arr.length

export const of = <A>(value: A) => [value]

export const head = <A>(arr: A[]): Option<A> => (arr.length > 0 ? arr[0] : undefined)
export const last = <A>(arr: A[]): Option<A> => (arr.length > 0 ? arr[arr.length - 1] : undefined)

export const mapIndexed = <A, B>(fn: (value: A, index: number, arr: A[]) => B) => (arr: A[]) => arr.map(fn)

export const map = <A, B>(fn: (value: A) => B) => (arr: A[]) => arr.map((value) => fn(value))

export const filterMap = <A, B>(fn: (value: A) => Option<B>) => (arr: A[]) => {
  const out: B[] = []
  for (let i = 0; i < arr.length; ++i) {
    const result = fn(arr[i])
    if (isSome(result)) {
      out.push(result)
    }
  }
  return out
}

export const compact = <A>(arr: Option<A>[]) => pipe(arr, filterMap(identity))

export const flatten = <A>(arr: A[][]): A[] => ([] as A[]).concat.apply([], arr)

export const chain = <A, B>(fn: (value: A) => B[]) => (arr: A[]) => pipe(arr, map(fn), flatten)

export const chainIndexed = <A, B>(fn: (value: A, index: number) => B[]) => (arr: A[]) =>
  pipe(arr, mapIndexed(fn), flatten)

export const some = <A>(fn: (value: A) => boolean) => (arr: A[]) => arr.some(fn)
export const every = <A>(fn: (value: A) => boolean) => (arr: A[]) => arr.every(fn)

export const join = (sep?: string) => <A>(arr: A[]) => arr.join(sep)

export function filter<A, B extends A>(fn: Refinement<A, B>): (arr: A[]) => B[]
export function filter<A>(fn: Predicate<A>): (arr: A[]) => A[]
export function filter(fn: any) {
  return (arr: any[]) => arr.filter(fn)
}

export function reject<A, B extends A>(fn: Refinement<A, B>): (arr: A[]) => InverseRefinement<A, B>[]
export function reject<A>(fn: Predicate<A>): (arr: A[]) => A[]
export function reject(fn: any) {
  return (arr: any[]) => arr.filter(not(fn))
}

export const slice = (start?: number, end?: number) => <A>(arr: A[]) => arr.slice(start, end)

export const sort = <A>(ord: Ord<A>) => (arr: A[]) => arr.slice().sort(ord)
export const reverse = <A>(arr: A[]) => arr.slice().reverse()

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

export const groupBy = <A>(fn: (value: A) => string | number) => (arr: A[]) => {
  const res: Dict<NonEmptyArray<A>> = {}
  for (let i = 0; i < arr.length; ++i) {
    const value = arr[i]
    const key = fn(value)
    const sublist = res[key]
    if (!sublist) {
      res[key] = [value]
    } else {
      sublist.push(value)
    }
  }
  return res
}

export const indexBy = <A>(semigroup: (a: A, b: A) => A, fn: (value: A) => string | number) => (arr: A[]) => {
  const res: Dict<A> = {}
  for (let i = 0; i < arr.length; ++i) {
    const value = arr[i]
    const key = fn(value)
    const prev = res[key]
    const next = isSome(prev) ? semigroup(prev, value) : value
    if (prev !== next) {
      res[key] = next
    }
  }
  return res
}

export const uniq = <A>(fn: (value: A) => string | number) => (arr: A[]): A[] => pipe(arr, indexBy(first, fn), values)

export const countBy = <A>(fn: (value: A) => string | number) => (arr: A[]) => {
  const res: Dict<number> = {}
  for (let i = 0; i < arr.length; ++i) {
    const value = arr[i]
    const key = fn(value)
    res[key] = (res[key] || 0) + 1
  }
  return res
}

export const union = <A>(fn: (value: A) => string | number, ...unions: A[][]) => (arr: A[]): A[] => {
  if (!unions.length) {
    return arr
  }
  const map: Dict<A> = {}
  const all = [arr, ...unions]
  for (let j = 0; j < all.length; ++j) {
    const chunk = all[j]
    for (let i = 0; i < chunk.length; ++i) {
      const value = chunk[i]
      const key = fn(value)
      if (!map[key]) {
        map[key] = value
      }
    }
  }
  return values(map)
}

export const intersection = <A>(fn: (value: A) => string | number, ...unions: A[][]) => (arr: A[]): A[] => {
  if (!unions.length) {
    return arr
  }
  const maps = pipe(unions, map(indexBy(first, fn)))
  const obj: Dict<A> = {}
  for (let i = 0; i < arr.length; ++i) {
    const value = arr[i]
    const key = fn(value)
    if (!obj[key] && maps.every((map) => map[key])) {
      obj[key] = value
    }
  }
  return values(obj)
}

export const difference = <A>(fn: (value: A) => string | number, ...unions: A[][]) => (arr: A[]): A[] => {
  if (!unions.length) {
    return arr
  }
  const maps = pipe(unions, map(indexBy(first, fn)))
  const obj: Dict<A> = {}
  for (let i = 0; i < arr.length; ++i) {
    const value = arr[i]
    const key = fn(value)
    if (!obj[key] && !maps.some((map) => map[key])) {
      obj[key] = value
    }
  }
  return values(obj)
}

export const pluck = <K extends string>(key: K) => <A extends Record<K, any>>(arr: A[]) => arr.map((v) => v[key])

export function partition<A, B extends A>(fn: Refinement<A, B>): (arr: A[]) => [B[], InverseRefinement<A, B>[]]
export function partition<A>(fn: Predicate<A>): (arr: A[]) => [A[], A[]]
export function partition(fn: any) {
  return (arr: any[]): [any[], any[]] =>
    pipe(
      arr,
      groupBy((value) => (fn(value) ? 'ok' : 'ko')),
      (dict) => [dict.ok, dict.ko]
    )
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

export type Arr<A> = Array<A>
export const Arr = {
  of,
  length,
  isArray,
  isEmpty,
  isNonEmpty,
  head,
  last,
  map,
  mapIndexed,
  chain,
  chainIndexed,
  reject,
  filter,
  filterMap,
  compact,
  flatten,
  slice,
  sort,
  chunksOf,
  groupBy,
  countBy,
  indexBy,
  uniq,
  pluck,
  partition,
  partitionMap,
  separate
}
