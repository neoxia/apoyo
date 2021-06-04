import type { Dict } from './Dict'

import * as A from './Array'
import * as D from './Dict'
import { fcurry2, identity, pipe } from './function'
import { fromArray, shift } from './List'
import * as P from './Promise'
import { Result } from './Result'

export type Task<T = any> = PromiseLike<T> & { _tag: 'Task' }

export namespace Task {
  export type Strategy<A = any> = (tasks: Array<Task<A>>) => Task<Array<A>>
  export type Unwrap<A> = A extends Task<infer I> ? I : A

  export type Struct<A extends Dict<Task>> = Task<
    {
      [P in keyof A]: A[P] extends Task<infer I> ? I : never
    }
  >
}

export const thunk = <A>(fn: () => PromiseLike<A> | A): Task<A> => ({
  _tag: 'Task',
  then: (onResolve, onReject) => Promise.resolve().then(fn).then(onResolve, onReject)
})

export const isTask = <A>(value: unknown): value is Task<A> => (value as any)._tag === 'Task'

export const of = <A>(value: A): Task<A> => thunk(() => P.of(value))
export const resolve = of
export const reject = (value: unknown): Task<never> => thunk(() => P.reject(value))

export const run = <A>(task: Task<A>): Promise<A> => new Promise(task.then)

export const map = <A, B>(fn: (value: A) => B) => (task: Task<A>): Task<B> => thunk(() => task.then(fn))

export const mapError = <A>(fn: (err: unknown) => unknown) => (task: Task<A>): Task<A> =>
  thunk(() => task.then(identity, (err) => P.reject(fn(err))))

export const chain = <A, B>(fn: (value: A) => PromiseLike<B>) => (task: Task<A>): Task<B> =>
  thunk(() => task.then((v) => fn(v)))

export const catchError = <A, B>(fn: (err: unknown) => Task<B>) => (task: Task<A>): Task<A | B> =>
  thunk(() => task.then(identity, (err) => fn(err)))

export const tap = <A, B>(fn: (value: A) => PromiseLike<B> | B) => (task: Task<A>): Task<A> =>
  thunk(() => pipe(task, P.tap(fn)))

export const tapError = <A, B>(fn: (value: A) => PromiseLike<B> | B) => (task: Task<A>): Task<A> =>
  thunk(() => pipe(task, P.tapError(fn)))

export const sleep = (ms: number): Task<void> => thunk(() => P.sleep(ms))
export const delay = (ms: number) => <A>(task: Task<A>): Task<A> => thunk(() => pipe(task, P.delay(ms)))

export const join = <A>(task: Task<Task<A>>): Task<A> => pipe(task, chain(identity))

export const all = <A>(tasks: Task<A>[]): Task<A[]> => thunk(() => P.all(tasks))

export const sequence = <A>(tasks: Task<A>[]): Task<A[]> =>
  thunk(async () => {
    const res: A[] = []
    for (let i = 0; i < tasks.length; ++i) {
      const task = tasks[i]
      res.push(await task)
    }
    return res
  })

export const concurrent = (concurrency: number) => <A>(tasks: Task<A>[]): Task<A[]> =>
  thunk(async () => {
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
        results[index] = await task
        item = shift(queue)
      }
    }

    const p: Promise<void>[] = []
    for (let i = 0; i < concurrency; ++i) {
      p.push(loop())
    }
    await P.all(p)
    return results
  })

export const tryCatch = <A, E = unknown>(task: Task<A>): Task<Result<A, E>> => thunk(() => P.tryCatch(task))

export const timeout = <A>(ms: number, fn: () => PromiseLike<A> | A) => (task: Task<A>) =>
  thunk(() => pipe(task, P.timeout(ms, fn)))

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
   * Check if variable is a task
   */
  isTask,

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
   * Chain a `Task` or any other `PromiseLike` to execute when the `Task` resolves.
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
   * When the tasks resolves, execute a side-effect on the current value without modifying the value
   *
   * @example
   * ```ts
   * const result = await pipe(
   *   Task.of(42),
   *   Task.tap(value => console.log('received value', value)),
   *   Task.map(a => a + 1)
   * )
   *
   * expect(result).toBe(43)
   * ```
   */
  tap,

  /**
   * @description
   * When the task rejects, execute a side-effect on the current error without modifying the error
   *
   * @example
   * ```ts
   * const [, error] = await pipe(
   *   Task.reject(new Error('Internal error')),
   *   Task.tapError(err => console.error('An error occured', err)),
   *   Task.tryCatch,
   *   Task.map(Result.mapError(Err.toError)),
   *   Task.map(Result.tuple)
   * )
   *
   * expect(error?.message).toBe('Internal error')
   * ```
   */
  tapError,

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
