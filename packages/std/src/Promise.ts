import type { Dict } from './Dict'
import type { Result } from './Result'

import * as D from './Dict'
import { identity } from './function'
import { pipe } from './pipe'
import { ko, ok } from './Result'
import * as T from './Task'

export type Prom<A = any> = PromiseLike<A>
export namespace Prom {
  export type Unwrap<A> = A extends Promise<infer I> ? I : A
  export type Not<A> = A extends PromiseLike<unknown> ? never : A
  export type Struct<A extends Dict<Prom>> = Prom<
    {
      [P in keyof A]: A[P] extends Prom<infer I> ? I : never
    }
  >
}

export const thunk = <A>(fn: () => PromiseLike<A> | A): Promise<A> => Promise.resolve().then(fn)

export const of = <A>(value: A) => Promise.resolve(value)
export const resolve = of
export const reject = <A>(value: A) => Promise.reject(value)

export const map = <A, B>(fn: (value: A) => Prom.Not<B>) => then(fn)

export const mapError = <B>(fn: (err: any) => Prom.Not<B>) => <A>(promise: PromiseLike<A>): Promise<A> =>
  thunk(() => promise.then(identity, (err) => reject(fn(err))))

export const chain = <A, B>(fn: (value: A) => PromiseLike<B>) => then(fn)

export const catchError = <B>(fn: (err: any) => PromiseLike<B>) => <A>(promise: PromiseLike<A>): Promise<A | B> =>
  thunk(() => promise.then(identity, (err) => fn(err)))

export const then = <A, B>(fn: (value: A) => PromiseLike<B> | B) => (promise: PromiseLike<A>): Promise<B> =>
  thunk(() => promise.then(fn))

export const tap = <A, B>(fn: (value: A) => PromiseLike<B> | B) =>
  then<A, A>((value) => thunk(() => fn(value)).then(() => value))

export const tapError = <B>(fn: (err: any) => PromiseLike<B> | B) => <A>(promise: PromiseLike<A>): Promise<A> =>
  pipe(
    promise,
    catchError((value) => thunk(() => fn(value)).then(() => reject(value)))
  )

export const sleep = (ms: number): Promise<void> => new Promise<void>((r) => setTimeout(r, ms))
export const delay = (ms: number) => <A>(prom: PromiseLike<A>): Promise<A> =>
  pipe(
    prom,
    tap(() => sleep(ms))
  )

export const all = <A>(promises: PromiseLike<A>[]): Promise<A[]> => Promise.all(promises)

export const tryCatch = <A, E = unknown>(promise: PromiseLike<A>): Promise<Result<A, E>> =>
  thunk(() => promise.then(ok, ko))

export const timeout = <A>(ms: number, fn: () => PromiseLike<A> | A) => (promise: PromiseLike<A>) =>
  Promise.race([promise, pipe(Prom.sleep(ms), Prom.then(fn))])

export function struct<A extends Dict<Prom>>(obj: A): Prom.Struct<A>
export function struct(obj: Dict<Prom>): Promise<Dict>
export function struct(obj: Dict<Prom>): Promise<Dict> {
  return pipe(obj, D.map(T.from), T.struct(T.all), T.run)
}

/**
 * @namespace Prom
 *
 * @description
 * This namespace contains various utilities for `Promise`s, as well as pipeable versions of most native methods.
 *
 * A `Promise` represents an **eager** asynchroneous action.
 *
 * @see `Task` - For lazy asynchroneous actions.
 */
export const Prom = {
  /**
   * @description
   * Creates a promise that resolves.
   */
  of,

  /**
   * @description
   * Creates a promise that resolves.
   */
  resolve,

  /**
   * @description
   * Creates a promise that rejects.
   */
  reject,

  /**
   * @description
   * Creates a promise from a thunk.
   * If the thunk throws, `fromIO` will catch the error and create a promise that rejects.
   */
  thunk,

  /**
   * @description
   * Creates a promise that waits a specific amount of milliseconds before resolving.
   *
   * @see `Prom.delay`
   */
  sleep,

  /**
   * @description
   * Taps the promise and delays the resolving by a specific amount of milliseconds.
   *
   * @see `Prom.sleep`
   *
   * @example
   * ```ts
   * const result = await pipe(
   *   Prom.of(42),
   *   Prom.delay(1000) // Waits 1 second before resolving 42
   * )
   * ```
   */
  delay,

  /**
   * @description
   * Maps over the value of a resolving promise.
   *
   * @see `Prom.mapError`
   * @see `Prom.chain`
   *
   * @example
   * ```ts
   * const result = await pipe(
   *   Prom.of(1),
   *   Prom.map(a => a + 1)
   * )
   *
   * expect(result).toBe(2)
   * ```
   */
  map,

  /**
   * @description
   * Maps over the error of a rejecting promise.
   *
   * @see `Prom.map`
   * @see `Prom.catchError`
   *
   * @example
   * ```ts
   * try {
   *   await pipe(
   *     Prom.reject(Err.of('some error')),
   *     Prom.mapError(Err.chain('could not execute xxxx'))
   *   )
   * } catch (err) {
   *   expect(err.message).toBe("could not execute xxxx: some error")
   * }
   * ```
   */
  mapError,

  /**
   * @description
   * Chain another promise to execute when the promise resolves.
   *
   * @see `Prom.map`
   * @see `Prom.catchError`
   *
   * @example
   * ```ts
   * const result = await pipe(
   *   Prom.of(1),
   *   Prom.chain(a => pipe(
   *     Prom.of(a + 1),
   *     Prom.delay(1000)
   *   ))
   * )
   *
   * expect(result).toBe(2)
   * ```
   */
  chain,

  /**
   * @description
   * Chain another promise to execute when the promise rejects.
   *
   * @see `Prom.mapError`
   * @see `Prom.chain`
   *
   * @example
   * ```ts
   * const result = await pipe(
   *   Prom.reject(Err.of('some error', { name: 'SomeError' })),
   *   Prom.catchError(err =>
   *     pipe(err, Err.hasName('SomeError'))
   *      ? Prom.of('success')
   *      : Prom.reject('reject')
   *   )
   * )
   *
   * expect(result).toBe('success')
   * ```
   */
  catchError,

  /**
   * @description
   * Pipeable version of the native Promise.then function.
   */
  then,

  /**
   * @description
   * When the promise resolves, execute a side-effect on the current value without modifying the value
   *
   * @example
   * ```ts
   * const result = await pipe(
   *   Prom.of(42),
   *   Prom.tap(value => console.log('received value', value)),
   *   Prom.map(a => a + 1)
   * )
   *
   * expect(result).toBe(43)
   * ```
   */
  tap,

  /**
   * @description
   * When the promise rejects, execute a side-effect on the current error without modifying the error
   *
   * @example
   * ```ts
   * const [, error] = await pipe(
   *   Prom.reject(new Error('Internal error')),
   *   Prom.tapError(err => console.error('An error occured', err)),
   *   Prom.tryCatch,
   *   Prom.map(Result.mapError(Err.toError)),
   *   Prom.map(Result.tuple)
   * )
   *
   * expect(error?.message).toBe('Internal error')
   * ```
   */
  tapError,

  /**
   * @description
   * Combine an array of promises into a single promise.
   * As promises are eager and executed directly, all promises are executed in parallel.
   *
   * To execute promises in sequence / in concurrency, use `Task`s.
   *
   * @see `Task.all`
   * @see `Task.sequence`
   * @see `Task.concurrent`
   *
   * @example
   * ```ts
   * const results = await pipe(
   *   [Prom.of(1), Prom.of(2), Prom.of(3)],
   *   Prom.all
   * )
   *
   * expect(results).toEqual([1,2,3])
   * ```
   */
  all,

  /**
   * @description
   * Try/catch a promise:
   * - A promise that resolves will return an `Ok`.
   * - A promise that rejects will return a `Ko`.
   *
   * @example
   * ```ts
   * const result = await pipe(
   *   Prom.reject(4),
   *   Prom.tryCatch
   * )
   *
   * expect(result).toEqual(Result.ko(4))
   * ```
   */
  tryCatch,

  /**
   * @description
   * Merge a struct of `Promise`s into a single `Promise`.
   *
   * @see `Task.struct` if you want to limit concurrency
   *
   * @example
   * ```ts
   * const relations = await pipe(
   *   {
   *     profiles: findProfilesByUserId(userId),
   *     permissions: findPermissionsByUserId(userId),
   *     posts: findPostsByUserId(userId),
   *     friends: findFriendsByUserId(userId),
   *   },
   *   Prom.struct
   * )
   * ```
   */
  struct,

  /**
   * @description
   * Timeout a promise after the given amount of milliseconds.
   *
   * @example
   * ```ts
   * const original = pipe(
   *   Prom.sleep(10000),
   *   Prom.map(() => "Hello!")
   * )
   *
   * const withTimeout = await pipe(
   *   original,
   *   Prom.timeout(5000, () => Prom.reject(Err.of('Timeout!'))),
   *   Prom.tryCatch
   * )
   *
   * expect(pipe(withTimeout, Result.isKo)).toBe(true)
   * ```
   */
  timeout
}
