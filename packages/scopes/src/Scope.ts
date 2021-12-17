import { Arr, Ord, pipe, Task } from '@apoyo/std'
import { Ref } from './Ref'
import { Resource } from './Resource'

import { BindingContext, Context, ScopeInternal, SCOPES_INTERNAL, UnmountContext } from './types'
import { getHierarchy, getRoot, searchChildOf } from './utils'
import { Var, VarTags } from './Var'

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
  load<T>(variable: Var<T>): Promise<Var.Created<T>>
  get<T>(variable: Var<T>): Promise<T>
  close(): Promise<void>
}

const isVar = (value: any): value is Var<any> => (value as Var<any>).tag === VarTags.VAR

export const bind = <T, U extends T>(from: Var<T>, to: U | Var<U>): ScopeBinding<T, U> => ({
  from,
  to: isVar(to) ? to : Var.of(to)
})

export const create = (options: ScopeOptions = {}): Scope => {
  let open = true

  const resolve = <T>(variable: Var<T>): Var<T> => {
    const bindingCtx = bindings.get(variable)
    if (bindingCtx) {
      if (bindingCtx.to && bindingCtx.to.tag === VarTags.VAR) {
        return {
          tag: VarTags.VAR,
          symbol: variable.symbol,
          create: async (ctx) => {
            return {
              scope: bindingCtx.scope,
              mount: () => ctx.scope.get<T>(bindingCtx.to).then((value) => ({ value }))
            }
          }
        }
      }
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

    if (!internal.created.has(variable.symbol)) {
      const resolved = resolve(variable)
      const ctx: Context = {
        scope,
        variable: resolved
      }
      internal.created.set(variable.symbol, resolved.create(ctx))
    }
    return await internal.created.get(variable.symbol)!
  }

  const scope: Scope = {
    tag: 'scope',
    parent: options.anchor,
    load,
    get: async (variable: Var) => {
      if (!open) {
        throw new Error('Scope has been closed and cannot be re-used')
      }

      const created = await load(variable)
      const targetScope = SCOPES_INTERNAL.get(created.scope) as ScopeInternal
      if (!targetScope.mounted.has(variable.symbol)) {
        targetScope.mounted.set(
          variable.symbol,
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
      return targetScope.mounted.get(variable.symbol)!
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

export const factory = (): Var<ScopeFactory> => ({
  tag: VarTags.VAR,
  symbol: Ref.create(),
  create: async (ctx) => {
    const anchorVar = pipe(
      Var.empty,
      Var.resource(() => Resource.of(undefined, () => undefined))
    )
    const anchorCtx: Context = {
      variable: anchorVar,
      scope: ctx.scope
    }

    const factory = {
      anchor: anchorVar,
      create: (options: ScopeOptions = {}) => create({ ...options, anchor: anchorCtx }),
      run: <T>(variable: Var<T>, options: ScopeOptions = {}) => run(variable, { ...options, anchor: anchorCtx })
    }

    return {
      scope: ctx.scope,
      mount: async () =>
        ctx.scope.get(anchorVar).then(() => ({
          value: factory
        }))
    }
  }
})

export const Scope = {
  create,
  bind,
  run,
  factory
}
