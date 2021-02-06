import { map } from './Array'
import { Dict, toPairs } from './Dict'
import { pipe } from './function'

export interface IKey<A> {
  name: string
  (value: A): string
}
export type Key<A> = IKey<A>

export type KeyStruct<A extends Dict> = {
  [P in keyof A]?: Key<A[P]>
}

export const string: Key<string> = (value: string) => value
export const number: Key<number> = (value: number) => String(value)
export const boolean: Key<boolean> = (value: boolean) => String(value)
export const date: Key<Date> = (value: Date) => number(value.valueOf())

export const contramap = <A, B>(fn: (value: B) => A) => (id: Key<A>): Key<B> => (value: B) => id(fn(value))

export const struct = <A extends Dict>(struct: KeyStruct<A>): Key<A> => {
  const pairs = toPairs(struct as Dict<Key<any>>)

  return (value: A) => {
    return pipe(
      pairs,
      map(([key, fn]) => `${key}=${fn(value[key])}`),
      (arr) => `{${arr.join(',')}}`
    )
  }
}

export const Key = {
  string,
  number,
  boolean,
  date,
  contramap,
  struct
}
