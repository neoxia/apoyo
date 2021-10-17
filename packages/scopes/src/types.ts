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
  created: Map<symbol, PromiseLike<Var.Created>>
  mounted: Map<symbol, PromiseLike<any>>
  unmount: UnmountContext[]
}
