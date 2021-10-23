import { NonEmptyArray, Ord } from '@apoyo/std'
import { Ref } from './Ref'

import { Scope } from './Scope'
import { Var } from './Var'

export const SCOPES_INTERNAL = new WeakMap<Scope, ScopeInternal>()

export interface Context {
  scope: Scope
  variable: Var
}

export interface UnmountContext {
  unmount: Var.Unmount
  variable: Var
}

export interface BindingContext<T = any> {
  from: Var
  to: T
  scope: Scope
}

export type ScopeInternal = {
  readonly parent?: Context
  readonly bindings: Map<Var, BindingContext>
  hierarchy: NonEmptyArray<Scope>
  root: Scope
  ord: Ord<Scope>
  created: WeakMap<Ref, PromiseLike<Var.Created>>
  mounted: WeakMap<Ref, PromiseLike<any>>
  unmount: UnmountContext[]
}
