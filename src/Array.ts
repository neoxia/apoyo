import * as Dict from './Dict'
import { incrementBy, constant, first, identity, InverseRefinement, not, pipe, Predicate, Refinement } from './function'
import * as NEA from './NonEmptyArray'
import { isSome, Option } from './Option'
import { contramap, inverse, Ord } from './Ord'
import { Result, isOk, ok, ko } from './Result'

export const isArray = (arr: unknown): arr is unknown[] => Array.isArray(arr)

export const isEmpty = <A>(arr: A[]): arr is [] => arr.length === 0

export const length = <A>(arr: A[]) => arr.length

export const of = <A>(value: A): NEA.NonEmptyArray<A> => [value]

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

export const chainIndexed = <A, B>(fn: (value: A, index: number, arr: A[]) => B[]) => (arr: A[]) =>
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

export const reduce = <A, B>(fn: (acc: B, current: A) => B, initial: B) => (arr: A[]) => arr.reduce(fn, initial)

export const slice = (start?: number, end?: number) => <A>(arr: A[]) => arr.slice(start, end)
export const take = (nb: number) => slice(0, nb)
export const skip = (nb: number) => slice(nb)

export const sort = <A>(ord: Ord<A>) => (arr: A[]) =>
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
  const res: Dict.Dict<B> = {}
  for (let i = 0; i < arr.length; ++i) {
    const value = arr[i]
    const key = fn(value, i)
    const curr = res[key]
    res[key] = isSome(curr) ? reducer(curr, value) : initial(value)
  }
  return res
}

export const groupBy = <A>(fn: (value: A, index: number) => string | number) =>
  toDict<A, NEA.NonEmptyArray<A>>(fn, (arr, value) => (arr.push(value), arr), of)

export const indexBy = <A>(strategy: (a: A, b: A) => A, fn: (value: A, index: number) => string | number) =>
  toDict<A, A>(fn, strategy, identity)

export const countBy = <A>(fn: (value: A, index: number) => string | number) =>
  toDict<A, number>(fn, incrementBy(1), constant(1))

export const chunksOf = (size: number) => <A>(arr: A[]) => {
  const count = Math.ceil(arr.length / size)
  const chunks: Array<NEA.NonEmptyArray<A>> = Array(count)
  for (let i = 0; i < count; ++i) {
    const start = i * size
    const end = Math.min(start + size, arr.length)
    chunks[i] = arr.slice(start, end) as NEA.NonEmptyArray<A>
  }
  return chunks
}

export const uniq = <A>(fn: (value: A) => string | number) => (arr: A[]): A[] =>
  pipe(arr, indexBy(first, fn), Dict.values)

export const union = <A>(fn: (value: A) => string | number, member: A[]) => (arr: A[]): A[] =>
  pipe(arr, indexBy(first, fn), Dict.union(pipe(member, indexBy(first, fn))), Dict.values)

export const intersect = <A>(fn: (value: A) => string | number, member: A[]) => (arr: A[]): A[] =>
  pipe(arr, indexBy(first, fn), Dict.intersect(pipe(member, indexBy(first, fn))), Dict.values)

export const difference = <A>(fn: (value: A) => string | number, member: A[]) => (arr: A[]): A[] =>
  pipe(arr, indexBy(first, fn), Dict.difference(pipe(member, indexBy(first, fn))), Dict.values)

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

export const isNonEmpty = <A>(arr: A[]): arr is NEA.NonEmptyArray<A> => arr.length > 0

export const min = <A>(ord: Ord<A>) => (arr: A[]): Option<A> => (isNonEmpty(arr) ? pipe(arr, NEA.min(ord)) : undefined)

export const max = <A>(ord: Ord<A>) => min(inverse(ord))

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
  take,
  skip,
  sort,
  chunksOf,
  groupBy,
  countBy,
  indexBy,
  uniq,
  union,
  intersect,
  difference,
  pluck,
  partition,
  partitionMap,
  separate
}
