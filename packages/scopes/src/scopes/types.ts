import type { NonEmptyArray, Ord } from '@apoyo/std'

import type { Context } from '../types'
import type { Injectable } from '../injectables'
import type { Resource } from '../resources'
import type { Ref } from '../refs'
import type { SCOPE_HIERARCHY, SCOPE_INTERNAL, SCOPE_SYMBOL } from './symbols'

export type Scope = {
  [SCOPE_SYMBOL]: boolean
  [SCOPE_INTERNAL]: Scope.Internal
  [SCOPE_HIERARCHY]?: Scope.Hierarchy

  readonly parent?: Context
  readonly root: Scope

  load<T>(variable: Injectable<T>): Promise<Injectable.Loader<T>>
  get<T>(variable: Injectable<T>): Promise<T>
  factory(): Scope.Factory
  close(): Promise<void>
}

export namespace Scope {
  export interface Options {
    parent?: Context
    bindings?: Binding<any, any>[]
  }

  export interface Factory {
    create(options?: Scope.Options): Scope
    run<T>(variable: Injectable<T>, options?: Scope.Options): Promise<T>
  }

  export interface Hierarchy {
    readonly scopes: NonEmptyArray<Scope>
    readonly ord: Ord<Scope>
  }

  export interface Internal {
    bindings: Map<Ref, Bound>
    created: WeakMap<Ref, PromiseLike<Injectable.Loader>>
    mounted: WeakMap<Ref, PromiseLike<any>>
    unmount: Scope.UnmountContext[]
    open: boolean
  }

  export interface UnmountContext {
    unmount: Resource.Unmount
    variable: Injectable
  }

  export interface Binding<A = any, B extends A = any> {
    from: Injectable<A>
    to: Injectable<B>
  }

  export interface Bound<T = any> {
    from: Injectable<T>
    to: T | Injectable<T>
    scope: Scope
  }
}
