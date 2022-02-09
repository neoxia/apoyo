import { Arr, pipe, Task } from '@apoyo/std'

import { Context } from '../types'
import { Injectable } from '../injectables'
import { SCOPE_INTERNAL } from './symbols'
import { create, run } from './factory'
import { isOpen, searchChildOf } from './utils'
import type { Scope } from './types'
import type { Ref } from '../refs'

const resolveBinding = <T>(scope: Scope, ref: Ref) =>
  scope[SCOPE_INTERNAL].bindings.get(ref) as Injectable<T> | undefined

export const resolve = <T>(scope: Scope, from: Injectable<T>): Injectable<T> => {
  const ref = Injectable.getReference(from)

  let tmp = scope
  let to = resolveBinding<T>(tmp, ref)
  while (!to && tmp.parent) {
    tmp = tmp.parent.scope
    to = resolveBinding<T>(tmp, ref)
  }
  return to ? to : from
}

export const load = async <T>(scope: Scope, variable: Injectable<T>): Promise<Injectable.Loader<T>> => {
  if (!isOpen(scope)) {
    throw new Error('Scope has been closed and cannot be re-used')
  }

  const ref = Injectable.getReference(variable)
  const internal = scope[SCOPE_INTERNAL]
  if (!internal.created.has(ref)) {
    const resolved = resolve(scope, variable)
    const ctx: Context = {
      scope,
      variable: resolved
    }
    internal.created.set(ref, Injectable.getLoader(resolved)(ctx))
  }
  return await internal.created.get(ref)!
}

export const get = async <T>(scope: Scope, variable: Injectable<T>) => {
  if (!isOpen(scope)) {
    throw new Error('Scope has been closed and cannot be re-used')
  }

  const ref = Injectable.getReference(variable)
  const created = await load(scope, variable)
  const targetScope = created.scope[SCOPE_INTERNAL]
  if (!targetScope.mounted.has(ref)) {
    targetScope.mounted.set(
      ref,
      created.mount().then((data) => {
        const unmountFn = data.unmount
        if (unmountFn) {
          const ctx = searchChildOf(scope, created.scope)
          const unmountCtx: Scope.UnmountContext = {
            variable,
            unmount: unmountFn
          }
          const idx = ctx ? targetScope.unmount.findIndex((v) => v.variable === ctx.variable) : -1
          if (idx === -1) {
            targetScope.unmount.push(unmountCtx)
          } else {
            targetScope.unmount.splice(idx, 0, unmountCtx)
          }
        }
        return data.value
      })
    )
  }
  return targetScope.mounted.get(ref)!
}

export const factory = (scope: Scope): Scope.Factory => {
  if (!isOpen(scope)) {
    throw new Error('Scope has been closed and cannot be re-used')
  }

  const anchor = Injectable.of<void>(undefined)
  const internalScope = scope[SCOPE_INTERNAL]

  internalScope.unmount.push({
    variable: anchor,
    unmount: () => undefined as void
  })

  const parentCtx: Context = {
    variable: anchor,
    scope: scope
  }

  return {
    create: (options: Scope.Options = {}) => create({ ...options, parent: parentCtx }),
    run: <T>(variable: Injectable<T>, options: Scope.Options = {}) => run(variable, { ...options, parent: parentCtx })
  }
}

export const close = async (scope: Scope) => {
  if (!isOpen(scope)) {
    throw new Error('Scope already closed')
  }
  const internal = scope[SCOPE_INTERNAL]
  internal.open = false
  await pipe(
    internal.unmount,
    Arr.reverse,
    Arr.map((ctx) => Task.thunk(ctx.unmount)),
    Task.sequence
  )
}
