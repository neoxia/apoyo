import { Result, ko, ok } from './Result'

export const of = <A>(value: A) => Promise.resolve(value)
export const resolve = of
export const reject = <A>(value: A) => Promise.reject(value)

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export const map = <A, B>(fn: (value: A) => B) => (promise: Promise<A>): Promise<B> => promise.then(fn)

export const chain = <A, B>(fn: (value: A) => Promise<B>) => (promise: Promise<A>): Promise<B> => promise.then(fn)

export const then = <A, B>(fn: (value: A) => B | Promise<B>) => (promise: Promise<A>): Promise<B> => promise.then(fn)

export const mapError = <A>(fn: (err: any) => any) => (promise: Promise<A>): Promise<A> =>
  promise.catch((err) => Promise.reject(fn(err)))

export const alt = <A, B>(fn: (err: any) => Promise<B>) => (promise: Promise<A>): Promise<A | B> =>
  promise.catch((err) => fn(err))

export const catchError = <A, B>(fn: (err: any) => B | Promise<B>) => (promise: Promise<A>): Promise<A | B> =>
  promise.catch((err) => fn(err))

export const all = <A>(promises: Promise<A>[]): Promise<A[]> => Promise.all(promises)

export const tryCatch = <A, E = unknown>(promise: Promise<A>): Promise<Result<A, E>> => promise.then(ok, ko)

export type Prom<A> = Promise<A>
export const Prom = {
  of,
  resolve,
  reject,
  sleep,
  map,
  mapError,
  chain,
  alt,
  then,
  catchError,
  all,
  tryCatch
}
