import type { Dict } from '@apoyo/std'
import type { Ref } from '../refs'
import type { Resource } from '../resources'
import type { Scope } from '../scopes'
import type { Context } from '../types'

import { INJECTABLE_ABSTRACT, INJECTABLE_REF, INJECTABLE_CREATE, INJECTABLE_FACTORY } from './symbols'

export type Injectable<T = any> = Injectable.Value<T> & Injectable.Proxy<T>

export namespace Injectable {
  export interface Value<T> {
    [INJECTABLE_REF]: Ref
    [INJECTABLE_CREATE]: (ctx: Context) => PromiseLike<Injectable.Loader<T>>
  }

  type IsAny<T> = unknown extends T ? ([keyof T] extends [never] ? false : true) : false

  export type Proxy<T> = IsAny<T> extends true
    ? {}
    : T extends any[]
    ? {}
    : T extends object
    ? { [P in keyof T]: Injectable<T[P]> }
    : {}

  export type Abstract<T> = Injectable<T> & {
    [INJECTABLE_ABSTRACT]: boolean
  }

  export type Factory<T, Fun> = Injectable<T> & {
    [INJECTABLE_FACTORY]: Fun
  }

  export interface Loader<T = any> {
    scope: Scope
    mount: () => PromiseLike<Resource<T>>
  }
  export type Struct<A extends Dict<Injectable>> = Injectable<
    {
      [P in keyof A]: A[P] extends Injectable<infer I> ? I : never
    }
  >
}
