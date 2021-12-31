import {
  Var as Variable,
  create,
  override,
  empty,
  thunk,
  of,
  lazy,
  resource,
  map,
  chain,
  isVar,
  getReference
} from './core'
import { array, all, concurrent, sequence } from './array'
import { struct } from './struct'
import { tuple, chainArgs, mapArgs } from './tuples'
import { call, callArgs } from './call'
import { abstract, defaultVar, isAbstract } from './abstract'
import { Dict } from '@apoyo/std'

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
