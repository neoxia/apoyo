import { Dict } from './Dict'

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

export const Obj = {
  merge
}
