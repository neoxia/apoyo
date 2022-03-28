import type { Dict } from '@apoyo/std'
import type { Ref } from '../refs'
import type { Resource } from '../resources'
import type { Scope } from '../scopes'
import type { Context } from '../types'

import { INJECTABLE_ABSTRACT, INJECTABLE_REF, INJECTABLE_CREATE, INJECTABLE_FACTORY } from './symbols'

export type Injectable<T = any> = {
  [INJECTABLE_REF]: Ref
  [INJECTABLE_CREATE]: (ctx: Context) => PromiseLike<Injectable.Loader<T>>
}

export namespace Injectable {
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
