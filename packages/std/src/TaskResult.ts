import { pipe } from './function'
import { isIO } from './IO'
import * as Result from './Result'
import * as T from './Task'

export type TaskResult<A, E = unknown> = T.Task<Result.Result<A, E>>

export const ok = <A>(value: A) => T.of(Result.ok(value))
export const ko = <E>(value: E) => T.of(Result.ko(value))

export const run = <A, E = unknown>(task: TaskResult<A, E>): Promise<A> => pipe(task, T.map(Result.get), T.run)
export const get = run

export const map = <A, B>(fn: (value: A) => B) => <E>(task: TaskResult<A, E>): TaskResult<B, E> =>
  pipe(task, T.map(Result.map(fn)))

export const chain = <A, B, E>(fn: (value: A) => Result.Result<B, E> | TaskResult<B, E>) => (
  task: TaskResult<A, E>
): TaskResult<B, E> =>
  pipe(
    task,
    T.chain((res) => (Result.isOk(res) ? from(fn(res.ok)) : T.of(res)))
  )

export const mapError = <A, E, E2>(fn: (err: E) => E2) => (task: TaskResult<A, E>): TaskResult<A, E2> =>
  pipe(task, T.map(Result.mapError(fn)))

export const catchError = <A, B, E>(fn: (err: any) => Result.Result<B, E> | TaskResult<B, E>) => (
  task: TaskResult<B, E>
): TaskResult<A | B, E> =>
  pipe(
    task,
    T.chain((res) => (Result.isOk(res) ? T.of(res) : from(fn(res.ko))))
  )

export const from = <A, E>(value: Result.Result<A, E> | TaskResult<A, E>): TaskResult<A, E> =>
  isIO(value) ? value : T.of(value)

export const TaskResult = {
  ok,
  ko,
  from,
  map,
  mapError,
  chain,
  catchError,
  run,
  get
}
