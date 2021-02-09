import { isNonEmpty } from './Array'
import { pipe } from './function'
import { Option } from './Option'
import { Ord, inverse } from './Ord'

export type NonEmptyArray<A> = [A, ...A[]]

export const of = <A>(value: A): NonEmptyArray<A> => [value]
export const fromArray = <A>(arr: A[]): Option<NonEmptyArray<A>> => (isNonEmpty(arr) ? arr : undefined)

export const head = <A>(arr: NonEmptyArray<A>): A => arr[0]
export const last = <A>(arr: NonEmptyArray<A>): A => arr[arr.length - 1]

export const mapIndexed = <A, B>(fn: (value: A, index: number) => B) => (arr: NonEmptyArray<A>): NonEmptyArray<B> => {
  let res: NonEmptyArray<B> = [fn(arr[0], 0)]
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

export const min = <A>(ord: Ord<A>) => (arr: NonEmptyArray<A>): A => {
  let val = arr[0]
  for (let i = 1; i < arr.length; ++i) {
    if (ord(val, arr[i]) > 0) {
      val = arr[i]
    }
  }
  return val
}

export const max = <A>(ord: Ord<A>) => min(inverse(ord))

export const NonEmptyArray = {
  map,
  mapIndexed,
  min,
  max,
  head,
  last,
  of,
  fromArray
}
