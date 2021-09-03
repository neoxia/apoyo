import { isSome, Option } from './Option'
import { fcurry2 } from './function'

/**
 * @description
 * A constant enum for possible `Ord` results
 *
 * @example
 * ```ts
 * expect(Ord.number(1, 0)).toBe(Ordering.UP)
 * expect(Ord.number(0, 1)).toBe(Ordering.DOWN)
 * expect(Ord.number(0, 0)).toBe(Ordering.EQ)
 * ```
 */
export const enum Ordering {
  UP = 1,
  DOWN = -1,
  EQ = 0
}

export type Ord<A> = {
  name: string
  (a: A, b: A): Ordering
}

export const string: Ord<string> = (a: string, b: string) => (a > b ? 1 : a === b ? 0 : -1)

export const number: Ord<number> = (a: number, b: number) => (a > b ? 1 : a === b ? 0 : -1)

export const boolean: Ord<boolean> = (a: boolean, b: boolean) => (a > b ? 1 : a === b ? 0 : -1)

export const date: Ord<Date> = (a: Date, b: Date) => number(a.valueOf(), b.valueOf())

export const contramap = <A, B>(fn: (value: A) => B) => (ord: Ord<B>): Ord<A> => (a, b) => ord(fn(a), fn(b))

export const inverse = <A>(ord: Ord<A>): Ord<A> => (a, b) => ord(b, a)

export const optional = <A>(ord: Ord<A>): Ord<Option<A>> => (a, b) =>
  a === b ? 0 : isSome(a) ? (isSome(b) ? ord(a, b) : -1) : 1

export const nullable = <A>(ord: Ord<A>): Ord<A | null> => (a, b) =>
  a === b ? 0 : a !== null ? (b !== null ? ord(a, b) : -1) : 1

export function concat<A>(...ords: [Ord<A>]): Ord<A>
export function concat<A, B>(...ords: [Ord<A>, Ord<B>]): Ord<A & B>
export function concat<A, B, C>(...ords: [Ord<A>, Ord<B>, Ord<C>]): Ord<A & B & C>
export function concat<A, B, C, D>(...ords: [Ord<A>, Ord<B>, Ord<C>, Ord<D>]): Ord<A & B & C & D>
export function concat<A, B, C, D, E>(...ords: [Ord<A>, Ord<B>, Ord<C>, Ord<D>, Ord<E>]): Ord<A & B & C & D & E>
export function concat<A, B, C, D, E, F>(
  ...ords: [Ord<A>, Ord<B>, Ord<C>, Ord<D>, Ord<E>, Ord<F>]
): Ord<A & B & C & D & E & F>
export function concat(...ords: [Ord<any>, ...Ord<any>[]]): Ord<any> {
  return (a, b) => {
    for (let i = 0; i < ords.length; ++i) {
      const ord = ords[i]
      const result = ord(a, b)
      if (result !== 0) {
        return result
      }
    }
    return 0
  }
}

export const eq = <A>(ord: Ord<A>) =>
  fcurry2((x: A, y: A) => ord(x, y) === Ordering.EQ) as {
    (x: A, y: A): boolean
    (y: A): (x: A) => boolean
  }
export const lt = <A>(ord: Ord<A>) =>
  fcurry2((x: A, y: A) => ord(x, y) < Ordering.EQ) as {
    (x: A, y: A): boolean
    (y: A): (x: A) => boolean
  }
export const lte = <A>(ord: Ord<A>) =>
  fcurry2((x: A, y: A) => ord(x, y) <= Ordering.EQ) as {
    (x: A, y: A): boolean
    (y: A): (x: A) => boolean
  }
export const gt = <A>(ord: Ord<A>) =>
  fcurry2((x: A, y: A) => ord(x, y) > Ordering.EQ) as {
    (x: A, y: A): boolean
    (y: A): (x: A) => boolean
  }
export const gte = <A>(ord: Ord<A>) =>
  fcurry2((x: A, y: A) => ord(x, y) >= Ordering.EQ) as {
    (x: A, y: A): boolean
    (y: A): (x: A) => boolean
  }

export const min = <A>(ord: Ord<A>) =>
  fcurry2((x: A, y: A) => (ord(x, y) <= Ordering.EQ ? x : y)) as {
    (x: A, y: A): A
    (y: A): (x: A) => A
  }
export const max = <A>(ord: Ord<A>) =>
  min(inverse(ord)) as {
    (x: A, y: A): A
    (y: A): (x: A) => A
  }

/**
 * @namespace Ord
 *
 * @description
 * This namespace contains utilities to create simple or more complex ordering / sorting functions.
 *
 * These `Ord` functions can be used for a multitude of use-cases:
 *
 * @see `Arr.sort` - To sort an array
 * @see `Arr.min` - To return the smallest value in an array
 * @see `Arr.max` - To return the biggest value in an array
 *
 */
export const Ord = {
  /**
   * @description
   * Order strings
   */
  string,

  /**
   * @description
   * Order numbers
   */
  number,

  /**
   * @description
   * Order booleans.
   *
   * The value `false` comes first.
   */
  boolean,

  /**
   * @description
   * Order date object.
   *
   * This function does not check if the date is valid
   */
  date,

  /**
   * @description
   * Create an order function for a custom type or object
   *
   * @example
   * ```ts
   * const ordTodo = pipe(
   *   Ord.string,
   *   Ord.contramap((todo: Todo) => todo.title)
   * )
   * ```
   */
  contramap,

  /**
   * @description
   * Inverse the order function
   *
   * @example
   * ```ts
   * const numberDesc = pipe(
   *   Ord.number,
   *   Ord.inverse
   * )
   *
   * const nbs = pipe(
   *   [1,3,2,4],
   *   Arr.sort(numberDesc)
   * )
   *
   * expect(nbs).toEqual([4,3,2,1])
   * ```
   */
  inverse,

  /**
   * @description
   * Allow the ordering function to take optional (undefined) values.
   *
   * Undefined values are placed last.
   *
   * @see `Ord.nullable` for nullable values
   *
   * @example
   * ```ts
   * const optionalNb = pipe(
   *   Ord.number,
   *   Ord.optional
   * )
   *
   * const nbs = pipe(
   *   [1,3,undefined,2],
   *   Arr.sort(optionalNb)
   * )
   *
   * expect(nbs).toEqual([1,2,3,undefined])
   * ```
   */
  optional,

  /**
   * @description
   * Allow the ordering function to take nullable values.
   *
   * Nullable values are placed last.
   *
   * @see `Ord.optional` for optional (undefined) values
   *
   * @example
   * ```ts
   * const optionalNb = pipe(
   *   Ord.number,
   *   Ord.nullable
   * )
   *
   * const nbs = pipe(
   *   [1,3,null,2],
   *   Arr.sort(optionalNb)
   * )
   *
   * expect(nbs).toEqual([1,2,3,null])
   * ```
   */
  nullable,

  /**
   * @description
   * Combine multiple `Ord`s.
   *
   * The first `Ord` is executed first.
   * If the elements are equal, the second `Ord` is executed, and so forth...
   *
   * @example
   * ```ts
   * const ordDone = pipe(
   *   Ord.boolean,
   *   Ord.contramap((todo: Todo) => todo.done)
   * )
   * const ordName = pipe(
   *   Ord.string,
   *   Ord.contramap((todo: Todo) => todo.name)
   * )
   *
   * // Order first by "done", then by "name"
   * const ordTodo = Ord.concat(ordDone, ordName)
   *
   * const todos = pipe(
   *   todos,
   *   Arr.sort(ordTodo)
   * )
   * ```
   */
  concat,

  /**
   * @description
   * Create "equals" comparator from `Ord`
   *
   * @example
   * ```ts
   * const eqName = pipe(
   *   Ord.string,
   *   Ord.contramap((todo: Todo) => todo.name),
   *   Ord.eq
   * )
   *
   * // Find todo with the name "Buy bread"
   * const todo = todos.find(eqName("Buy bread"))
   * ```
   */
  eq,

  /**
   * @description
   * Create "lower than" comparator from `Ord`
   *
   * @see `Ord.lte` for "lower than equals"
   * @see `Ord.gt` for "greater than"
   * @see `Ord.gte` for "greater than equals"
   *
   * @example
   * ```ts
   * const ltNumber = pipe(
   *   Ord.number,
   *   Ord.lt
   * )
   *
   * // Only retain numbers under 4
   * const nbs = [1,3,6,2,4].filter(ltNumber(4))
   *
   * expect(nbs).toEqual([1,3,2])
   * ```
   */
  lt,

  /**
   * @description
   * Create "lower than equals" comparator from `Ord`
   *
   * @see `Ord.lt` for "lower than"
   * @see `Ord.gt` for "greater than"
   * @see `Ord.gte` for "greater than equals"
   *
   * @example
   * ```ts
   * const lteNumber = pipe(
   *   Ord.number,
   *   Ord.lte
   * )
   *
   * // Only retain numbers under or equals to 4
   * const nbs = [1,3,6,2,4].filter(lteNumber(4))
   *
   * expect(nbs).toEqual([1,3,2,4])
   * ```
   */
  lte,

  /**
   * @description
   * Create "greater than" comparator from `Ord`
   *
   * @see `Ord.lt` for "lower than"
   * @see `Ord.lte` for "lower than equals"
   * @see `Ord.gte` for "greater than equals"
   *
   * @example
   * ```ts
   * const gtNumber = pipe(
   *   Ord.number,
   *   Ord.gt
   * )
   *
   * // Only retain numbers greater than 4
   * const nbs = [1,3,6,2,4].filter(gtNumber(4))
   *
   * expect(nbs).toEqual([6])
   * ```
   */
  gt,

  /**
   * @description
   * Create "greater than equals" comparator from `Ord`
   *
   * @see `Ord.lt` for "lower than"
   * @see `Ord.lte` for "lower than equals"
   * @see `Ord.gt` for "greater than"
   *
   * @example
   * ```ts
   * const gteNumber = pipe(
   *   Ord.number,
   *   Ord.gte
   * )
   *
   * // Only retain numbers greater or equals to 4
   * const nbs = [1,3,6,2,4].filter(gteNumber(4))
   *
   * expect(nbs).toEqual([6,4])
   * ```
   */
  gte,

  /**
   * @description
   * Create a function which returns the smallest element from an `Ord`
   *
   * @see `Ord.max`
   *
   * @example
   * ```ts
   * const minDate = pipe(
   *   Ord.date,
   *   Ord.min
   * )
   *
   * const date = minDate(new Date('2020'), new Date('2021'))
   *
   * expect(date).toBe(new Date('2020'))
   * ```
   */
  min,

  /**
   * @description
   * Create a function which returns the greatest element from an `Ord`
   *
   * @see `Ord.min`
   *
   * @example
   * ```ts
   * const maxDate = pipe(
   *   Ord.date,
   *   Ord.max
   * )
   *
   * const date = maxDate(new Date('2020'), new Date('2021'))
   *
   * expect(date).toBe(new Date('2021'))
   * ```
   */
  max
}
