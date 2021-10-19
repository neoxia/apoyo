import { Arr, Ord, pipe, Task } from '@apoyo/std'
import { Ref } from './Ref'

import { BindingContext, Context, ScopeInternal, SCOPES_INTERNAL, UnmountContext } from './types'
import { getHierarchy, getRoot, searchChildOf } from './utils'
import { Var, VarTags } from './Var'

export interface ScopeBuilder {
  parent?: Context
  bindings: Map<Var, any>
}

export type Scope = {
  tag: 'scope'
  readonly parent?: Context
  load<T>(variable: Var<T>): Promise<Var.Created<T>>
  get<T>(variable: Var<T>): Promise<T>
  close(): Promise<void>
}

export namespace Scope {
  export interface Spawner {
    spawn: () => ScopeBuilder
  }
}

export const create = (): ScopeBuilder => ({
  bindings: new Map()
})
export const childOf = (ctx: Context): ScopeBuilder => ({
  parent: ctx,
  bindings: new Map()
})

export const bind = <T, U extends T>(from: Var<T>, to: U) => (builder: ScopeBuilder) => {
  builder.bindings.set(from, to)
  return builder
}

export const get = (builder: ScopeBuilder): Scope => {
  let open = true

  const resolve = <T>(variable: Var<T>): Var<T> => {
    const bindingCtx = bindings.get(variable)
    if (bindingCtx) {
      return {
        tag: VarTags.VAR,
        symbol: variable.symbol,
        create: async () => {
          return {
            scope: bindingCtx.scope,
            mount: async () => ({
              value: bindingCtx.to
            })
          }
        }
      }
    }
    return variable
  }

  const load = async <T>(variable: Var<T>): Promise<Var.Created<T>> => {
    if (!open) {
      throw new Error('Scope has been closed and cannot be re-used')
    }

    const resolved = resolve(variable)

    const ctx: Context = {
      scope,
      variable: resolved
    }
    if (!internal.created.has(resolved.symbol)) {
      internal.created.set(resolved.symbol, resolved.create(ctx))
    }
    return await internal.created.get(resolved.symbol)!
  }

  const scope: Scope = {
    tag: 'scope',
    parent: builder.parent,
    load,
    get: async (variable: Var) => {
      if (!open) {
        throw new Error('Scope has been closed and cannot be re-used')
      }

      const resolved = resolve(variable)
      const created = await load(resolved)
      const targetScope = SCOPES_INTERNAL.get(created.scope) as ScopeInternal
      if (!targetScope.mounted.has(resolved.symbol)) {
        targetScope.mounted.set(
          resolved.symbol,
          created.mount().then((data) => {
            const unmountFn = data.unmount
            if (unmountFn) {
              const ctx = searchChildOf(scope, created.scope)
              const unmountCtx: UnmountContext = {
                variable: resolved,
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
      return targetScope.mounted.get(resolved.symbol)!
    },
    close: async () => {
      if (!open) {
        throw new Error('Scope already closed')
      }
      open = false
      await pipe(
        internal.unmount,
        Arr.reverse,
        Arr.map((ctx) => Task.thunk(ctx.unmount)),
        Task.sequence
      )
    }
  }

  const parent = builder.parent ? SCOPES_INTERNAL.get(builder.parent.scope) : undefined
  const scopeBindings = pipe(
    Arr.from(builder.bindings.entries()),
    Arr.map(([from, to]): [Var, BindingContext] => [
      from,
      {
        from,
        to,
        scope
      }
    ])
  )
  const bindings = parent ? new Map([...parent.bindings.entries(), ...scopeBindings]) : new Map(scopeBindings)

  const root = getRoot(scope)
  const hierarchy = getHierarchy(scope)
  const hierarchyPrio = new Map(hierarchy.map((h, idx) => [h, idx]))
  const ordScope = pipe(
    Ord.number,
    Ord.optional,
    Ord.contramap((scope: Scope) => hierarchyPrio.get(scope))
  )

  const internal: ScopeInternal = {
    parent: builder.parent,
    bindings,
    hierarchy,
    root,
    ord: ordScope,
    created: new WeakMap(),
    mounted: new WeakMap(),
    unmount: []
  }

  SCOPES_INTERNAL.set(scope, internal)

  return scope
}

export const run = <T>(variable: Var<T>) => async (builder: ScopeBuilder) => {
  const scope = get(builder)
  try {
    const value = await scope.get(variable)
    await scope.close()
    return value
  } catch (err) {
    await scope.close()
    throw err
  }
}

export const spawner = (): Var<Scope.Spawner> => ({
  tag: VarTags.VAR,
  symbol: Ref.create('<anonymous>'),
  create: async (ctx) => {
    return {
      scope: ctx.scope,
      mount: async () => ({
        value: {
          spawn: () => Scope.childOf(ctx)
        },
        unmount: () => undefined
      })
    }
  }
})

export const Scope = {
  create,
  childOf,
  bind,
  get,
  run,
  spawner
}
