import { Arr, pipe, Task } from '@apoyo/std'

import { Context } from '../types'
import { Var } from '../variables'
import { override } from './bindings'
import { SCOPE_INTERNAL } from './symbols'
import { create, run } from './factory'
import { Scope, ScopeFactory, ScopeOptions, UnmountContext } from './types'
import { isOpen, searchChildOf } from './utils'

export const resolve = <T>(scope: Scope, variable: Var<T>): Var<T> => {
  const bindingCtx = scope[SCOPE_INTERNAL].bindings.get(variable)
  return bindingCtx ? override(bindingCtx) : variable
}

export const load = async <T>(scope: Scope, variable: Var<T>): Promise<Var.Loader<T>> => {
  if (!isOpen(scope)) {
    throw new Error('Scope has been closed and cannot be re-used')
  }

  const ref = Var.getReference(variable)
  const internal = scope[SCOPE_INTERNAL]
  if (!internal.created.has(ref)) {
    const resolved = resolve(scope, variable)
    const ctx: Context = {
      scope,
      variable: resolved
    }
    internal.created.set(ref, resolved.create(ctx))
  }
  return await internal.created.get(ref)!
}

export const get = async <T>(scope: Scope, variable: Var<T>) => {
  if (!isOpen(scope)) {
    throw new Error('Scope has been closed and cannot be re-used')
  }

  const ref = Var.getReference(variable)
  const created = await load(scope, variable)
  const targetScope = created.scope[SCOPE_INTERNAL]
  if (!targetScope.mounted.has(ref)) {
    targetScope.mounted.set(
      ref,
      created.mount().then((data) => {
        const unmountFn = data.unmount
        if (unmountFn) {
          const ctx = searchChildOf(scope, created.scope)
          const unmountCtx: UnmountContext = {
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

export const factory = (scope: Scope): ScopeFactory => {
  if (!isOpen(scope)) {
    throw new Error('Scope has been closed and cannot be re-used')
  }

  const anchor = Var.of<void>(undefined)
  const internalScope = scope[SCOPE_INTERNAL]

  internalScope.unmount.push({
    variable: anchor,
    unmount: () => undefined as void
  })

  const anchorCtx: Context = {
    variable: anchor,
    scope: scope
  }

  return {
    create: (options: ScopeOptions = {}) => create({ ...options, anchor: anchorCtx }),
    run: <T>(variable: Var<T>, options: ScopeOptions = {}) => run(variable, { ...options, anchor: anchorCtx })
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
