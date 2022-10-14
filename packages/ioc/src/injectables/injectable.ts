import type { Container } from '../container'
import type { Ref } from '../refs'
import { Tuple } from '../types'
import { array, tuple } from './array'
import { create, is, of } from './create'
import { lazy } from './lazy'

export interface Injectable<T = unknown> {
  readonly initialize: (container: Container) => Promise<T>
  readonly ref: Ref
}

export namespace Injectable {
  export type ArrayOf<Deps extends Tuple> = Deps extends []
    ? []
    : {
        [Index in keyof Deps]: Injectable<Deps[Index]>
      } & { length: Deps['length'] }
}

export const Injectable = {
  create,
  of,
  is,
  array,
  tuple,
  lazy
}
