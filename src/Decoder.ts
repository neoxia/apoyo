import * as A from './Array'
import * as DE from './DecodeError'
import * as Dict from './Dict'
import { InverseRefinement, pipe, Predicate, Refinement } from './function'
import type { NonEmptyArray } from './NonEmptyArray'
import * as O from './Option'
import * as Result from './Result'
import { isBoolean, isDate, isDatetime, isEmail, isInt, isNumber, isString, isUInt, isUUID } from './types'

const _tag = 'Decoder'

export type DecodeResult<A> = Result.Result<A, DE.DecodeError>
export interface IDecoder<I, O> {
  _tag: typeof _tag
  decode: (input: I) => Result.Result<O, DE.DecodeError>
}
export type Decoder<I, O> = IDecoder<I, O>

export namespace Decoder {
  export type TypeOf<A> = A extends Decoder<unknown, infer B> ? O.ConvertOptions<B> : never
  export type InputOf<A> = A extends Decoder<infer B, unknown> ? O.ConvertOptions<B> : never
}

type Struct<A extends Dict.Dict<unknown>> = {
  [P in keyof A]: Decoder<unknown, A[P]>
}

export const isDecoder = <A = unknown, B = unknown>(a: any): a is Decoder<A, B> => a && a._tag === _tag

export const fromGuard = <A>(
  fn: Refinement<unknown, A>,
  message: string,
  meta?: Dict.Dict<unknown>
): Decoder<unknown, A> => ({
  _tag,
  decode: (input) => (fn(input) ? Result.ok(input) : Result.ko(DE.value(input, message, meta)))
})

export const parse = <B, C>(fn: (input: B) => DecodeResult<C>) => <A>(decoder: Decoder<A, B>): Decoder<A, C> => ({
  _tag: _tag,
  decode: (input) => pipe(input, decoder.decode, Result.chain(fn))
})

export const map = <A, B>(fn: (input: A) => B) => <I>(decoder: Decoder<I, A>): Decoder<I, B> => ({
  _tag: _tag,
  decode: (input) => pipe(input, decoder.decode, Result.map(fn))
})

export function filter<A, B extends A>(
  fn: Refinement<A, B>,
  message: string,
  meta?: Dict.Dict<unknown>
): <I>(value: Decoder<I, A>) => Decoder<I, B>
export function filter<A>(
  fn: Predicate<A>,
  message: string,
  meta?: Dict.Dict<unknown>
): <I>(value: Decoder<I, A>) => Decoder<I, A>
export function filter(fn: any, message: string, meta: Dict.Dict<unknown> = {}) {
  return parse((input) => (fn(input) ? Result.ok(input) : Result.ko(DE.value(input, message, meta))))
}

export function reject<I, A, B extends A>(
  fn: Refinement<A, B>,
  message: string,
  meta?: Dict.Dict<unknown>
): <I>(value: Decoder<I, A>) => Decoder<I, InverseRefinement<A, B>>
export function reject<A>(
  fn: Predicate<A>,
  message: string,
  meta?: Dict.Dict<unknown>
): <I>(value: Decoder<I, A>) => Decoder<I, A>
export function reject(fn: any, message: string, meta: Dict.Dict<unknown> = {}) {
  return parse((input) => (!fn(input) ? Result.ok(input) : Result.ko(DE.value(input, message, meta))))
}

/* Primitive types */

export const string = fromGuard(isString, `value is not a string`)
export const number = fromGuard(isNumber, `value is not a number`)
export const boolean = fromGuard(isBoolean, `value is not a boolean`)
export const unknownArray = fromGuard(A.isArray, `value is not an array`)
export const unknownDict = fromGuard(Dict.isDict, `value is not an object`)

/* Collection types */

export const array = <A>(decoder: Decoder<unknown, A>): Decoder<unknown, A[]> =>
  pipe(
    unknownArray,
    parse((input) =>
      pipe(
        input,
        A.mapIndexed((value, index) =>
          pipe(
            value,
            decoder.decode,
            Result.mapError((err) => DE.index(index, err))
          )
        ),
        A.separate,
        ([success, errors]) => (errors.length > 0 ? Result.ko(DE.array(errors)) : Result.ok(success))
      )
    )
  )

export const dict = <A>(decoder: Decoder<unknown, A>): Decoder<unknown, Dict.Dict<A>> => {
  return pipe(
    unknownDict,
    parse((input) => {
      const [success, errors] = pipe(
        input,
        Dict.collect((source, key) =>
          pipe(
            source,
            decoder.decode,
            Result.map((value) => [key, value] as [string, A]),
            Result.mapError((err) => DE.key(key, err))
          )
        ),
        A.separate
      )
      return errors.length > 0 ? Result.ko(DE.object(errors)) : Result.ok(Dict.fromPairs(success))
    })
  )
}

export const struct = <A extends Dict.Dict<unknown>>(props: Struct<A>, name?: string): Decoder<unknown, A> => {
  const entries = Dict.toPairs(props as Dict.Dict<Decoder<unknown, unknown>>)
  return pipe(
    unknownDict,
    parse((input) => {
      const [success, errors] = pipe(
        entries,
        A.map(([key, decoder]) =>
          pipe(
            input[key],
            decoder.decode,
            Result.map((value) => [key, value] as [string, unknown]),
            Result.mapError((err) => DE.key(key, err))
          )
        ),
        A.separate
      )
      return errors.length > 0 ? Result.ko(DE.object(errors, name)) : Result.ok(Dict.fromPairs(success) as A)
    })
  )
}

export const type = <A extends Dict.Dict<unknown>>(props: Struct<A>, name?: string): Decoder<unknown, A> => {
  const decoder = struct(props, name)
  return pipe(
    unknownDict,
    parse((source) =>
      pipe(
        decoder.decode(source),
        Result.map((parsed) => ({ ...source, ...parsed }))
      )
    )
  )
}

/* Transformer types */

export const nullable = <I, O>(decoder: Decoder<I, O>): Decoder<I, O | null> => {
  return {
    _tag: _tag,
    decode: (input: I) => (input !== null ? decoder.decode(input) : Result.ok(null))
  }
}

export const option = <I, O>(decoder: Decoder<I, O>): Decoder<I, O.Option<O>> => {
  return {
    _tag: _tag,
    decode: (input: I) => (O.isSome(input) ? decoder.decode(input) : Result.ok(undefined))
  }
}

export const ref = <A>(decoder: Decoder<unknown, A>) => decoder

/* Union */

export function union<I, O1>(a: Decoder<I, O1>): Decoder<I, O1>
export function union<I, O1, O2>(a: Decoder<I, O1>, b: Decoder<I, O2>): Decoder<I, O1 | O2>
export function union<I, O1, O2, O3>(a: Decoder<I, O1>, b: Decoder<I, O2>, c: Decoder<I, O3>): Decoder<I, O1 | O2 | O3>
export function union<I, O1, O2, O3, O4>(
  a: Decoder<I, O1>,
  b: Decoder<I, O2>,
  c: Decoder<I, O3>,
  d: Decoder<I, O4>
): Decoder<I, O1 | O2 | O3 | O4>
export function union<I>(...members: NonEmptyArray<Decoder<I, unknown>>): Decoder<I, unknown> {
  if (members.length === 1) {
    return members[0]
  }
  return {
    _tag: _tag,
    decode: (input) => {
      const errors: DE.DecodeError[] = []
      for (let index = 0; index < members.length; ++index) {
        const member = members[index]
        const result = pipe(
          input,
          member.decode,
          Result.mapError((err) => DE.member(index, err))
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

export function intersect<I, O1 extends Dict.Dict>(a: Decoder<I, O1>): Decoder<I, O1>
export function intersect<I, O1 extends Dict.Dict, O2 extends Dict.Dict>(
  a: Decoder<I, O1>,
  b: Decoder<I, O2>
): Decoder<I, O1 & O2>
export function intersect<I, O1 extends Dict.Dict, O2 extends Dict.Dict, O3 extends Dict.Dict>(
  a: Decoder<I, O1>,
  b: Decoder<I, O2>,
  c: Decoder<I, O3>
): Decoder<I, O1 & O2 & O3>
export function intersect<I, O1 extends Dict.Dict, O2 extends Dict.Dict, O3 extends Dict.Dict, O4 extends Dict.Dict>(
  a: Decoder<I, O1>,
  b: Decoder<I, O2>,
  c: Decoder<I, O3>,
  d: Decoder<I, O4>
): Decoder<I, O1 & O2 & O3 & O4>
export function intersect<I>(...members: NonEmptyArray<Decoder<I, unknown>>): Decoder<I, unknown> {
  if (members.length === 1) {
    return members[0]
  }
  return {
    _tag: _tag,
    decode: (input) => {
      const [success, errors] = pipe(
        members,
        A.mapIndexed((member, index) =>
          pipe(
            input,
            member.decode,
            Result.mapError((err) => DE.member(index, err))
          )
        ),
        A.separate
      )

      return errors.length > 0 ? Result.ok(Object.assign({}, ...success)) : Result.ko(DE.union(errors))
    }
  }
}

export const uuid = pipe(string, filter(isUUID, `value is not an uuid`))

export const email = pipe(string, filter(isEmail, `value is not an email`))

export const date = pipe(string, filter(isDate, `value is not a date string`))

export const datetime = pipe(string, filter(isDatetime, `value is not a datetime string`))

export const int = pipe(number, filter(isInt, `value is not a integer`))

export const uint = pipe(number, filter(isUInt, `value is not an unsigned integer`))

export const nonEmptyArray = <O>(decoder: Decoder<unknown, O>) =>
  pipe(array(decoder), filter(A.isNonEmpty, `array should not be empty`))

export const validate = <A>(decoder: Decoder<unknown, A>) => <I>(value: I): DecodeResult<A> => decoder.decode(value)

export const Decoder = {
  string,
  number,
  boolean,
  unknownArray,
  unknownDict,
  dict,
  array,
  struct,
  type,
  union,
  intersect,
  option,
  nullable,
  uuid,
  email,
  date,
  datetime,
  nonEmptyArray,
  filter,
  reject,
  isDecoder,
  fromGuard,
  parse,
  map,
  ref,
  validate
}
