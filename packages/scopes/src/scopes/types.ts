import type { NonEmptyArray, Ord } from '@apoyo/std'

import type { Context } from '../types'
import type { Var } from '../variables'
import type { Resource } from '../resources'
import type { Ref } from '../refs'
import type { SCOPE_HIERARCHY, SCOPE_INTERNAL, SCOPE_SYMBOL } from './symbols'
import type { Binding, Bound } from './bindings'

export interface ScopeOptions {
  anchor?: Context
  bindings?: Binding<any, any>[]
}

export interface ScopeFactory {
  create(options?: ScopeOptions): Scope
  run<T>(variable: Var<T>, options?: ScopeOptions): Promise<T>
}

export type ScopeHierarchy = {
  scopes: NonEmptyArray<Scope>
  ord: Ord<Scope>
}

export type Scope = {
  [SCOPE_SYMBOL]: boolean
  [SCOPE_INTERNAL]: ScopeInternal
  [SCOPE_HIERARCHY]?: ScopeHierarchy

  readonly parent?: Context
  readonly root: Scope

  load<T>(variable: Var<T>): Promise<Var.Loader<T>>
  get<T>(variable: Var<T>): Promise<T>
  factory(): ScopeFactory
  close(): Promise<void>
}

export interface UnmountContext {
  unmount: Resource.Unmount
  variable: Var
}

export interface ScopeInternal {
  bindings: Map<Var, Bound>
  created: WeakMap<Ref, PromiseLike<Var.Loader>>
  mounted: WeakMap<Ref, PromiseLike<any>>
  unmount: UnmountContext[]
  open: boolean
}
