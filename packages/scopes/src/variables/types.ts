import type { Dict } from '@apoyo/std'
import type { Ref } from '../refs'
import type { Resource } from '../resources'
import type { Scope } from '../scopes'
import type { Context } from '../types'

import { VAR_ABSTRACT, VAR_REF, VAR_CREATE, VAR_FACTORY } from './symbols'

export type Var<T = any> = Var.Value<T> & Var.Proxy<T>

export namespace Var {
  export interface Value<T> {
    [VAR_REF]: Ref
    [VAR_CREATE]: (ctx: Context) => PromiseLike<Var.Loader<T>>
  }

  type IsAny<T> = unknown extends T ? ([keyof T] extends [never] ? false : true) : false

  export type Proxy<T> = IsAny<T> extends true
    ? {}
    : T extends any[]
    ? {}
    : T extends object
    ? { [P in keyof T]: Var<T[P]> }
    : {}

  export type Abstract<T> = Var<T> & {
    [VAR_ABSTRACT]: boolean
  }

  export type Factory<T, Fun> = Var<T> & {
    [VAR_FACTORY]: Fun
  }

  export interface Loader<T = any> {
    scope: Scope
    mount: () => PromiseLike<Resource<T>>
  }
  export type Struct<A extends Dict<Var>> = Var<
    {
      [P in keyof A]: A[P] extends Var<infer I> ? I : never
    }
  >
}
