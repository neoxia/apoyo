import { Dict } from './Dict'
import { not, Predicate, Refinement } from './function'
import { isIO, of } from './IO'

export type Falsy = null | undefined | '' | 0 | false
export type Option<A> = A | undefined

export type None = undefined
export type Some<A> = A extends undefined ? never : A
export namespace Option {
  type OptionProps<A extends Dict<unknown>> = {
    [P in keyof A]: A[P] extends Some<A[P]> ? never : P
  }[keyof A]

  type SomeProps<A extends Dict<unknown>> = {
    [P in keyof A]: A[P] extends Some<A[P]> ? P : never
  }[keyof A]

  export type Struct<A> = A extends Dict<unknown>
    ? {
        [P in SomeProps<A>]: A[P] extends Dict<unknown> ? Struct<A[P]> : A[P]
      } &
        {
          [P in OptionProps<A>]?: A[P] extends Dict<unknown> ? Struct<A[P]> : A[P]
        }
    : A
}

export const isSome = <A>(value: Option<A>): value is A => value !== undefined
export const isNone = <A>(value: Option<A>): value is undefined => value === undefined

export const fromNullable = <T>(value: T | null): Option<T> => (value === null ? undefined : value)

export const fromFalsy = <T>(value: T | Falsy): Option<T> => (!value ? undefined : value)

export const fromString = (value: string): Option<string> => (value.length === 0 ? undefined : value)

export const fromNumber = (value: number): Option<number> => (isNaN(value) ? undefined : value)

export const fromDate = (value: Date): Option<Date> => (isNaN(value.getTime()) ? undefined : value)

export const map = <A, B>(fn: (value: A) => Option<B>) => (value: Option<A>): Option<B> =>
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

export function get(onNone: () => never): <A>(value: Option<A>) => never
export function get<B>(onNone: () => B): <A>(value: Option<A>) => Some<A> | B
export function get<B>(defaultValue: B): <A>(value: Option<A>) => Some<A> | B
export function get(fn: unknown | (() => unknown)) {
  const io = isIO(fn) ? fn : of(fn)
  return (value: Option<unknown>): unknown => (isSome(value) ? value : io())
}

export const fold = <A, B, C>(onSome: (value: A) => B, onNone: () => C) => (option: Option<A>): B | C =>
  isSome(option) ? onSome(option) : onNone()

export const Option = {
  map,
  filter,
  reject,
  get,
  fold,
  fromNullable,
  fromFalsy,
  fromString,
  fromNumber,
  fromDate,
  isSome,
  isNone
}
