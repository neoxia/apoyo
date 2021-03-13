import { reduce } from './Array'
import * as Dict from './Dict'
import { pipe } from './pipe'
import { split } from './String'

export type Obj = object

export const copy = <A extends Obj>(member: A): A => Object.assign({}, member)

export function merge<A extends Obj, B extends Obj>(...members: [A, B]): A & B
export function merge<A extends Obj, B extends Obj, C extends Obj>(...members: [A, B, C]): A & B & C
export function merge<A extends Obj, B extends Obj, C extends Obj, D extends Obj>(
  ...members: [A, B, C, D]
): A & B & C & D
export function merge<A>(...members: Dict.Dict<A>[]): Dict.Dict<A>
export function merge(...members: Obj[]): Obj {
  return Object.assign({}, ...members)
}

export const property = (path: string) => (obj: Dict.Dict<any>) =>
  pipe(
    path,
    split('.'),
    reduce((obj, prop) => (obj ? obj[prop] : undefined), obj)
  )

export function omit<A extends Obj, B extends keyof A>(props: B[]): (obj: A) => Omit<A, B>
export function omit(props: string[]) {
  const propsSet = new Set(props)
  return Dict.reject((_, key) => propsSet.has(key))
}

export function pick<A extends Obj, B extends keyof A>(props: B[]): (obj: A) => Pick<A, B>
export function pick(props: string[]) {
  const propsSet = new Set(props)
  return Dict.filter((_, key) => propsSet.has(key))
}

export const Obj = {
  copy,
  merge,
  property,
  omit,
  pick
}
