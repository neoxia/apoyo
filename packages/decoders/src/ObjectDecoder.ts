import { Arr, Dict, InverseRefinement, Obj, pipe, Predicate, Refinement, Result } from '@apoyo/std'
import { DecodeError } from './DecodeError'
import { Decoder } from './Decoder'

export type ObjectDecoder<I, O extends Dict> = Decoder<I, O> & {
  props: Dict
}

type Struct<A extends Dict<unknown>> = {
  [P in keyof A]: Decoder<unknown, A[P]>
}

const create = <I, O extends Dict>(props: Dict, decoder: Decoder<I, O>): ObjectDecoder<I, O> =>
  Object.assign(decoder, { props })

export const unknownDict: Decoder<unknown, Dict<unknown>> = (input: unknown) =>
  typeof input === 'object' && input !== null
    ? Result.ok(input as Dict<unknown>)
    : Result.ko(DecodeError.value(input, `value is not an object`))

export const dict = <A>(decoder: Decoder<unknown, A>): Decoder<unknown, Dict<A>> => {
  return pipe(
    unknownDict,
    Decoder.parse((input) => {
      const [success, errors] = pipe(
        input,
        Dict.collect((source, key) =>
          pipe(
            source,
            decoder,
            Result.map((value) => [key, value] as [string, A]),
            Result.mapError((err) => DecodeError.key(key, err))
          )
        ),
        Arr.separate
      )
      return errors.length > 0 ? Result.ko(DecodeError.object(errors)) : Result.ok(Dict.fromPairs(success))
    })
  )
}

export const struct = <A extends Dict>(props: Struct<A>, name?: string): ObjectDecoder<unknown, A> => {
  const entries = Dict.toPairs(props as Dict<Decoder<unknown, unknown>>)
  return create(
    props,
    pipe(
      unknownDict,
      Decoder.parse((input) => {
        const [success, errors] = pipe(
          entries,
          Arr.map(([key, decoder]) =>
            pipe(
              input[key],
              decoder,
              Result.map((value) => [key, value] as [string, unknown]),
              Result.mapError((err) => DecodeError.key(key, err))
            )
          ),
          Arr.separate
        )
        return errors.length > 0 ? Result.ko(DecodeError.object(errors, name)) : Result.ok(Dict.fromPairs(success) as A)
      })
    )
  )
}

export function filter<A extends Dict, B extends A>(
  fn: Refinement<A, B>,
  message: string,
  meta?: Dict<unknown>
): <I>(value: ObjectDecoder<I, A>) => ObjectDecoder<I, B>
export function filter<A>(
  fn: Predicate<A>,
  message: string,
  meta?: Dict<unknown>
): <I>(value: ObjectDecoder<I, A>) => ObjectDecoder<I, A>
export function filter(fn: any, message: string, meta: Dict<unknown> = {}) {
  return (decoder: ObjectDecoder<any, any>) => create(decoder.props, pipe(decoder, Decoder.filter(fn, message, meta)))
}

export function reject<A extends Dict, B extends A>(
  fn: Refinement<A, B>,
  message: string,
  meta?: Dict<unknown>
): <I>(value: ObjectDecoder<I, A>) => ObjectDecoder<I, InverseRefinement<A, B>>
export function reject<A>(
  fn: Predicate<A>,
  message: string,
  meta?: Dict<unknown>
): <I>(value: ObjectDecoder<I, A>) => ObjectDecoder<I, A>
export function reject(fn: any, message: string, meta: Dict<unknown> = {}) {
  return (decoder: ObjectDecoder<any, any>) => create(decoder.props, pipe(decoder, Decoder.reject(fn, message, meta)))
}

export function omit<I, O extends Dict, B extends keyof O>(
  props: B[]
): (decoder: ObjectDecoder<I, O>) => ObjectDecoder<I, Omit<O, B>>
export function omit(props: string[]) {
  return (decoder: ObjectDecoder<any, any>) => pipe(decoder.props, Obj.omit(props), struct)
}

export function pick<I, O extends Dict, B extends keyof O>(
  props: B[]
): (decoder: ObjectDecoder<I, O>) => ObjectDecoder<I, Pick<O, B>>
export function pick(props: string[]) {
  return (decoder: ObjectDecoder<any, any>) => pipe(decoder.props, Obj.pick(props), struct)
}

export function partial<I, O extends Dict>(decoder: ObjectDecoder<I, O>): ObjectDecoder<I, Partial<O>>
export function partial(decoder: ObjectDecoder<any, any>) {
  return pipe(decoder.props, Dict.map(Decoder.optional), struct)
}

export const ObjectDecoder = {
  unknownDict,
  dict,
  struct,
  omit,
  pick,
  partial,
  filter,
  reject
}
