import { NonEmptyArray, Option, pipe } from '@apoyo/std'

import { Scope } from './Scope'
import { Context, SCOPES_INTERNAL } from './types'

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

export const getInternalScope = (scope: Scope) =>
  pipe(
    SCOPES_INTERNAL.get(scope),
    Option.throwError(() => new Error('could not find internal scope data'))
  )
