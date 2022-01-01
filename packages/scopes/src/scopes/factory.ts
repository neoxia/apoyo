import type { Scope } from './types'
import type { Var } from '../variables'
import { SCOPE_HIERARCHY, SCOPE_INTERNAL, SCOPE_SYMBOL } from './symbols'
import * as Core from './core'
import { mergeBindings } from './utils'

export const create = (options: Scope.Options = {}): Scope => {
  const load = async <T>(variable: Var<T>): Promise<Var.Loader<T>> => Core.load(scope, variable)
  const get = async (variable: Var) => Core.get(scope, variable)
  const factory = (): Scope.Factory => Core.factory(scope)
  const close = async () => Core.close(scope)

  const parent = options.parent

  const internal: Scope.Internal = {
    bindings: new Map(),
    created: new WeakMap(),
    mounted: new WeakMap(),
    unmount: [],
    open: true
  }

  const scope: Scope = {
    [SCOPE_SYMBOL]: true,
    [SCOPE_INTERNAL]: internal,
    [SCOPE_HIERARCHY]: undefined,

    get parent() {
      return parent
    },
    get root() {
      return parent ? parent.scope.root : scope
    },

    load,
    get,
    factory,
    close
  }

  internal.bindings = mergeBindings(scope, options.parent, options.bindings ?? [])

  return scope
}

export const run = async <T>(variable: Var<T>, options?: Scope.Options) => {
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