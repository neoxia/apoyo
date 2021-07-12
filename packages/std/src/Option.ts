import { Dict } from './Dict'
import { not, Predicate, Refinement, throwError as throwErr } from './function'

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

export function get<A>(onNone: () => A): (value: Option<A>) => A
export function get<A>(defaultValue: A): (value: Option<A>) => A
export function get(valueOrFn: unknown | (() => unknown)) {
  return (value: Option<unknown>): unknown =>
    isSome(value) ? value : typeof valueOrFn === 'function' ? valueOrFn() : valueOrFn
}

export function throwError<A>(onNone: () => Error): (value: Option<A>) => A
export function throwError<A>(err: Error): (value: Option<A>) => A
export function throwError(errOrFn: Error | (() => Error)) {
  return (value: Option<unknown>): unknown =>
    isSome(value) ? value : typeof errOrFn === 'function' ? throwErr(errOrFn()) : throwErr(errOrFn)
}

/**
 * @namespace Option
 *
 * @description
 *
 * The `Option` namespace contains utilities to improve the handling of optional values.
 * The `Option` type is expressed as following:
 *
 * ```ts
 * type Option<A> = A | undefined
 * ```
 *
 * **Note**: In other libraries, the `Option` type is often either `Some` value, or `None` / `Nothing`.
 *
 */
export const Option = {
  /**
   * @description
   * Check if an optional value is not `undefined`
   */
  isSome,

  /**
   * @description
   * Check if an optional value is `undefined`
   */
  isNone,

  /**
   * @description
   * Map over an optional value, without worrying about the value being undefined
   *
   * @example
   * ```ts
   * const a: Option<number> = undefined
   * const b = pipe(
   *   a,
   *   Option.map(nb => nb * 2)
   * )
   *
   * expect(b).toBe(undefined)
   * ```
   */
  map,

  /**
   * @description
   * If the predicate is false, the value becomes `undefined`
   *
   * @see `Option.reject`
   *
   * @example
   * ```ts
   * const result = pipe(
   *   NaN,
   *   Option.filter(nb => !isNaN(nb))
   * )
   *
   * expect(result).toBe(undefined)
   * ```
   */
  filter,

  /**
   * @description
   * If the predicate is true, the value becomes `undefined`
   *
   * @see `Option.filter`
   *
   * @example
   * ```ts
   * const result = pipe(
   *   NaN,
   *   Option.reject(nb => isNaN(nb))
   * )
   *
   * expect(result).toBe(undefined)
   */
  reject,

  /**
   * @description
   * For a given `Option<A>`, returns either:
   * - The value `A`
   * - The given default value if the optional value is `undefined`
   *
   * @see `Option.throwError`
   *
   * @example
   * ```ts
   * const a: Option<number> = undefined
   * const b: number = pipe(
   *   nb,
   *   Option.get(0)
   * )
   *
   * expect(b).toBe(0)
   * ```
   */
  get,

  /**
   * @description
   * For a given `Option<A>`, either:
   * - Return the value `A`
   * - Throw the given error if the optional value is `undefined`
   *
   * @see `Option.get`
   *
   * @example
   * ```ts
   * const a: Option<number> = undefined
   * const b: number = pipe(
   *   nb,
   *   Option.get(0)
   * )
   *
   * expect(b).toBe(0)
   * ```
   */
  throwError,

  /**
   * @description
   * Returns an optional value from a nullable value
   *
   * @example
   * ```ts
   * const a: number | null = null
   * const b: Option<number> = Option.fromNullable(a)
   *
   * expect(b).toBe(undefined)
   * ```
   */
  fromNullable,
  /**
   * @description
   * Returns an optional value from a falsy value
   *
   * **Note**: In Javascript, a falsy value may be undefined, null, 0, false and ""
   *
   * @example
   * ```ts
   * const a: number = 0
   * const b: Option<number> = Option.fromFalsy(a)
   *
   * expect(b).toBe(undefined)
   * ```
   */
  fromFalsy,

  /**
   * @description
   * Returns an optional value from an empty string
   *
   * @example
   * ```ts
   * const a: string = ""
   * const b: Option<string> = Option.fromString(a)
   *
   * expect(b).toBe(undefined)
   * ```
   */
  fromString,

  /**
   * @description
   * Returns an optional value from a number
   *
   * @example
   * ```ts
   * const a: number = NaN
   * const b: Option<number> = Option.fromNumber(a)
   *
   * expect(b).toBe(undefined)
   * ```
   */
  fromNumber,

  /**
   * @description
   * Returns an optional value from a Date object
   *
   * @example
   * ```ts
   * const a: Date = new Date("invalid")
   * const b: Option<Date> = Option.fromDate(a)
   *
   * expect(b).toBe(undefined)
   * ```
   */
  fromDate
}
