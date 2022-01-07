import { Ord, Option, NonEmptyArray, pipe, Arr } from '@apoyo/std'

import type { Scope } from './types'
import { SCOPE_HIERARCHY } from './symbols'

const computeHierarchy = (scope: Scope) => {
  const hierarchy: NonEmptyArray<Scope> = [scope]
  let tmp = scope.parent
  while (tmp) {
    hierarchy.push(tmp.scope)
    tmp = tmp.scope.parent
  }
  return hierarchy
}

export const createHierarchy = (scope: Scope): Scope.Hierarchy => {
  const scopes = computeHierarchy(scope)
  const scopesPrio = new Map(scopes.map((h, idx) => [h, idx]))
  const ord = pipe(
    Ord.number,
    Ord.optional,
    Ord.contramap((scope: Scope) => scopesPrio.get(scope))
  )

  return {
    scopes,
    ord
  }
}

export const getHierarchy = (scope: Scope): Scope.Hierarchy => {
  if (!scope[SCOPE_HIERARCHY]) {
    scope[SCOPE_HIERARCHY] = createHierarchy(scope)
  }
  return scope[SCOPE_HIERARCHY]!
}

export const getLowestScope = (scope: Scope, scopes: Scope[]) => {
  return pipe(scopes, Arr.min(getHierarchy(scope).ord), Option.get(scope.root))
}
