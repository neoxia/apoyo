import type { Scope } from './types'
import type { Context } from '../types'

import { SCOPE_INTERNAL } from './symbols'
import { Injectable } from '../injectables'
import { override } from './bindings'

export const computeBindings = (scope: Scope, bindings: Scope.Binding[]) => {
  return new Map(
    bindings.map(({ from, to }) => [
      Injectable.getReference(from),
      override({
        from,
        to,
        scope
      })
    ])
  )
}

export const isOpen = (scope: Scope) => scope[SCOPE_INTERNAL].open

export const getRoot = (scope: Scope) => {
  let tmp = scope
  while (tmp.parent) {
    tmp = tmp.parent.scope
  }
  return tmp
}

export const getInternalScope = (scope: Scope) => scope[SCOPE_INTERNAL]

export const searchChildOf = (scope: Scope, parent: Scope): Context | undefined => {
  let tmp = scope
  while (tmp.parent && tmp.parent.scope !== parent) {
    tmp = tmp.parent.scope
  }
  return tmp.parent
}
