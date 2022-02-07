import type { Dict } from '@apoyo/std'

import { Injectable as InjectableTmp } from './types'
import { create, override, isVar, getReference, getFactory, getLoader } from './core'
import { lazy } from './lazy'
import { resource } from './resource'
import { empty, thunk, of } from './constants'
import { array, all, concurrent, sequence, tuple } from './array'
import { struct } from './struct'
import { map, mapArgs } from './map'
import { chain, chainArgs } from './chain'
import { call, callArgs } from './call'
import { abstract, defaultVar, isAbstract } from './abstract'

export type Injectable<A = any> = InjectableTmp<A>

export namespace Injectable {
  export type Loader<T = any> = InjectableTmp.Loader<T>
  export type Factory<T, Fun> = InjectableTmp.Factory<T, Fun>
  export type Struct<T extends Dict<Injectable>> = InjectableTmp.Struct<T>
  export type Abstract<T = any> = InjectableTmp.Abstract<T>
  export type Proxy<T = any> = InjectableTmp.Proxy<T>
}

export const Injectable = {
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
