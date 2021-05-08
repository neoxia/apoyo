import { Dict, InverseRefinement, Option, pipe, Predicate, Refinement, Result } from '@apoyo/std'
import { DecodeError } from './DecodeError'

export type DecoderResult<A> = Result<A, DecodeError>

export type Decoder<I, O> = {
  name: string
  (input: I): Result<O, DecodeError>
}

export namespace Decoder {
  export type TypeOf<A> = A extends Decoder<unknown, infer B> ? Option.Struct<B> : never
  export type InputOf<A> = A extends Decoder<infer B, unknown> ? Option.Struct<B> : never
}

export const fromGuard = <I, O extends I>(
  fn: Refinement<I, O>,
  message: string,
  meta?: Dict<unknown>
): Decoder<I, O> => (input) => (fn(input) ? Result.ok(input) : Result.ko(DecodeError.value(input, message, meta)))

export const parse = <B, C>(fn: Decoder<B, C>) => <A>(decoder: Decoder<A, B>): Decoder<A, C> => (input) =>
  pipe(input, decoder, Result.chain(fn))

export const map = <A, B>(fn: (input: A) => B) => <I>(decoder: Decoder<I, A>): Decoder<I, B> => (input) =>
  pipe(input, decoder, Result.map(fn))

export const nullable = <I, O>(decoder: Decoder<I, O>): Decoder<I, O | null> => (input: I) =>
  input === null ? Result.ok(null) : decoder(input)

export const optional = <I, O>(decoder: Decoder<I, O>): Decoder<I, O | undefined> => (input: I) =>
  input === undefined ? Result.ok(undefined) : decoder(input)

export function filter<A, B extends A>(
  fn: Refinement<A, B>,
  message: string,
  meta?: Dict<unknown>
): <I>(value: Decoder<I, A>) => Decoder<I, B>
export function filter<A>(
  fn: Predicate<A>,
  message: string,
  meta?: Dict<unknown>
): <I>(value: Decoder<I, A>) => Decoder<I, A>
export function filter(fn: any, message: string, meta: Dict<unknown> = {}) {
  return parse((input) => (fn(input) ? Result.ok(input) : Result.ko(DecodeError.value(input, message, meta))))
}

export function reject<A, B extends A>(
  fn: Refinement<A, B>,
  message: string,
  meta?: Dict<unknown>
): <I>(value: Decoder<I, A>) => Decoder<I, InverseRefinement<A, B>>
export function reject<A>(
  fn: Predicate<A>,
  message: string,
  meta?: Dict<unknown>
): <I>(value: Decoder<I, A>) => Decoder<I, A>
export function reject(fn: any, message: string, meta: Dict<unknown> = {}) {
  return parse((input) => (!fn(input) ? Result.ok(input) : Result.ko(DecodeError.value(input, message, meta))))
}

export const ref = <A>(decoder: Decoder<unknown, A>) => decoder

export const lazy = <I, O>(fn: () => Decoder<I, O>): Decoder<I, O> => (input) => pipe(input, fn())

export function union<I, O1, O2>(a: Decoder<I, O1>, b: Decoder<I, O2>): Decoder<I, O1 | O2>
export function union<I, O1, O2, O3>(a: Decoder<I, O1>, b: Decoder<I, O2>, c: Decoder<I, O3>): Decoder<I, O1 | O2 | O3>
export function union<I, O1, O2, O3, O4>(
  a: Decoder<I, O1>,
  b: Decoder<I, O2>,
  c: Decoder<I, O3>,
  d: Decoder<I, O4>
): Decoder<I, O1 | O2 | O3 | O4>
export function union<I>(
  ...members: [Decoder<I, unknown>, Decoder<I, unknown>, ...Decoder<I, unknown>[]]
): Decoder<I, unknown> {
  return (input) => {
    const errors: DecodeError[] = []
    for (let index = 0; index < members.length; ++index) {
      const member = members[index]
      const result = pipe(
        input,
        member,
        Result.mapError((err) => DecodeError.member(index, err))
      )
      if (Result.isOk(result)) {
        return result
      }
      errors.push(result.ko)
    }
    return Result.ko(DecodeError.union(errors))
  }
}

export const unknown: Decoder<unknown, unknown> = Result.ok

export const Decoder = {
  fromGuard,
  map,
  parse,
  nullable,
  optional,
  filter,
  reject,
  lazy,
  union,
  ref,
  unknown
}
