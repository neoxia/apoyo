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

export type ScopeInternal = {
  readonly parent?: Context
  readonly bindings: {
    scope: Map<Var, Var>
    all: Map<Var, Var>
  }
  created: Map<Var, Promise<Var.Created>>
  mounted: Map<Var, Promise<any>>
  unmount: UnmountContext[]
}
