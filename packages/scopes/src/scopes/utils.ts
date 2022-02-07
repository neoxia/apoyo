import { Arr, pipe } from '@apoyo/std'

import type { Scope } from './types'
import type { Context } from '../types'
import type { Ref } from '../refs'

import { SCOPE_INTERNAL } from './symbols'
import { Injectable } from '../injectables'

export const mergeBindings = (scope: Scope, parent: Context | undefined, bindings: Scope.Binding[]) => {
  const localBindings = pipe(
    bindings || [],
    Arr.map(({ from, to }): [Ref, Scope.Bound] => [
      Injectable.getReference(from),
      {
        from,
        to,
        scope
      }
    ])
  )
  return parent
    ? new Map([...parent.scope[SCOPE_INTERNAL].bindings.entries(), ...localBindings])
    : new Map(localBindings)
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
