import type { Dict } from './Dict'

import * as D from './Dict'
import * as A from './Array'
import { fcurry2, identity, pipe } from './function'
import { fromArray, shift } from './List'
import * as P from './Promise'
import { Result } from './Result'

export type Task<A = any> = () => Promise<A>
export namespace Task {
  export type Strategy<A = any> = (tasks: Array<Task<A>>) => Task<Array<A>>
  export type Unwrap<A> = A extends Task<infer I> ? I : A

  export type Struct<A extends Dict<Task>> = Task<
    {
      [P in keyof A]: A[P] extends Task<infer I> ? I : never
    }
  >
}

export const of = <A>(value: A): Task<A> => () => P.of(value)
export const resolve = of
export const reject = (value: unknown): Task<never> => () => P.reject(value)

export const run = <A>(task: Task<A>): Promise<A> => task()

export const sleep = (ms: number): Task<void> => () => P.sleep(ms)
export const delay = (ms: number) => <A>(task: Task<A>): Task<A> => () => pipe(task(), P.delay(ms))

export const map = <A, B>(fn: (value: A) => B) => (task: Task<A>): Task<B> => () => task().then(fn)

export const mapError = <A>(fn: (err: unknown) => unknown) => (task: Task<A>): Task<A> => () =>
  task().catch((err) => P.reject(fn(err)))

export const chain = <A, B>(fn: (value: A) => Task<B>) => (task: Task<A>): Task<B> => () => task().then((v) => fn(v)())

export const chainAsync = <A, B>(fn: (value: A) => Promise<B>) => (task: Task<A>): Task<B> => () => task().then(fn)

export const catchError = <A, B>(fn: (err: unknown) => Task<B>) => (task: Task<A>): Task<A | B> => () =>
  task().catch((err) => run(fn(err)))

export const join = <A>(task: Task<Task<A>>): Task<A> => pipe(task, chain(identity))

export const all = <A>(tasks: Task<A>[]): Task<A[]> => async () => P.all(tasks.map(run))

export const sequence = <A>(tasks: Task<A>[]): Task<A[]> => async () => {
  const res: A[] = []
  for (let i = 0; i < tasks.length; ++i) {
    const task = tasks[i]
    res.push(await task())
  }
  return res
}

export const concurrent = (concurrency: number) => <A>(tasks: Task<A>[]): Task<A[]> => async () => {
  if (concurrency < 1) {
    throw new Error(`Concurrency should be above 1 or above`)
  }
  if (concurrency === Number.POSITIVE_INFINITY || concurrency > tasks.length) {
    concurrency = tasks.length
  }

  const results = Array(tasks.length)
  const queue = fromArray(
    tasks.map((task, index) => ({
      index,
      task
    }))
  )

  const loop = async (): Promise<void> => {
    let item = shift(queue)
    while (item) {
      const { index, task } = item
      results[index] = await task()
      item = shift(queue)
    }
  }

  const p: Promise<void>[] = []
  for (let i = 0; i < concurrency; ++i) {
    p.push(loop())
  }
  await P.all(p)
  return results
}

export const tryCatch = <A, E = unknown>(fn: Task<A>): Task<Result<A, E>> => () => P.tryCatch(fn())

export const thunk = <A>(fn: () => Promise<A> | A): Task<A> => () => Promise.resolve().then(fn)

export const timeout = <A>(ms: number, fn: Task<A>) => (task: Task<A>) => () => pipe(task(), P.timeout(ms, fn))

export const struct = fcurry2(
  (obj: Dict<Task>, strategy: Task.Strategy): Task<Dict> => {
    const toPairs = ([key, task]: [string, Task]) =>
      pipe(
        task,
        map((v) => [key, v] as [string, unknown])
      )
    return pipe(D.toPairs(obj), A.map(toPairs), strategy, map(D.fromPairs))
  }
) as {
  <A extends Dict<Task>>(obj: A, strategy: Task.Strategy): Task.Struct<A>
  (obj: Dict<Task>, strategy: Task.Strategy): Task<Dict>
  (strategy: Task.Strategy): <A extends Dict<Task>>(obj: A) => Task.Struct<A>
  (strategy: Task.Strategy): (obj: Dict<Task>) => Task<Dict>
}

/**
 * @namespace Task
 *
 * @description
 * This namespace contains various utilities for `Task`s.
 *
 * A `Task` represents a **lazy** asynchroneous action.
 *
 * @see `Prom` - For eager asynchroneous actions.
 */
export const Task = {
  /**
   * @description
   * Creates a resolving `Task`
   */
  of,

  /**
   * @description
   * Creates a resolving `Task`
   */
  resolve,

  /**
   * @description
   * Creates a rejecting `Task`
   */
  reject,

  /**
   * @description
   * Runs a `Task`
   */
  run,

  /**
   * @description
   * Creates a `Task` that waits a specific amount of milliseconds before resolving.
   *
   * @see `Task.delay`
   */
  sleep,

  /**
   * @description
   * Taps the `Task` and delays the resolving by a specific amount of milliseconds.
   *
   * @see `Task.sleep`
   *
   * @example
   * ```ts
   * const result = await pipe(
   *   Task.of(42),
   *   Task.delay(1000), // Waits 1 second before resolving 42
   *   Task.run
   * )
   *
   * expect(result).toBe(42)
   * ```
   */
  delay,

  /**
   * @description
   * Maps over the value of a resolving `Task`.
   *
   * @see `Task.mapError`
   * @see `Task.chain`
   *
   * @example
   * ```ts
   * const result = await pipe(
   *   Task.of(1),
   *   Task.map(a => a + 1),
   *   Task.run
   * )
   *
   * expect(result).toBe(2)
   * ```
   */
  map,

  /**
   * @description
   * Maps over the error of a rejecting `Task`.
   *
   * @see `Task.map`
   * @see `Task.catchError`
   *
   * @example
   * ```ts
   * try {
   *   await pipe(
   *     Task.reject(Err.of('some error')),
   *     Task.mapError(Err.chain('could not execute xxxx')),
   *     Task.run
   *   )
   * } catch (err) {
   *   expect(err.message).toBe("could not execute xxxx: some error")
   * }
   * ```
   */
  mapError,

  /**
   * @description
   * Chain another `Task` to execute when the `Task` resolves.
   *
   * @see `Task.map`
   * @see `Task.catchError`
   *
   * @example
   * ```ts
   * const result = await pipe(
   *   Task.of(1),
   *   Task.chain(a => pipe(
   *     Task.of(a + 1),
   *     Task.delay(1000)
   *   )),
   *   Task.run
   * )
   *
   * expect(result).toBe(2)
   * ```
   */
  chain,

  /**
   * @description
   * Chain another promise to execute when the `Task` resolves.
   *
   * @see `Task.map`
   * @see `Task.chain`
   *
   * @example
   * ```ts
   * const result = await pipe(
   *   Task.of(1),
   *   Task.chainAsync(async (a) => pipe(
   *     Prom.of(a + 1),
   *     Prom.delay(1000)
   *   )),
   *   Task.run
   * )
   *
   * expect(result).toBe(2)
   * ```
   */
  chainAsync,

  /**
   * @description
   * Chain another `Task` to execute when the `Task` rejects.
   *
   * @see `Task.mapError`
   * @see `Task.chain`
   *
   * @example
   * ```ts
   * const result = await pipe(
   *   Task.reject(Err.of('some error', { name: 'SomeError' })),
   *   Task.catchError(err =>
   *     pipe(err, Err.hasName('SomeError'))
   *      ? Task.of('success')
   *      : Task.reject('reject')
   *   ),
   *   Task.run
   * )
   *
   * expect(result).toBe('success')
   * ```
   */
  catchError,

  /**
   * @description
   * Combine an array of `Task`s into a single `Task`.
   * This function will execute all tasks in parallel.
   *
   * @see `Task.sequence`
   * @see `Task.concurrent`
   *
   * @example
   * ```ts
   * const results = await pipe(
   *   [Task.of(1), Task.of(2), Task.of(3)],
   *   Task.all,
   *   Task.run
   * )
   *
   * expect(results).toEqual([1,2,3])
   * ```
   */
  all,

  /**
   * @description
   * Combine an array of `Task`s into a single `Task`.
   * This function will execute all tasks in sequence.
   *
   * @see `Task.all`
   * @see `Task.concurrent`
   *
   * @example
   * ```ts
   * const results = await pipe(
   *   [Task.of(1), Task.of(2), Task.of(3)],
   *   Task.sequence,
   *   Task.run
   * )
   *
   * expect(results).toEqual([1,2,3])
   * ```
   */
  sequence,

  /**
   * @description
   * Combine an array of `Task`s into a single `Task`.
   * This function will execute all tasks in concurrency.
   *
   * @see `Task.all`
   * @see `Task.sequence`
   *
   * @example
   * ```ts
   * const results = await pipe(
   *   [Task.of(1), Task.of(2), Task.of(3)],
   *   Task.concurrent(2),
   *   Task.run
   * )
   *
   * expect(results).toEqual([1,2,3])
   * ```
   */
  concurrent,

  /**
   * @description
   * Try/catch a `Task`:
   * - A `Task` that resolves will return an `Ok`.
   * - A `Task` that rejects will return a `Ko` instead of throwing.
   *
   * @example
   * ```ts
   * const result = await pipe(
   *   Task.reject(4),
   *   Task.tryCatch
   * )
   *
   * expect(result).toEqual(Result.ko(4))
   * ```
   */
  tryCatch,

  /**
   * @description
   * Creates a `Task` from a thunk.
   * If the thunk throws, `fromIO` will catch the error and create a `Task` that rejects.
   */
  thunk,

  /**
   * @description
   * Merge a struct of `Task`s into a single `Task`.
   *
   * @see `Prom.struct`
   *
   * @example
   * ```ts
   * const relations = await pipe(
   *   {
   *     profiles: () => findProfilesByUserId(userId),
   *     permissions: () => findPermissionsByUserId(userId),
   *     posts: () => findPostsByUserId(userId),
   *     friends: () => findFriendsByUserId(userId),
   *   },
   *   Task.struct(Task.concurrent(2)),
   *   Task.run
   * )
   * ```
   */
  struct,

  /**
   * @description
   * Timeout a task after the given amount of milliseconds.
   *
   * @example
   * ```ts
   * const original = pipe(
   *   Task.sleep(10000),
   *   Task.map(() => "Hello!")
   * )
   *
   * const withTimeout = await pipe(
   *   original,
   *   Task.timeout(5000, Task.reject(Err.of('Timeout!'))),
   *   Task.tryCatch,
   *   Task.run
   * )
   *
   * expect(pipe(withTimeout, Result.isKo)).toBe(true)
   * ```
   */
  timeout
}
