import type { Dict } from '@apoyo/std'

import { Var as VarTmp } from './types'
import { create, override, lazy, resource, isVar, getReference, getFactory, getLoader } from './core'
import { empty, thunk, of } from './constants'
import { array, all, concurrent, sequence, tuple } from './array'
import { struct } from './struct'
import { map, mapArgs } from './map'
import { chain, chainArgs } from './chain'
import { call, callArgs } from './call'
import { abstract, defaultVar, isAbstract } from './abstract'

export type Var<A = any> = VarTmp<A>

export namespace Var {
  export type Loader<T = any> = VarTmp.Loader<T>
  export type Factory<T, Fun> = VarTmp.Factory<T, Fun>
  export type Struct<T extends Dict<Var>> = VarTmp.Struct<T>
  export type Abstract<T = any> = VarTmp.Abstract<T>
  export type Proxy<T = any> = VarTmp.Proxy<T>
}

export const Var = {
  getReference,
  getFactory,
  getLoader,
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
