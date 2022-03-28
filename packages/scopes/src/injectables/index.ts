import type { Dict } from '@apoyo/std'

import { Injectable as InjectableTmp } from './types'
import { create, override, isInjectable, getReference, getFactory, getLoader } from './core'
import { lazy } from './lazy'
import { empty, of } from './constants'
import { all, sequence, tuple } from './array'
import { struct } from './struct'
import { abstract, isAbstract } from './abstract'
import { define } from './define'

export type Injectable<A = any> = InjectableTmp<A>

export namespace Injectable {
  export type Loader<T = any> = InjectableTmp.Loader<T>
  export type Factory<T, Fun> = InjectableTmp.Factory<T, Fun>
  export type Struct<T extends Dict<Injectable>> = InjectableTmp.Struct<T>
  export type Abstract<T = any> = InjectableTmp.Abstract<T>
}

export const Injectable = {
  define,
  getReference,
  getFactory,
  getLoader,
  isInjectable,
  isAbstract,
  empty,
  create,
  override,
  of,
  lazy,
  all,
  sequence,
  struct,
  tuple,
  abstract
}
