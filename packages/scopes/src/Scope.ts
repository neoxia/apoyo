import { Arr, pipe, Task } from '@apoyo/std'

import { Context, ScopeInternal, SCOPES_INTERNAL, UnmountContext } from './types'
import { resolveVariable, searchChildOf } from './utils'
import { Var } from './Var'

export interface ScopeBuilder {
  parent?: Context
  bindings: Map<Var, Var>
}

export type Scope = {
  tag: 'scope'
  readonly parent?: Context
  resolve<T>(variable: Var<T>): Var<T>
  load<T>(variable: Var<T>): Promise<Var.Created<T>>
  get<T>(variable: Var<T>): Promise<T>
  close(): Promise<void>
}

export const create = (): ScopeBuilder => ({
  bindings: new Map()
})
export const childOf = (ctx: Context): ScopeBuilder => ({
  parent: ctx,
  bindings: new Map()
})

export const bind = <T, U extends T>(from: Var<T>, to: Var<U>) => (builder: ScopeBuilder) => {
  builder.bindings.set(from, to)
  return builder
}

export const get = (builder: ScopeBuilder): Scope => {
  let open = true

  const parent = builder.parent ? SCOPES_INTERNAL.get(builder.parent.scope) : undefined

  const resolve = <T>(variable: Var<T>) => resolveVariable(variable, internal.bindings.all)
  const load = async <T>(variable: Var<T>): Promise<Var.Created<T>> => {
    if (!open) {
      throw new Error('Scope has been closed and cannot be re-used')
    }

    const resolved = resolve(variable)

    const ctx: Context = {
      scope,
      variable: resolved
    }
    if (!internal.created.has(resolved)) {
      internal.created.set(resolved, resolved.create(ctx))
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return await internal.created.get(resolved)!
  }

  const scope: Scope = {
    tag: 'scope',
    parent: builder.parent,
    resolve,
    load,
    get: async (variable: Var) => {
      if (!open) {
        throw new Error('Scope has been closed and cannot be re-used')
      }

      const resolved = resolve(variable)
      const created = await load(resolved)
      const targetScope = SCOPES_INTERNAL.get(created.scope) as ScopeInternal
      if (!targetScope.mounted.has(resolved)) {
        targetScope.mounted.set(
          resolved,
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
      return targetScope.mounted.get(resolved)
    },
    close: async () => {
      open = false
      await pipe(
        internal.unmount,
        Arr.reverse,
        Arr.map((ctx) => Task.thunk(ctx.unmount)),
        Task.sequence
      )
    }
  }

  const bindings = builder.bindings
  const internal: ScopeInternal = {
    parent: builder.parent,
    bindings: {
      scope: bindings,
      all: parent ? new Map([...parent.bindings.all.entries(), ...bindings.entries()]) : bindings
    },
    created: new Map(),
    mounted: new Map(),
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

export const Scope = {
  create,
  childOf,
  bind,
  get,
  run
}
