import { Arr, NonEmptyArray, Option, Ord, pipe } from '@apoyo/std'

import { Scope } from './Scope'
import { Context } from './types'
import { Var } from './Var'

export const resolveVariable = (variable: Var, bindings: Map<Var, Var>): Var => {
  const bound = bindings.get(variable)
  if (bound) {
    return resolveVariable(bound, bindings)
  }
  return variable
}

export const searchChildOf = (scope: Scope, parent: Scope): Context | undefined => {
  let tmp = scope
  while (tmp.parent && tmp.parent.scope !== parent) {
    tmp = tmp.parent.scope
  }
  return tmp.parent
}

export const getHierarchy = (scope: Scope) => {
  const hierarchy: NonEmptyArray<Scope> = [scope]
  let tmp = scope.parent
  while (tmp) {
    hierarchy.push(tmp.scope)
    tmp = tmp.scope.parent
  }
  return hierarchy
}

export const getRoot = (scope: Scope) => {
  let tmp = scope
  while (tmp.parent) {
    tmp = tmp.parent.scope
  }
  return tmp
}

export const getLowestScope = (scope: Scope, scopes: Scope[]) => {
  const hierarchy = getHierarchy(scope)
  const hierarchyPrio = new Map(hierarchy.map((h, idx) => [h, idx]))
  const ordScope = pipe(
    Ord.number,
    Ord.optional,
    Ord.contramap((scope: Scope) => hierarchyPrio.get(scope))
  )
  return pipe(
    scopes,
    Arr.min(ordScope),
    Option.get(() => getRoot(scope))
  )
}
