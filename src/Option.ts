import { Dict } from './Dict'
import { not, Predicate, Refinement } from './function'
import { isNull } from './types'

export type Falsy = null | undefined | '' | 0 | false
export type Option<A> = A | undefined

export type Some<A> = A extends null ? never : A extends undefined ? never : A

type OptionProps<A extends Dict<unknown>> = {
  [P in keyof A]: A[P] extends Some<A[P]> ? never : P
}[keyof A]

type SomeProps<A extends Dict<unknown>> = {
  [P in keyof A]: A[P] extends Some<A[P]> ? P : never
}[keyof A]

export type ConvertOptions<A> = A extends Dict<unknown>
  ? {
      [P in SomeProps<A>]: A[P] extends Dict<unknown> ? ConvertOptions<A[P]> : A[P]
    } &
      {
        [P in OptionProps<A>]?: A[P] extends Dict<unknown> ? ConvertOptions<A[P]> : A[P]
      }
  : A

export const isSome = <A>(value: Option<A>): value is A => value !== undefined
export const isNone = <A>(value: Option<A>): value is undefined => value === undefined

export const fromNullable = <T>(value: T | null): Option<T> => (isNull(value) ? undefined : value)

export const fromFalsy = <T>(value: T | Falsy): Option<T> => (!value ? undefined : value)

export const fromString = (value: string): Option<string> => (value.length === 0 ? undefined : value)

export const fromNumber = (value: number): Option<number> => (isNaN(value) ? undefined : value)

export const fromDate = (value: Date): Option<Date> => (isNaN(value.getTime()) ? undefined : value)

export const map = <A, B>(fn: (value: A) => Some<B>) => (value: Option<A>): Option<B> =>
  isSome(value) ? fn(value) : undefined

export const chain = <A, B>(fn: (value: A) => Option<B>) => (value: Option<A>): Option<B> =>
  isSome(value) ? fn(value) : undefined

export function filter<A, B extends A>(fn: Refinement<A, B>): (value: Option<A>) => Option<B>
export function filter<A>(fn: Predicate<A>): (value: Option<A>) => Option<A>
export function filter(fn: any) {
  return (value: Option<any>) => (isSome(value) && fn(value) ? value : undefined)
}

export function reject<A, B extends A>(fn: Refinement<A, B>): (value: Option<A>) => Option<B>
export function reject<A>(fn: Predicate<A>): (value: Option<A>) => Option<A>
export function reject(fn: any) {
  return filter(not(fn))
}

export const getDefault = <A>(alt: A) => (value: Option<A>): A => (isSome(value) ? value : alt)

export function get<never>(onNone: () => never): <A>(value: Option<A>) => A
export function get<A>(onNone: () => A): (value: Option<A>) => A
export function get(onNone: () => unknown) {
  return (value: Option<unknown>): unknown => (isSome(value) ? value : onNone())
}

export const fold = <R, A>(onSome: (value: A) => R, onNone: () => R) => (option: Option<A>) => {
  return isSome(option) ? onSome(option) : onNone()
}

export const Option = {
  map,
  chain,
  filter,
  reject,
  get,
  getDefault,
  fold,
  fromString,
  fromNumber,
  fromDate,
  fromNullable,
  isSome,
  isNone
}
