import type { Option } from './Option'
import type { NonEmptyArray } from './NonEmptyArray'

import { identity, pipe, throwError } from './function'
import { isSome } from './Option'
import { isObject } from './types'

const enum Tags {
  Ok = 'Result.Ok',
  Ko = 'Result.Ko'
}

export interface Ok<T> {
  _tag: Tags.Ok
  ok: T
}
export interface Ko<T> {
  _tag: Tags.Ko
  ko: T
}

export type Result<A, E = unknown> = Ok<A> | Ko<E>

export const ok = <T>(value: T): Ok<T> => ({
  _tag: Tags.Ok,
  ok: value
})
export const ko = <T>(value: T): Ko<T> => ({
  _tag: Tags.Ko,
  ko: value
})

export const fromOption = <E = unknown>(onNone: () => E) => <A>(option: Option<A>): Result<A, E> =>
  isSome(option) ? ok(option) : ko(onNone())

export const isOk = <A, B>(result: Result<A, B>): result is Ok<A> => result._tag === Tags.Ok
export const isKo = <A, B>(result: Result<A, B>): result is Ko<B> => result._tag === Tags.Ko
export const isResult = <A = unknown, B = unknown>(result: unknown): result is Result<A, B> =>
  isObject(result) && (result._tag === Tags.Ok || result._tag === Tags.Ko)

export const get = <A, E = unknown>(result: Result<A, E>) => (isOk(result) ? result.ok : throwError(result.ko))

export const tuple = <A, E = unknown>(result: Result<A, E>): [Option<A>, Option<E>] =>
  isOk(result) ? [result.ok, undefined] : [undefined, result.ko]

export const map = <A, B>(fn: (value: A) => B) => <E = unknown>(result: Result<A, E>): Result<B, E> =>
  isOk(result) ? ok(fn(result.ok)) : result

export const mapError = <B, E = unknown>(fn: (value: E) => B) => <A>(result: Result<A, E>): Result<A, B> =>
  isKo(result) ? ko(fn(result.ko)) : result

export const join = <A, E>(result: Result<Result<A, E>, E>): Result<A, E> => pipe(result, chain(identity))

export const chain = <A, B, E = unknown>(fn: (value: A) => Result<B, E>) => (result: Result<A, E>): Result<B, E> =>
  isOk(result) ? fn(result.ok) : result

export const catchError = <A, E = unknown>(fn: (err: E) => Result<A, E>) => (result: Result<A, E>): Result<A, E> =>
  isKo(result) ? fn(result.ko) : result

export const fold = <R, A, E = unknown>(onOk: (value: A) => R, onKo: (value: E) => R) => (result: Result<A, E>) => {
  return isOk(result) ? onOk(result.ok) : onKo(result.ko)
}

export const swap = <A, E>(result: Result<A, E>) =>
  pipe(
    result,
    fold(
      (value): Result<E, A> => ko(value),
      (err) => ok(err)
    )
  )

export const tryCatch = <A>(fn: () => A): Result<A, unknown> => {
  try {
    return ok(fn())
  } catch (err) {
    return ko(err)
  }
}

export const tryCatchFn = <Args extends any[], T>(fun: (...args: Args) => T) => (...args: Args): Result<T, unknown> =>
  tryCatch(() => fun(...args))

export const unionBy = <T, A, E>(fn: (member: T, index: number) => Result<A, E>) => (
  members: NonEmptyArray<T>
): Result<A, E[]> => {
  const errors: E[] = []
  for (let i = 0; i < members.length; ++i) {
    const result = fn(members[i], i)
    if (Result.isOk(result)) {
      return result
    }
    errors.push(result.ko)
  }
  return Result.ko(errors)
}

export const union = <A, E>(members: NonEmptyArray<Result<A, E>>): Result<A, E[]> => pipe(members, unionBy(identity))

/**
 * @namespace Result
 *
 * @description
 * A `Result` can either `Ok` or `Ko`:
 * - `Ok` signifies the operation succeeded
 * - `Ko` signifies the operation failed
 *
 * A `Result`, being a simple variable, may also allow you to handle multiple operations that may fail, without throwing / stopping on the first failure
 *
 * @example
 * ```ts
 * const divide = (a, b) => {
 *   if (b === 0) {
 *     throw Err.of('cannot divide {a} by {b}', { a, b })
 *   }
 *   return a / b
 * }
 *
 * const [ok, ko] = pipe(
 *   [ [3,1], [3,0], [1,2], [4,0] ],
 *   Arr.map(([a, b]) => Result.tryCatch(() => divide(a, b))),
 *   Arr.separate
 * )
 * ```
 */
export const Result = {
  /**
   * @description
   * Create an `Ok` value
   */
  ok,

  /**
   * @description
   * Create a `Ko` value
   */
  ko,

  /**
   * @description
   * Check if the result is `Ok`
   *
   * @example
   * ```ts
   * const result = Result.ok(1)
   *
   * if (Result.isOk(result)) {
   *   console.log(result.ok)
   * }
   * ```
   */
  isOk,

  /**
   * @description
   * Check if the result is `Ko`
   *
   * @example
   * ```ts
   * const result = Result.ko(new Error('some error occured'))
   *
   * if (Result.isKo(result)) {
   *   console.log(result.ko)
   * }
   * ```
   */
  isKo,

  /**
   * @description
   * Check if unknown variable is a `Result`
   */
  isResult,

  /**
   * @description
   * Create a `Result` from an optional value
   *
   * @example
   * ```ts
   * const user: Result<User, Error> = pipe(
   *   users,
   *   Arr.find(u => u.id === 'xxxx'),
   *   Result.fromOption(() => new Error('could not find user'))
   * )
   * ```
   */
  fromOption,

  /**
   * @description
   * Returns value if the result is `Ok`, or throws value if result is `Ko`.
   *
   * @description
   * ```ts
   * const result = Result.ko(new Error('some error'))
   *
   * try {
   *   const value = Result.get(result)
   * } catch (err) {
   *   expect(err.message).toBe('some error')
   * }
   * ```
   */
  get,

  /**
   * @description
   * Transforms the result into a tuple [ value, error ]
   *
   * @example
   * ```ts
   * const [value, error] = Result.tryCatch(() => {
   *   throw new Error('Unknown')
   * })
   *
   * expect(value).toBe(undefined)
   * expect(error?.message).toBe('Unknown')
   * ```
   */
  tuple,

  /**
   * @description
   * Map over the `Ok` value of the `Result`.
   * The callback is not called if the result is `Ko`.
   *
   * @see `Result.mapError` - If you want to map over the `Ko` value instead
   *
   * @example
   * ```ts
   * const result = pipe(
   *   Result.ok(1),
   *   Result.map(nb => nb + 1)
   * )
   *
   * expect(result).toEqual(Result.ok(2))
   * ```
   */
  map,

  /**
   * @description
   * Map over the `Ko` value of the `Result`.
   * The callback is not called if the result is `Ok`.
   *
   * @see `Result.map` - If you want to map over the `Ok` value instead
   *
   * @example
   * ```ts
   * const result = pipe(
   *   Result.ko(new Error('some error')),
   *   Result.mapError(Err.chain('operation failed'))
   * )
   * ```
   */
  mapError,

  /**
   * @description
   * Flatten a `Result` in a `Ok` value
   *
   * @see `Result.chain` - Chain another operation returning a `Result` over an `Ok` value
   * @see `Result.catchError` - Chain another operation returning a `Result` over an `Ko` value
   *
   * @example
   * ```ts
   * const result: Result<Result<number, Error>, unknown> = pipe(
   *   Result.ok(1),
   *   Result.map(nb => nb >= 0
   *     ? Result.ok(nb + 1)
   *     : Result.ko(new Error('only positives'))
   *   )
   * )
   *
   * const after: Result<number, Error | unknown> = Result.join(result)
   * ```
   */
  join,

  /**
   * @description
   * Chain another operation returning a `Result` over an `Ok` value
   *
   * @see `Result.catchError` - Chain another operation returning a `Result` over an `Ko` value
   *
   * @example
   * ```ts
   * const result: Result<number, Error | unknown> = pipe(
   *   Result.ok(1),
   *   Result.chain(nb => nb >= 0
   *     ? Result.ok(nb + 1)
   *     : Result.ko(new Error('only positives'))
   *   )
   * )
   * ```
   */
  chain,

  /**
   * @description
   * Chain another operation returning a `Result` over an `Ko` value.
   *
   * @see `Result.chain` - Chain another operation returning a `Result` over an `Ok` value
   *
   * @example
   * ```ts
   * const result: Result<number, Error> = pipe(
   *   Result.ko(Err.of('some error', { name: 'SomeError' })),
   *   Result.catchError(err => pipe(err, Err.hasName('SomeError'))
   *     ? Result.ok(1)
   *     : Result.ko(err)
   *   )
   * )
   * ```
   */
  catchError,

  /**
   * @description
   * Fold over a `Result`:
   * - call `onOk` callback when the value is `Ok`
   * - call `onKo` callback when the value is `Ko`
   *
   * @see `Result.get`
   *
   * @example
   * ```ts
   * const str = pipe(
   *   Result.ok(1),
   *   Result.fold(
   *     (value) => `Ok = ${value}`,
   *     (err: Error) => `An error occured: ${err.message}`
   *   )
   * )
   *
   * expect(str).toBe(`Ok = 1`)
   * ```
   */
  fold,

  /**
   * @description
   * Swap `Ok` and `Ko` value
   *
   * @example
   * ```ts
   * const result = pipe(
   *   Result.ok(1),
   *   Result.swap
   * )
   *
   * expect(result).toEqual(Result.ko(1))
   * ```
   */
  swap,

  /**
   * @description
   * Try/catch an operation. The return value becomes the `Ok`, and the thrown value becomes the `Ko`
   *
   * @see `Result.fn`
   *
   * @example
   * ```ts
   * const divide = (a, b) => b === 0
   *   ? throwError(Err.of('cannot divide by zero'))
   *   : a / b
   *
   * const result = Result.tryCatch(() => divide(1, 0))
   * ```
   */
  tryCatch,

  /**
   * @description
   * Resultify the given function, making it return a `Result` instead of throwing / returning a normal value
   *
   * @see `Result.tryCatch`
   *
   * @example
   * ```
   * const divide = (a, b) => b === 0
   *   ? throwError(Err.of('cannot divide by zero'))
   *   : a / b
   *
   * const [ok, ko] = pipe(
   *   [ [1,2], [3,0], [2,3], [4,0] ],
   *   Arr.map(Result.tryCatchFn(([a, b]) => divide(a, b))),
   *   Arr.separate
   * )
   * ```
   */
  tryCatchFn,

  /**
   * @description
   * Takes a list of value as an input.
   * Applies the function one by one, and returns the first succeeding `Result` or all errors
   *
   * @example
   * ```
   * const numbers = [-2, -3, 1, -7, -12, -6]
   *
   * const firstPositive = Result.unionBy(nb => nb >= 0
   *   ? Result.ok(nb)
   *   : Result.ko(`${nb} is negative`)
   * )
   *
   * expect(pipe([-2, -3, 1, -7, -12], firstPositive)).toBe(1)
   * expect(pipe([-2, -3, -7, -12], firstPositive)).toEqual([
   *   `-2 is negative`,
   *   `-3 is negative`,
   *   `-7 is negative`,
   *   `-12 is negative`
   * ])
   * ```
   */
  unionBy,

  /**
   * @description
   * Returns the first succeeding `Result` or all errors
   *
   * @example
   * ```ts
   * const results = [Result.ko(`-2 is negative`), Result.ko(`-3 is negative`), Result.ok(1)]
   *
   * expect(pipe(results, Result.union, Result.get)).toBe(1)
   * ```
   */
  union
}
