import { reduce } from './Array'
import { Dict } from './Dict'
import { pipe } from './pipe'
import { split } from './String'

export type Obj = Dict

export function merge<A extends Obj, B extends Obj>(...members: [A, B]): A & B
export function merge<A extends Obj, B extends Obj, C extends Obj>(...members: [A, B, C]): A & B & C
export function merge<A extends Obj, B extends Obj, C extends Obj, D extends Obj>(
  ...members: [A, B, C, D]
): A & B & C & D
export function merge<A>(...members: Dict<A>[]): Dict<A>
export function merge(...members: Obj[]): Obj {
  return Object.assign({}, ...members)
}

export const property = (path: string) => (obj: Dict<any>) =>
  pipe(
    path,
    split('.'),
    reduce((obj, prop) => (obj ? obj[prop] : undefined), obj)
  )

export const Obj = {
  merge,
  property
}
