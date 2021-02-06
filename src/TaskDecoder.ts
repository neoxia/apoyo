import * as A from './Array'
import * as DE from './DecodeError'
import * as D from './Decoder'
import { Dict, collect, fromPairs, toPairs } from './Dict'
import { pipe, Refinement } from './function'
import { ConvertOptions } from './Option'
import * as Result from './Result'
import * as Task from './Task'
import * as TaskResult from './TaskResult'

const _tag = 'TaskDecoder'

export interface ITaskDecoder<I, O> {
  _tag: typeof _tag
  decode: (input: I) => Task.Task<Result.Result<O, DE.DecodeError>>
}
export type TaskDecoder<I, O> = ITaskDecoder<I, O>

export namespace TaskDecoder {
  export type TypeOf<A> = A extends TaskDecoder<unknown, infer B> ? ConvertOptions<B> : never
  export type InputOf<A> = A extends TaskDecoder<infer B, unknown> ? ConvertOptions<B> : never
}

type Struct<A extends Dict<unknown>> = {
  [P in keyof A]: TaskDecoder<unknown, A[P]> | D.Decoder<unknown, A[P]>
}

export const fromDecoder = <I, O>(decoder: TaskDecoder<I, O> | D.Decoder<I, O>): TaskDecoder<I, O> => {
  if (D.isDecoder<I, O>(decoder)) {
    return {
      _tag,
      decode: (input) => pipe(input, decoder.decode, Task.of)
    }
  }
  return decoder
}

export const isTaskDecoder = (a: any): a is TaskDecoder<unknown, unknown> => a && a._tag === _tag

export const parse = <B, C>(fn: (input: B) => Task.Task<D.DecodeResult<C>>) => <A>(
  decoder: TaskDecoder<A, B> | D.Decoder<A, B>
): TaskDecoder<A, C> => {
  return {
    _tag: _tag,
    decode: (input) => pipe(input, fromDecoder(decoder).decode, TaskResult.chain(fn))
  }
}

export const map = <A, B>(fn: (input: A) => B) => <I>(decoder: TaskDecoder<I, A>): TaskDecoder<I, B> => ({
  _tag: _tag,
  decode: (input) => pipe(input, decoder.decode, TaskResult.map(fn))
})

export function refine<A, B extends A>(
  fn: Refinement<A, B>,
  message: string
): <I>(value: TaskDecoder<I, A>) => TaskDecoder<I, B> {
  return parse((input) => (fn(input) ? TaskResult.ok(input) : TaskResult.ko(DE.value(input, message))))
}

/* Collection types */

export const array = <A>(decoder: TaskDecoder<unknown, A> | D.Decoder<unknown, A>): TaskDecoder<unknown, A[]> => {
  return pipe(
    D.unknownArray,
    parse((input) => {
      return pipe(
        input,
        A.mapIndexed((value, index) =>
          pipe(
            value,
            fromDecoder(decoder).decode,
            TaskResult.mapError((err) => DE.index(index, err))
          )
        ),
        Task.sequence,
        Task.map(A.separate),
        Task.map(([success, errors]) => (errors.length > 0 ? Result.ko(DE.array(errors)) : Result.ok(success)))
      )
    })
  )
}

export const dict = <A>(decoder: TaskDecoder<unknown, A> | D.Decoder<unknown, A>): TaskDecoder<unknown, Dict<A>> => {
  return pipe(
    D.unknownDict,
    parse((input) => {
      return pipe(
        input,
        collect((source, key) =>
          pipe(
            source,
            fromDecoder(decoder).decode,
            TaskResult.map((value) => [key, value] as [string, A]),
            TaskResult.mapError((err) => DE.key(key, err))
          )
        ),
        Task.sequence,
        Task.map(A.separate),
        Task.map(([success, errors]) =>
          errors.length > 0 ? Result.ko(DE.object(errors)) : Result.ok(fromPairs(success))
        )
      )
    })
  )
}

export const struct = <A extends Dict<unknown>>(props: Struct<A>, name?: string): TaskDecoder<unknown, A> => {
  const entries = toPairs(props as Dict<TaskDecoder<unknown, unknown> | D.Decoder<unknown, unknown>>)
  return pipe(
    D.unknownDict,
    parse((input) => {
      return pipe(
        entries,
        A.map(([key, decoder]) =>
          pipe(
            input[key],
            fromDecoder(decoder).decode,
            TaskResult.map((value) => [key, value] as [string, unknown]),
            TaskResult.mapError((err) => DE.key(key, err))
          )
        ),
        Task.all,
        Task.map(A.separate),
        Task.map(([success, errors]) =>
          errors.length > 0 ? Result.ko(DE.object(errors, name)) : Result.ok(fromPairs(success) as A)
        )
      )
    })
  )
}

export const type = <A extends Dict<unknown>>(props: Struct<A>, name?: string): TaskDecoder<unknown, A> => {
  const decoder = struct(props, name)
  return pipe(
    D.unknownDict,
    parse((source) =>
      pipe(
        decoder.decode(source),
        TaskResult.map((parsed) => ({ ...source, ...parsed }))
      )
    )
  )
}

/* Union */

export const union = <I, O2>(unionA: TaskDecoder<I, O2>) => <O1>(
  decoder: TaskDecoder<I, O1>
): TaskDecoder<I, O1 | O2> => {
  return {
    _tag: _tag,
    decode: (input) => async () => {
      const members: Array<TaskDecoder<I, O1 | O2>> = [decoder, unionA]
      const errors: DE.DecodeError[] = []
      for (let index = 0; index < members.length; ++index) {
        const member = members[index]
        const result = await pipe(
          input,
          member.decode,
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
}

/* Union */

export const intersect = <I extends Dict<unknown>, O2 extends Dict<unknown>>(unionA: TaskDecoder<I, O2>) => <
  O1 extends Dict<unknown>
>(
  decoder: TaskDecoder<I, O1>
): TaskDecoder<I, O1 & O2> => {
  return {
    _tag: _tag,
    decode: (input) => {
      const members: Array<TaskDecoder<I, O1 | O2>> = [decoder, unionA]
      return pipe(
        members,
        A.mapIndexed((member, index) =>
          pipe(
            input,
            member.decode,
            TaskResult.mapError((err) => DE.member(index, err))
          )
        ),
        Task.sequence,
        Task.map(A.separate),
        Task.map(([success, errors]) =>
          errors.length > 0 ? Result.ok(Object.assign({}, ...success)) : Result.ko(DE.union(errors))
        )
      )
    }
  }
}

export const ref = <A>(decoder: TaskDecoder<unknown, A>) => decoder
export const validate = <A>(decoder: TaskDecoder<unknown, A>) => <I>(value: I): Task.Task<D.DecodeResult<A>> =>
  decoder.decode(value)

export const TaskDecoder = {
  isTaskDecoder,
  fromDecoder,
  map,
  parse,
  refine,
  array,
  dict,
  struct,
  type,
  union,
  intersect,
  validate,
  ref
}
