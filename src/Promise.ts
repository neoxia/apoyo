import { Result, ko, ok } from './Result'

export type Prom<A> = Promise<A>
export namespace Prom {
  export type Unwrap<A> = A extends Promise<infer I> ? I : A
  export type Not<A> = A extends Promise<unknown> ? never : A
}

export const of = <A>(value: A) => Promise.resolve(value)
export const resolve = of
export const reject = <A>(value: A) => Promise.reject(value)

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
export const delay = (ms: number) => <A>(prom: Promise<A>) => prom.then((value) => sleep(ms).then(() => value))

export const map = <A, B>(fn: (value: A) => Prom.Not<B>) => (promise: Promise<A>): Promise<B> => promise.then(fn)

export const mapError = <A>(fn: (err: any) => Prom.Not<any>) => (promise: Promise<A>): Promise<A> =>
  promise.catch((err) => Promise.reject(fn(err)))

export const chain = <A, B>(fn: (value: A) => Promise<B>) => (promise: Promise<A>): Promise<B> => promise.then(fn)

export const catchError = <A, B>(fn: (err: any) => Promise<B>) => (promise: Promise<A>): Promise<A | B> =>
  promise.catch((err) => fn(err))

export const then = <A, B>(fn: (value: A) => B | Promise<B>) => (promise: Promise<A>): Promise<B> => promise.then(fn)

export const all = <A>(promises: Promise<A>[]): Promise<A[]> => Promise.all(promises)

export const tryCatch = <A, E = unknown>(promise: Promise<A>): Promise<Result<A, E>> => promise.then(ok, ko)

export const fromIO = <A>(fn: () => Promise<A> | A): Promise<A> => Promise.resolve().then(fn)

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
  fromIO,

  /**
   * @description
   * Creates a promise that waits a specific amount of milliseconds before resolving.
   *
   * @see `Prom.delay`
   */
  sleep,

  /**
   * @description
   * Taps the promise and delay the resolving by a specific amount of milliseconds.
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
   * Combine an array of promises into a single promise.
   * As promises are eager and executed directly, all promises are executed in parallel.
   *
   * To execute promises in sequence / in concurrency, use `Task`s.
   *
   * @see `Task.all`
   * @see `Task.sequence`
   * @see `Task.concurrency`
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
  tryCatch
}
