import type { Scope } from './scopes'
import type { Injectable } from './injectables'

export interface Context {
  scope: Scope
  variable: Injectable
}
