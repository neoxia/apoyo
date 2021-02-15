import * as A from './Array'
import * as DE from './DecodeError'
import * as Dict from './Dict'
import { InverseRefinement, pipe, Predicate, Refinement } from './function'
import * as O from './Option'
import * as Result from './Result'
import {
  isBoolean,
  isDate,
  isDateFormat,
  isDatetimeFormat,
  isEmail,
  isInt,
  isNumber,
  isString,
  isUInt,
  isUUID
} from './types'
import * as Obj from './Object'

export type DecodeResult<A> = Result.Result<A, DE.DecodeError>
export interface IDecode<I, O> {
  name: string
  (input: I): Result.Result<O, DE.DecodeError>
}
export type Decode<I, O> = IDecode<I, O>

export namespace Decode {
  export type TypeOf<A> = A extends Decode<unknown, infer B> ? O.ConvertOptions<B> : never
  export type InputOf<A> = A extends Decode<infer B, unknown> ? O.ConvertOptions<B> : never
}

type Struct<A extends Dict.Dict<unknown>> = {
  [P in keyof A]: Decode<unknown, A[P]>
}

export const fromGuard = <A>(
  fn: Refinement<unknown, A>,
  message: string,
  meta?: Dict.Dict<unknown>
): Decode<unknown, A> => (input) => (fn(input) ? Result.ok(input) : Result.ko(DE.value(input, message, meta)))

export const chain = <B, C>(fn: Decode<B, C>) => <A>(decoder: Decode<A, B>): Decode<A, C> => (input) =>
  pipe(input, decoder, Result.chain(fn))

export const map = <A, B>(fn: (input: A) => B) => <I>(decoder: Decode<I, A>): Decode<I, B> => (input) =>
  pipe(input, decoder, Result.map(fn))

export function filter<A, B extends A>(
  fn: Refinement<A, B>,
  message: string,
  meta?: Dict.Dict<unknown>
): <I>(value: Decode<I, A>) => Decode<I, B>
export function filter<A>(
  fn: Predicate<A>,
  message: string,
  meta?: Dict.Dict<unknown>
): <I>(value: Decode<I, A>) => Decode<I, A>
export function filter(fn: any, message: string, meta: Dict.Dict<unknown> = {}) {
  return chain((input) => (fn(input) ? Result.ok(input) : Result.ko(DE.value(input, message, meta))))
}

export function reject<A, B extends A>(
  fn: Refinement<A, B>,
  message: string,
  meta?: Dict.Dict<unknown>
): <I>(value: Decode<I, A>) => Decode<I, InverseRefinement<A, B>>
export function reject<A>(
  fn: Predicate<A>,
  message: string,
  meta?: Dict.Dict<unknown>
): <I>(value: Decode<I, A>) => Decode<I, A>
export function reject(fn: any, message: string, meta: Dict.Dict<unknown> = {}) {
  return chain((input) => (!fn(input) ? Result.ok(input) : Result.ko(DE.value(input, message, meta))))
}

/* Primitive types */

export const unknown: Decode<unknown, unknown> = Result.ok
export const string = fromGuard(isString, `value is not a string`)
export const number = fromGuard(isNumber, `value is not a number`)
export const boolean = fromGuard(isBoolean, `value is not a boolean`)
export const Date = fromGuard(isDate, `value is not an instance of Date`)
export const unknownArray = fromGuard(A.isArray, `value is not an array`)
export const unknownDict = fromGuard(Dict.isDict, `value is not an object`)

/* Collection types */

export const array = <A>(decoder: Decode<unknown, A>): Decode<unknown, A[]> =>
  pipe(
    unknownArray,
    chain((input) =>
      pipe(
        input,
        A.mapIndexed((value, index) =>
          pipe(
            value,
            decoder,
            Result.mapError((err) => DE.index(index, err))
          )
        ),
        A.separate,
        ([success, errors]) => (errors.length > 0 ? Result.ko(DE.array(errors)) : Result.ok(success))
      )
    )
  )

export const dict = <A>(decoder: Decode<unknown, A>): Decode<unknown, Dict.Dict<A>> => {
  return pipe(
    unknownDict,
    chain((input) => {
      const [success, errors] = pipe(
        input,
        Dict.collect((source, key) =>
          pipe(
            source,
            decoder,
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

export const struct = <A extends Dict.Dict<unknown>>(props: Struct<A>, name?: string): Decode<unknown, A> => {
  const entries = Dict.toPairs(props as Dict.Dict<Decode<unknown, unknown>>)
  return pipe(
    unknownDict,
    chain((input) => {
      const [success, errors] = pipe(
        entries,
        A.map(([key, decoder]) =>
          pipe(
            input[key],
            decoder,
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

export const type = <A extends Dict.Dict<unknown>>(props: Struct<A>, name?: string): Decode<unknown, A> => {
  const decoder = struct(props, name)
  return pipe(
    unknownDict,
    chain((source) =>
      pipe(
        decoder(source),
        Result.map((parsed) => ({ ...source, ...parsed }))
      )
    )
  )
}

/* Transformer types */

export const nullable = <I, O>(decoder: Decode<I, O>): Decode<I, O | null> => (input: I) =>
  input !== null ? decoder(input) : Result.ok(null)

export const option = <I, O>(decoder: Decode<I, O>): Decode<I, O.Option<O>> => (input: I) =>
  O.isSome(input) ? decoder(input) : Result.ok(undefined)

export const ref = <A>(decoder: Decode<unknown, A>) => decoder

/* Union */

export function union<I, O1, O2>(a: Decode<I, O1>, b: Decode<I, O2>): Decode<I, O1 | O2>
export function union<I, O1, O2, O3>(a: Decode<I, O1>, b: Decode<I, O2>, c: Decode<I, O3>): Decode<I, O1 | O2 | O3>
export function union<I, O1, O2, O3, O4>(
  a: Decode<I, O1>,
  b: Decode<I, O2>,
  c: Decode<I, O3>,
  d: Decode<I, O4>
): Decode<I, O1 | O2 | O3 | O4>
export function union<I>(
  ...members: [Decode<I, unknown>, Decode<I, unknown>, ...Decode<I, unknown>[]]
): Decode<I, unknown> {
  return (input) => {
    const errors: DE.DecodeError[] = []
    for (let index = 0; index < members.length; ++index) {
      const member = members[index]
      const result = pipe(
        input,
        member,
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

/* Merge */

export function merge<I, O1 extends Dict.Dict, O2 extends Dict.Dict>(
  a: Decode<I, O1>,
  b: Decode<I, O2>
): Decode<I, O1 & O2>
export function merge<I, O1 extends Dict.Dict, O2 extends Dict.Dict, O3 extends Dict.Dict>(
  a: Decode<I, O1>,
  b: Decode<I, O2>,
  c: Decode<I, O3>
): Decode<I, O1 & O2 & O3>
export function merge<I, O1 extends Dict.Dict, O2 extends Dict.Dict, O3 extends Dict.Dict, O4 extends Dict.Dict>(
  a: Decode<I, O1>,
  b: Decode<I, O2>,
  c: Decode<I, O3>,
  d: Decode<I, O4>
): Decode<I, O1 & O2 & O3 & O4>
export function merge<I>(
  ...members: [Decode<I, Dict.Dict>, Decode<I, Dict.Dict>, ...Decode<I, Dict.Dict>[]]
): Decode<I, Dict.Dict> {
  return (input) => {
    return pipe(
      members,
      A.mapIndexed((member, index) =>
        pipe(
          member(input),
          Result.mapError((err) => DE.member(index, err))
        )
      ),
      A.separate,
      ([success, errors]) => (errors.length > 0 ? Result.ko(DE.intersect(errors)) : Result.ok(Obj.merge(...success)))
    )
  }
}

export const uuid = pipe(string, filter(isUUID, `value is not an uuid`))

export const email = pipe(string, filter(isEmail, `value is not an email`))

export const date = pipe(string, filter(isDateFormat, `value is not a date string`))

export const datetime = pipe(string, filter(isDatetimeFormat, `value is not a datetime string`))

export const int = pipe(number, filter(isInt, `value is not a integer`))

export const uint = pipe(number, filter(isUInt, `value is not an unsigned integer`))

export const nonEmptyArray = <O>(decoder: Decode<unknown, O>) =>
  pipe(array(decoder), filter(A.isNonEmpty, `array should not be empty`))

export const validate = <A>(decoder: Decode<unknown, A>) => <I>(value: I): DecodeResult<A> => decoder(value)
export const ap = <I>(value: I) => <O>(decoder: Decode<I, O>) => decoder(value)

export const lazy = <I, O>(fn: () => Decode<I, O>): Decode<I, O> => (input) => pipe(input, fn())

export const Decode = {
  unknown,
  string,
  number,
  boolean,
  Date,
  unknownArray,
  unknownDict,
  array,
  dict,
  struct,
  type,
  union,
  merge,
  option,
  nullable,
  uuid,
  email,
  int,
  uint,
  date,
  datetime,
  nonEmptyArray,
  filter,
  reject,
  fromGuard,
  chain,
  map,
  ref,
  validate,
  ap,
  lazy
}
