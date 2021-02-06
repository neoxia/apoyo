import { Dict } from './Dict'
import { Predicate, Refinement } from './function'

export type Seq<A> = Iterable<A>

export function map<A, B>(fn: (value: A) => B) {
  return function* (seq: Seq<A>): Seq<B> {
    for (const value of seq) {
      yield fn(value)
    }
  }
}

export function filter<A, B extends A>(fn: Refinement<A, B>): (arr: Seq<A>) => Seq<B>
export function filter<A>(fn: Predicate<A>): (arr: Seq<A>) => Seq<A>
export function filter(fn: any) {
  return function* (seq: Seq<any>): Seq<any> {
    for (const value of seq) {
      if (fn(value)) {
        yield value
      }
    }
  }
}

export function uniq<A>(fn: (value: A) => string | number) {
  return function* (seq: Seq<A>): Seq<A> {
    const res: Dict<A> = {}
    for (const value of seq) {
      const key = fn(value)
      if (!res[key]) {
        res[key] = value
        yield value
      }
    }
  }
}

export function slice(start?: number, end?: number) {
  return function* <A>(seq: Seq<A>): Seq<A> {
    let i = 0
    for (const value of seq) {
      if (end && i >= end) {
        return
      }
      if (!start || i >= start) {
        yield value
      }
      ++i
    }
  }
}

export const take = (nb: number) => slice(0, nb)
export const skip = (nb: number) => slice(nb)

export function head<A>(seq: Seq<A>) {
  for (const value of seq) {
    return value
  }
  return undefined
}

export function last<A>(seq: Seq<A>) {
  let v: A | undefined = undefined
  for (const value of seq) {
    v = value
  }
  return v
}

export const toArray = <A>(seq: Seq<A>) => Array.from(seq)

export function* range(from: number, to: number, step: number = 1) {
  for (let i = from; i < to; i = i + step) {
    yield i
  }
}

export const Seq = {
  map,
  uniq,
  filter,
  range,
  slice,
  take,
  skip,
  head,
  last,
  toArray
}
