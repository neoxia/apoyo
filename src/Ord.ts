import { isSome, Option } from './Option'

export const enum Ordering {
  UP = 1,
  DOWN = -1,
  EQ = 0
}

export interface IOrd<A> {
  name: string
  (a: A, b: A): Ordering
}

export type Ord<A> = IOrd<A>

export const string: Ord<string> = (a: string, b: string) => (a > b ? 1 : a === b ? 0 : -1)

export const number: Ord<number> = (a: number, b: number) => (a > b ? 1 : a === b ? 0 : -1)

export const boolean: Ord<boolean> = (a: boolean, b: boolean) => (a > b ? 1 : a === b ? 0 : -1)

export const date: Ord<Date> = (a: Date, b: Date) => number(a.valueOf(), b.valueOf())

export const contramap = <A, B>(fn: (value: A) => B) => (ord: Ord<B>): Ord<A> => (a, b) => ord(fn(a), fn(b))

export const inverse = <A>(ord: Ord<A>): Ord<A> => (a, b) => ord(b, a)

export const option = <A>(ord: Ord<A>): Ord<Option<A>> => (a, b) =>
  a === b ? 0 : isSome(a) ? (isSome(b) ? ord(a, b) : -1) : 1

export const nullable = <A>(ord: Ord<A>): Ord<A | null> => (a, b) =>
  a === b ? 0 : a !== null ? (b !== null ? ord(a, b) : -1) : 1

export const concat = <A>(...ords: [Ord<A>, Ord<A>, ...Ord<A>[]]): Ord<A> => (a, b) => {
  for (let i = 0; i < ords.length; ++i) {
    const ord = ords[i]
    const result = ord(a, b)
    if (result !== 0) {
      return result
    }
  }
  return 0
}

export const Ord = {
  string,
  number,
  boolean,
  date,
  contramap,
  inverse,
  option,
  nullable,
  concat
}
