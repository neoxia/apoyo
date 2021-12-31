import { Arr, Ord, pipe, Task } from '@apoyo/std'
import { Resource } from './Resource'

import { BindingContext, Context, ScopeInternal, SCOPES_INTERNAL, UnmountContext } from './types'
import { getHierarchy, getRoot, searchChildOf } from './utils'
import { Var } from './variables'

export interface ScopeBinding<A, B extends A> {
  from: Var<A>
  to: Var<B>
}

export interface ScopeOptions {
  anchor?: Context
  bindings?: ScopeBinding<any, any>[]
}

export interface ScopeFactory {
  anchor: Var<void>
  create(options?: ScopeOptions): Scope
  run<T>(variable: Var<T>, options?: ScopeOptions): Promise<T>
}

export type Scope = {
  tag: 'scope'
  readonly parent?: Context
  load<T>(variable: Var<T>): Promise<Var.Loader<T>>
  get<T>(variable: Var<T>): Promise<T>
  factory(): ScopeFactory
  close(): Promise<void>
}

export const bind = <T, U extends T>(from: Var<T>, to: U | Var<U>): ScopeBinding<T, U> => ({
  from,
  to: Var.isVar(to) ? to : Var.of(to)
})

export const create = (options: ScopeOptions = {}): Scope => {
  let open = true

  const resolve = <T>(variable: Var<T>): Var<T> => {
    const bindingCtx = bindings.get(variable)
    if (bindingCtx) {
      if (bindingCtx.to && Var.isVar(bindingCtx.to)) {
        return Var.override(variable, async (ctx) => {
          return {
            scope: bindingCtx.scope,
            mount: () => ctx.scope.get<T>(bindingCtx.to).then(Resource.of)
          }
        })
      }
      return Var.override(variable, async () => {
        return {
          scope: bindingCtx.scope,
          mount: async () => Resource.of(bindingCtx.to)
        }
      })
    }
    return variable
  }

  const load = async <T>(variable: Var<T>): Promise<Var.Loader<T>> => {
    if (!open) {
      throw new Error('Scope has been closed and cannot be re-used')
    }

    const ref = Var.getReference(variable)
    if (!internal.created.has(ref)) {
      const resolved = resolve(variable)
      const ctx: Context = {
        scope,
        variable: resolved
      }
      internal.created.set(ref, resolved.create(ctx))
    }
    return await internal.created.get(ref)!
  }

  const get = async (variable: Var) => {
    if (!open) {
      throw new Error('Scope has been closed and cannot be re-used')
    }

    const ref = Var.getReference(variable)
    const created = await load(variable)
    const targetScope = SCOPES_INTERNAL.get(created.scope) as ScopeInternal
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

  const factory = (): ScopeFactory => {
    if (!open) {
      throw new Error('Scope has been closed and cannot be re-used')
    }

    const anchor = Var.of<void>(undefined)
    const internalScope = SCOPES_INTERNAL.get(scope) as ScopeInternal

    internalScope.unmount.push({
      variable: anchor,
      unmount: () => undefined as void
    })

    const anchorCtx: Context = {
      variable: anchor,
      scope: scope
    }

    return {
      anchor,
      create: (options: ScopeOptions = {}) => create({ ...options, anchor: anchorCtx }),
      run: <T>(variable: Var<T>, options: ScopeOptions = {}) => run(variable, { ...options, anchor: anchorCtx })
    }
  }

  const close = async () => {
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

  const scope: Scope = {
    tag: 'scope',
    parent: options.anchor,
    load,
    get,
    factory,
    close
  }

  const parent = options.anchor ? SCOPES_INTERNAL.get(options.anchor.scope) : undefined
  const scopeBindings = pipe(
    options.bindings || [],
    Arr.map(({ from, to }): [Var, BindingContext] => [
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
    parent: options.anchor,
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

export const run = async <T>(variable: Var<T>, options?: ScopeOptions) => {
  const scope = create(options)
  try {
    const value = await scope.get(variable)
    await scope.close()
    return value
  } catch (err) {
    await scope.close()
    throw err
  }
}

export const factory = (): Var<ScopeFactory> =>
  Var.create(async (ctx) => {
    return {
      scope: ctx.scope,
      mount: async () => Resource.of(ctx.scope.factory())
    }
  })

export const Scope = {
  create,
  bind,
  run,
  factory
}
