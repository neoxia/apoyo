import { reduce } from './Array'
import { Dict } from './Dict'
import { pipe } from './pipe'
import { of, split } from './String'

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

// TODO: handle array elements?
export const property = (path: string) => (obj: Dict<any>) =>
  pipe(
    path,
    split('.'),
    reduce((obj, prop) => (obj ? obj[prop] : ''), obj),
    of
  )

export const Obj = {
  merge
}
