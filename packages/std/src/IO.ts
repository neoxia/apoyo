import { throwError } from './function'

export type IO<A> = () => A

export const of = <A>(value: A) => () => value
export const reject = (value: unknown) => () => throwError(value)

export const isIO = <A = unknown>(fn: unknown): fn is () => A => typeof fn === 'function' && fn.length === 0

export const map = <A, B>(fn: (value: A) => B) => (ma: IO<A>): IO<B> => () => fn(ma())
export const mapError = (fn: (err: any) => any) => <A>(ma: IO<A>): IO<A> => () => {
  try {
    return ma()
  } catch (err) {
    throw fn(err)
  }
}

export const chain = <A, B>(fn: (value: A) => IO<B>) => (ma: IO<A>): IO<B> => () => fn(ma())()

export const run = <A>(fn: IO<A>) => fn()

export const IO = {
  of,
  reject,
  map,
  mapError,
  chain,
  run
}
