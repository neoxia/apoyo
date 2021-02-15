import { Result, ko, ok } from './Result'

export type Prom<A> = Promise<A>
export namespace Prom {
  export type Unwrap<A> = A extends Promise<infer I> ? I : A
  export type Not<A> = A extends Promise<unknown> ? never : A
}

export const of = <A>(value: A) => Promise.resolve(value)
export const resolve = of
export const reject = <A>(value: A) => Promise.reject(value)

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
export const delay = (ms: number) => <A>(prom: Promise<A>) => prom.then((value) => sleep(ms).then(() => value))

export const map = <A, B>(fn: (value: A) => Prom.Not<B>) => (promise: Promise<A>): Promise<B> => promise.then(fn)

export const mapError = <A>(fn: (err: any) => Prom.Not<any>) => (promise: Promise<A>): Promise<A> =>
  promise.catch((err) => Promise.reject(fn(err)))

export const chain = <A, B>(fn: (value: A) => Promise<B>) => (promise: Promise<A>): Promise<B> => promise.then(fn)

export const catchError = <A, B>(fn: (err: any) => Promise<B>) => (promise: Promise<A>): Promise<A | B> =>
  promise.catch((err) => fn(err))

export const then = <A, B>(fn: (value: A) => B | Promise<B>) => (promise: Promise<A>): Promise<B> => promise.then(fn)

export const all = <A>(promises: Promise<A>[]): Promise<A[]> => Promise.all(promises)

export const tryCatch = <A, E = unknown>(promise: Promise<A>): Promise<Result<A, E>> => promise.then(ok, ko)

export const fromIO = <A>(fn: () => Promise<A> | A): Promise<A> => Promise.resolve().then(fn)

export const Prom = {
  of,
  resolve,
  reject,
  fromIO,
  sleep,
  delay,
  map,
  mapError,
  chain,
  catchError,
  then,
  all,
  tryCatch
}
