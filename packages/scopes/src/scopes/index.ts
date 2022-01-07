import { bind } from './bindings'
import { Scope as ScopeTmp } from './types'
import { create, run } from './factory'
import { Factory } from './variables'
import { getHierarchy, getLowestScope } from './hierarchy'

export type Scope = ScopeTmp

export namespace Scope {
  export type Factory = ScopeTmp.Factory
  export type Options = ScopeTmp.Options
  export type Binding<A = any, B extends A = any> = ScopeTmp.Binding<A, B>
  export type Hierarchy = ScopeTmp.Hierarchy
}

export const Scope = {
  bind,
  create,
  run,
  getHierarchy,
  getLowestScope,
  Factory
}
