import { identity, pipe } from './function'
import { fromArray, shift } from './List'
import * as P from './Promise'
import { Result } from './Result'

export type Task<A> = () => Promise<A>
export namespace Task {
  export type Unwrap<A> = A extends Task<infer I> ? I : A
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

export const concurrent = (concurrency = 1) => <A>(tasks: Task<A>[]): Task<A[]> => async () => {
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

export const fromIO = <A>(fn: () => Promise<A> | A): Task<A> => () => Promise.resolve().then(fn)

export const Task = {
  of,
  resolve,
  reject,
  run,
  sleep,
  delay,
  map,
  mapError,
  chain,
  chainAsync,
  catchError,
  all,
  sequence,
  concurrent,
  tryCatch,
  fromIO
}
