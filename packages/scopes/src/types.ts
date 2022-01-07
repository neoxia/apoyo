import type { Scope } from './scopes'
import type { Var } from './variables'

export interface Context {
  scope: Scope
  variable: Var
}
