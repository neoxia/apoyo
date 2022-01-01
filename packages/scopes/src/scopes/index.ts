import { bind } from './bindings'
import { Scope as ScopeTmp, ScopeFactory, ScopeOptions, ScopeHierarchy } from './types'
import { create, run } from './factory'
import { Factory } from './variables'
import { Binding as BindingTmp } from './bindings'
import { getHierarchy, getLowestScope } from './hierarchy'

export type Scope = ScopeTmp

export namespace Scope {
  export type Factory = ScopeFactory
  export type Options = ScopeOptions
  export type Binding<A = any, B extends A = any> = BindingTmp<A, B>
  export type Hierarchy = ScopeHierarchy
}

export const Scope = {
  bind,
  create,
  run,
  getHierarchy,
  getLowestScope,
  Factory
}
