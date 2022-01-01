import type { Dict } from '@apoyo/std'

import { Var as Variable, create, override, lazy, resource, isVar, getReference } from './core'
import { empty, thunk, of } from './constants'
import { array, all, concurrent, sequence, tuple } from './array'
import { struct } from './struct'
import { map, mapArgs } from './map'
import { chain, chainArgs } from './chain'
import { call, callArgs } from './call'
import { abstract, defaultVar, isAbstract } from './abstract'

export type Var<A = any> = Variable<A>

export namespace Var {
  export type Loader<T = any> = Variable.Loader<T>
  export type Factory<T, Fun> = Variable.Factory<T, Fun>
  export type Struct<T extends Dict<Var>> = Variable.Struct<T>
  export type Abstract<T = any> = Variable.Abstract<T>
}

export const Var = {
  getReference,
  isVar,
  isAbstract,
  empty,
  create,
  override,
  thunk,
  of,
  lazy,
  array,
  all,
  sequence,
  concurrent,
  struct,
  tuple,
  resource,
  map,
  mapArgs,
  chain,
  chainArgs,
  call,
  callArgs,
  abstract,
  default: defaultVar
}
