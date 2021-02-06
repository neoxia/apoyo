import { identity, pipe } from './function'
import { Option } from './Option'

export type Dict<A = unknown> = Record<string, A>

export const isDict = (input: unknown): input is Dict<unknown> => typeof input === 'object' && input !== null

export const lookup = (key: string | number) => <A>(dict: Dict<A>): Option<A> => dict[key]

export const mapIndexed = <A, B>(fn: (value: A, key: string) => B) => (dict: Dict<A>): Dict<B> => {
  const result: Dict<B> = {}
  const props = Object.keys(dict)
  const len = props.length
  for (let i = 0; i < len; ++i) {
    const key = props[i]
    const value = dict[key]
    result[key] = fn(value, key)
  }
  return result
}

export const map = <A, B>(fn: (value: A) => B) => (dict: Dict<A>): Dict<B> =>
  pipe(
    dict,
    mapIndexed((v) => fn(v))
  )

export const collect = <A, B>(fn: (value: A, key: string) => B) => (dict: Dict<A>): B[] => {
  const props = Object.keys(dict)
  const len = props.length
  const arr: B[] = new Array(len)
  for (let i = 0; i < len; ++i) {
    const key = props[i]
    const value = dict[key]
    arr[i] = fn(value, key)
  }
  return arr
}

export const values = <A>(dict: Dict<A>): Array<A> => pipe(dict, collect(identity))

export const keys = <A>(dict: Dict<A>): Array<string> => Object.keys(dict)

export const fromPairs = <A>(pairs: [string, A][]): Dict<A> => {
  const dict: Dict<A> = {}
  for (let i = 0; i < pairs.length; ++i) {
    const [key, value] = pairs[i]
    dict[key] = value
  }
  return dict
}

export const toPairs = <A>(dict: Dict<A>) =>
  pipe(
    dict,
    collect<A, [string, A]>((value, key) => [key, value])
  )

export const Dict = {
  map,
  mapIndexed,
  collect,
  isDict,
  lookup,
  keys,
  values,
  fromPairs,
  toPairs
}
