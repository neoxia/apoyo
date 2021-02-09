import { Dict } from './Dict'

export function merge<A extends object, B extends object>(...members: [A, B]): A & B
export function merge<A extends object, B extends object, C extends object>(...members: [A, B, C]): A & B & C
export function merge<A extends object, B extends object, C extends object, D extends object>(
  ...members: [A, B, C, D]
): A & B & C & D
export function merge<A>(...members: Dict<A>[]): Dict<A>
export function merge(...members: object[]): object {
  return Object.assign({}, ...members)
}

export type Obj = object
export const Obj = {
  merge
}
