import * as A from './Array'
import * as DE from './DecodeError'
import * as D from './Decode'
import { Dict, collect, fromPairs, toPairs } from './Dict'
import { pipe } from './function'
import { ConvertOptions } from './Option'
import * as Result from './Result'
import * as Task from './Task'
import * as TaskResult from './TaskResult'
import * as Obj from './Object'
import { NonEmptyArray } from './NonEmptyArray'

export interface ITaskDecode<I, O> {
  name: string
  (input: I): Task.Task<Result.Result<O, DE.DecodeError>>
}
export type TaskDecode<I, O> = ITaskDecode<I, O>

export namespace TaskDecode {
  export type TypeOf<A> = A extends TaskDecode<unknown, infer B> ? ConvertOptions<B> : never
  export type InputOf<A> = A extends TaskDecode<infer B, unknown> ? ConvertOptions<B> : never
  export type T<I, O> = TaskDecode<I, O> | D.Decode<I, O>
  export type Strategy = <A>(tasks: Task.Task<A>[]) => Task.Task<A[]>
}

type Struct<A extends Dict<unknown>> = {
  [P in keyof A]: TaskDecode.T<unknown, A[P]>
}

export const chain = <B, C>(fn: TaskDecode.T<B, C>) => <A>(decoder: TaskDecode.T<A, B>): TaskDecode<A, C> => (input) =>
  pipe(decoder(input), TaskResult.fromResult, TaskResult.chainResult(fn))

export const chainAsync = <B, C>(fn: (input: B) => Promise<D.DecodeResult<C>>) => <A>(
  decoder: TaskDecode.T<A, B>
): TaskDecode<A, C> => (input) =>
  pipe(
    decoder(input),
    TaskResult.fromResult,
    TaskResult.chain((i) => () => fn(i))
  )

export const map = <A, B>(fn: (input: A) => B) => <I>(decoder: TaskDecode.T<I, A>): TaskDecode<I, B> => (input) =>
  pipe(decoder(input), TaskResult.fromResult, TaskResult.map(fn))

/* Collection types */

export const array = <A>(
  decoder: TaskDecode.T<unknown, A>,
  name?: string,
  strategy: TaskDecode.Strategy = Task.sequence
): TaskDecode<unknown, A[]> => {
  return pipe(
    D.unknownArray,
    chain((input) => {
      return pipe(
        input,
        A.mapIndexed((value, index) =>
          pipe(
            decoder(value),
            TaskResult.fromResult,
            TaskResult.mapError((err) => DE.index(index, err))
          )
        ),
        strategy,
        Task.map(A.separate),
        Task.map(([success, errors]) => (errors.length > 0 ? Result.ko(DE.array(errors, name)) : Result.ok(success)))
      )
    })
  )
}

export const dict = <A>(
  decoder: TaskDecode.T<unknown, A>,
  name?: string,
  strategy: TaskDecode.Strategy = Task.sequence
): TaskDecode<unknown, Dict<A>> => {
  return pipe(
    D.unknownDict,
    chain((input) => {
      return pipe(
        input,
        collect((source, key) =>
          pipe(
            decoder(source),
            TaskResult.fromResult,
            TaskResult.map((value) => [key, value] as [string, A]),
            TaskResult.mapError((err) => DE.key(key, err))
          )
        ),
        strategy,
        Task.map(A.separate),
        Task.map(([success, errors]) =>
          errors.length > 0 ? Result.ko(DE.object(errors, name)) : Result.ok(fromPairs(success))
        )
      )
    })
  )
}

export const struct = <A extends Dict<unknown>>(
  props: Struct<A>,
  name?: string,
  strategy: TaskDecode.Strategy = Task.all
): TaskDecode<unknown, A> => {
  const entries = toPairs(props as Dict<TaskDecode.T<unknown, unknown>>)
  return pipe(
    D.unknownDict,
    chain((input) => {
      return pipe(
        entries,
        A.map(([key, decoder]) =>
          pipe(
            decoder(input[key]),
            TaskResult.fromResult,
            TaskResult.map((value) => [key, value] as [string, unknown]),
            TaskResult.mapError((err) => DE.key(key, err))
          )
        ),
        strategy,
        Task.map(A.separate),
        Task.map(([success, errors]) =>
          errors.length > 0 ? Result.ko(DE.object(errors, name)) : Result.ok(fromPairs(success) as A)
        )
      )
    })
  )
}

export const type = <A extends Dict<unknown>>(
  props: Struct<A>,
  name?: string,
  strategy: TaskDecode.Strategy = Task.all
): TaskDecode<unknown, A> => {
  const decoder = struct(props, name, strategy)
  return pipe(
    D.unknownDict,
    chain((source) =>
      pipe(
        decoder(source),
        TaskResult.map((parsed) => Obj.merge(source, parsed))
      )
    )
  )
}

/* Union */

export function union<I, O1>(a: TaskDecode.T<I, O1>): TaskDecode<I, O1>
export function union<I, O1, O2>(a: TaskDecode.T<I, O1>, b: TaskDecode.T<I, O2>): TaskDecode<I, O1 | O2>
export function union<I, O1, O2, O3>(
  a: TaskDecode.T<I, O1>,
  b: TaskDecode.T<I, O2>,
  c: TaskDecode.T<I, O3>
): TaskDecode<I, O1 | O2 | O3>
export function union<I, O1, O2, O3, O4>(
  a: TaskDecode.T<I, O1>,
  b: TaskDecode.T<I, O2>,
  c: TaskDecode.T<I, O3>,
  d: TaskDecode.T<I, O4>
): TaskDecode<I, O1 | O2 | O3 | O4>
export function union<I>(...members: NonEmptyArray<TaskDecode.T<I, unknown>>): TaskDecode<I, unknown> {
  return (input) => async () => {
    const errors: DE.DecodeError[] = []
    for (let index = 0; index < members.length; ++index) {
      const member = members[index]
      const result = await pipe(
        member(input),
        TaskResult.fromResult,
        TaskResult.mapError((err) => DE.member(index, err)),
        Task.run
      )
      if (Result.isOk(result)) {
        return result
      }
      errors.push(result.ko)
    }
    return Result.ko(DE.union(errors))
  }
}

/* Merge */

export function merge<I, O1 extends Dict>(a: TaskDecode.T<I, O1>): TaskDecode<I, O1>
export function merge<I, O1 extends Dict, O2 extends Dict>(
  a: TaskDecode.T<I, O1>,
  b: TaskDecode.T<I, O2>
): TaskDecode<I, O1 & O2>
export function merge<I, O1 extends Dict, O2 extends Dict, O3 extends Dict>(
  a: TaskDecode.T<I, O1>,
  b: TaskDecode.T<I, O2>,
  c: TaskDecode.T<I, O3>
): TaskDecode<I, O1 & O2 & O3>
export function merge<I, O1 extends Dict, O2 extends Dict, O3 extends Dict, O4 extends Dict>(
  a: TaskDecode.T<I, O1>,
  b: TaskDecode.T<I, O2>,
  c: TaskDecode.T<I, O3>,
  d: TaskDecode.T<I, O4>
): TaskDecode<I, O1 & O2 & O3 & O4>
export function merge<I>(...members: NonEmptyArray<TaskDecode.T<I, Dict>>): TaskDecode<I, Dict> {
  return (input) => {
    return pipe(
      members,
      A.mapIndexed((member, index) =>
        pipe(
          member(input),
          TaskResult.fromResult,
          TaskResult.mapError((err) => DE.member(index, err))
        )
      ),
      Task.sequence,
      Task.map(A.separate),
      Task.map(([success, errors]) =>
        errors.length > 0 ? Result.ko(DE.intersect(errors)) : Result.ok(Obj.merge(...success))
      )
    )
  }
}

export const ref = <A>(decoder: TaskDecode<unknown, A>) => decoder
export const validate = <A>(decoder: TaskDecode<unknown, A>) => <I>(value: I): Task.Task<D.DecodeResult<A>> =>
  decoder(value)

export const ap = <I>(value: I) => <O>(decoder: TaskDecode<I, O>) => decoder(value)

export const lazy = <I, O>(fn: () => TaskDecode<I, O>): TaskDecode<I, O> => (input) => pipe(input, fn())

export const TaskDecode = {
  map,
  chain,
  chainAsync,
  array,
  dict,
  struct,
  type,
  union,
  merge,
  validate,
  ref,
  ap,
  lazy
}
