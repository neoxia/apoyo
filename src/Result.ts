import { identity, pipe, throwError } from './function'
import { isSome, Option } from './Option'
import { isObject } from './types'

const enum Tags {
  Ok = 'Result.Ok',
  Ko = 'Result.Ko'
}

export interface Ok<T> {
  _tag: Tags.Ok
  ok: T
}
export interface Ko<T> {
  _tag: Tags.Ko
  ko: T
}

export type Result<A, E = never> = Ok<A> | Ko<E>

export const ok = <T>(value: T): Ok<T> => ({
  _tag: Tags.Ok,
  ok: value
})
export const ko = <T>(value: T): Ko<T> => ({
  _tag: Tags.Ko,
  ko: value
})

export const fromOption = <E = unknown>(onNone: () => E) => <A>(option: Option<A>): Result<A, E> =>
  isSome(option) ? ok(option) : ko(onNone())

export const isOk = <A, B>(result: Result<A, B>): result is Ok<A> => result._tag === Tags.Ok
export const isKo = <A, B>(result: Result<A, B>): result is Ko<B> => result._tag === Tags.Ko
export const isResult = <A = unknown, B = unknown>(result: unknown): result is Result<A, B> =>
  isObject(result) && (result._tag === Tags.Ok || result._tag === Tags.Ko)

export const get = <A, E = unknown>(result: Result<A, E>) => (isOk(result) ? result.ok : throwError(result.ko))

export const map = <A, B>(fn: (value: A) => B) => <E = unknown>(result: Result<A, E>): Result<B, E> =>
  isOk(result) ? ok(fn(result.ok)) : result

export const mapError = <B, E = unknown>(fn: (value: E) => B) => <A>(result: Result<A, E>): Result<A, B> =>
  isKo(result) ? ko(fn(result.ko)) : result

export const join = <A, E>(result: Result<Result<A, E>, E>): Result<A, E> => pipe(result, chain(identity))

export const chain = <A, B, E = unknown>(fn: (value: A) => Result<B, E>) => (result: Result<A, E>): Result<B, E> =>
  isOk(result) ? fn(result.ok) : result

export const catchError = <A, E = unknown>(fn: (err: E) => Result<A, E>) => (result: Result<A, E>): Result<A, E> =>
  isKo(result) ? fn(result.ko) : result

export const fold = <R, A, E = unknown>(onOk: (value: A) => R, onKo: (value: E) => R) => (result: Result<A, E>) => {
  return isOk(result) ? onOk(result.ok) : onKo(result.ko)
}

export const swap = <A, E>(result: Result<A, E>) =>
  pipe(
    result,
    fold(
      (value): Result<E, A> => ko(value),
      (err) => ok(err)
    )
  )

export const tryCatch = <A>(fn: () => A): Result<A, unknown> => {
  try {
    return ok(fn())
  } catch (err) {
    return ko(err)
  }
}

export const Result = {
  ok,
  ko,
  isOk,
  isKo,
  isResult,
  fromOption,
  get,
  map,
  mapError,
  join,
  chain,
  catchError,
  fold,
  swap,
  tryCatch
}
