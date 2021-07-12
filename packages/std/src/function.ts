import type { Arr } from './Array'
import type { Dict } from './Dict'

export * from './pipe'
export * from './flow'

export interface Predicate<A> {
  (a: A): boolean
}

export interface Refinement<A, B extends A> {
  (a: A): a is B
}

export type InverseRefinement<A, B extends A> = A extends B ? never : A

export interface FCurry2<A, B, C> {
  (x: A, y: B): C
  (y: B): (x: A) => C
}

export function fcurry2<A, B, C>(fn: (x: A, y: B) => C): FCurry2<A, B, C> {
  return function (...args: any[]) {
    return args.length === 1 ? (x: A) => fn(x, args[0]) : fn(args[0], args[1])
  } as FCurry2<A, B, C>
}

export const identity = <A>(a: A): A => a
export const constant = <A>(a: A) => () => a
export const cast = <A>(a: unknown) => a as A

export function not<A, B extends A>(fn: Refinement<A, B>): Refinement<A, InverseRefinement<A, B>>
export function not<A>(predicate: Predicate<A>): Predicate<A>
export function not<A>(predicate: Arr.Predicate<A>): Arr.Predicate<A>
export function not<A>(predicate: Dict.Predicate<A>): Dict.Predicate<A>
export function not(predicate: Function) {
  return (value: unknown, indexOrKey?: unknown) => !predicate(value, indexOrKey)
}

export const tuple = <T extends ReadonlyArray<any>>(...t: T): T => t
export const tupled = <A extends ReadonlyArray<unknown>, B>(f: (...a: A) => B) => (a: A) => f(...a)
export const untupled = <A extends ReadonlyArray<unknown>, B>(f: (a: A) => B) => (...a: A) => f(a)

export function throwError(err: unknown): never {
  throw err
}

export const first = <A, B>(a: A, _b: B) => a
export const last = <A, B>(_a: A, b: B) => b

export const add = fcurry2((a: number, b: number) => a + b) as {
  (a: number, b: number): number
  (a: number): (b: number) => number
}

export function or<A1, A2, B1 extends A1, B2 extends A2>(
  fn1: Refinement<A1, B1>,
  fn2: Refinement<A2, B2>
): Refinement<A1 | A2, B1 | B2>
export function or<A1, A2, A3, B1 extends A1, B2 extends A2, B3 extends A3>(
  fn1: Refinement<A1, B1>,
  fn2: Refinement<A2, B2>,
  fn3: Refinement<A3, B3>
): Refinement<A1 | A2 | A3, B1 | B2 | B3>
export function or<A1, A2, A3, A4, B1 extends A1, B2 extends A2, B3 extends A3, B4 extends A4>(
  fn1: Refinement<A1, B1>,
  fn2: Refinement<A2, B2>,
  fn3: Refinement<A3, B3>,
  fn4: Refinement<A4, B4>
): Refinement<A1 | A2 | A3 | A4, B1 | B2 | B3 | B4>
export function or<A>(...fns: [Predicate<A>, Predicate<A>, ...Predicate<A>[]]): Predicate<A>
export function or(...fns: any[]) {
  return (value: any, indexOrKey: number | string) => fns.some((fn) => fn(value, indexOrKey))
}

export function and<A, B extends A, C extends B>(fn1: Refinement<A, B>, fn2: Refinement<B, C>): Refinement<A, C>
export function and<A, B extends A, C extends B, D extends C>(
  fn1: Refinement<A, B>,
  fn2: Refinement<B, C>,
  fn3: Refinement<C, D>
): Refinement<A, D>
export function and<A, B extends A, C extends B, D extends C, E extends D>(
  fn1: Refinement<A, B>,
  fn2: Refinement<B, C>,
  fn3: Refinement<C, D>,
  fn4: Refinement<D, E>
): Refinement<A, E>
export function and<A>(...fns: [Predicate<A>, Predicate<A>, ...Predicate<A>[]]): Predicate<A>
export function and(...fns: any[]) {
  return (value: any, indexOrKey: number | string) => fns.every((fn) => fn(value, indexOrKey))
}

export const once = <Args extends any[], A>(fn: (...args: Args) => A) => {
  let result: A
  let done = false
  return (...args: Args) => {
    if (!done) {
      result = fn(...args)
      done = true
    }
    return result
  }
}

export const run = <A>(fn: () => A) => fn()
