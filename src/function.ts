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

export function identity<A>(a: A): A {
  return a
}

export const unsafeCoerce = <A>(a: unknown) => a as A

export function not<A>(predicate: Predicate<A>): Predicate<A> {
  return (a) => !predicate(a)
}

export function constant<A>(a: A): Lazy<A> {
  return () => a
}

export const constTrue: Lazy<boolean> =
  /*#__PURE__*/
  constant(true)

export const constFalse: Lazy<boolean> =
  /*#__PURE__*/
  constant(false)

export const constNull: Lazy<null> =
  /*#__PURE__*/
  constant(null)

export const constUndefined: Lazy<undefined> =
  /*#__PURE__*/
  constant(undefined)

export const constVoid: Lazy<void> = constUndefined

/**
 * @since 2.0.0
 */
export function tuple<T extends ReadonlyArray<any>>(...t: T): T {
  return t
}

/**
 * Creates a tupled version of this function: instead of `n` arguments, it accepts a single tuple argument.
 *
 * @example
 * import { tupled } from 'fp-ts/function'
 *
 * const add = tupled((x: number, y: number): number => x + y)
 *
 * assert.strictEqual(add([1, 2]), 3)
 *
 * @since 2.4.0
 */
export function tupled<A extends ReadonlyArray<unknown>, B>(f: (...a: A) => B): (a: A) => B {
  return (a) => f(...a)
}

/**
 * Inverse function of `tupled`
 *
 * @since 2.4.0
 */
export function untupled<A extends ReadonlyArray<unknown>, B>(f: (a: A) => B): (...a: A) => B {
  return (...a) => f(a)
}

export function throwError(err: unknown): never {
  throw err
}

export const first = <A, B>(a: A, _b: B) => a
export const second = <A, B>(_a: A, b: B) => b

export const add = (a: number, b: number) => {
  return a + b
}
export const incrementBy = (a: number) => (b: number) => {
  return a + b
}
