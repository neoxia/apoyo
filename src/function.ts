import { of } from './IO'

export * from './pipe'
export * from './flow'

export interface Lazy<A> {
  (): A
}

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
export const constant = of
export const cast = <A>(a: unknown) => a as A
export const not = <A>(predicate: Predicate<A>): Predicate<A> => (a) => !predicate(a)

export const tuple = <T extends ReadonlyArray<any>>(...t: T): T => t
export const tupled = <A extends ReadonlyArray<unknown>, B>(f: (...a: A) => B) => (a: A) => f(...a)
export const untupled = <A extends ReadonlyArray<unknown>, B>(f: (a: A) => B) => (...a: A) => f(a)

export function throwError(err: unknown): never {
  throw err
}

export const first = <A, B>(a: A, _b: B) => a
export const second = <A, B>(_a: A, b: B) => b

export const add = fcurry2((a: number, b: number) => a + b)
