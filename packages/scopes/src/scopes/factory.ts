import type { Scope } from './types'
import { Injectable } from '../injectables'
import { SCOPE_INTERNAL } from './symbols'
import * as Core from './core'
import { computeBindings } from './utils'
import { Context } from '..'

class ScopeImpl implements Scope {
  public [SCOPE_INTERNAL] = {
    bindings: new Map(),
    created: new WeakMap(),
    mounted: new WeakMap(),
    unmount: [],
    open: true
  }
  public parent?: Context | undefined
  public root: Scope

  constructor(options: Scope.Options = {}) {
    const parent = options.parent

    this.parent = parent
    this.root = parent ? parent.scope.root : this

    this[SCOPE_INTERNAL].bindings = computeBindings(this, options.bindings ?? [])
  }

  public resolve<T>(variable: Injectable<T>): Injectable<T> {
    return Core.resolve(this, variable)
  }
  public load<T>(variable: Injectable<T>): Promise<Injectable.Loader<T>> {
    return Core.load(this, variable)
  }
  public get<T>(variable: Injectable<T>): Promise<T> {
    return Core.get(this, variable)
  }
  public factory(): Scope.Factory {
    return Core.factory(this)
  }
  public close(): Promise<void> {
    return Core.close(this)
  }
}

export const create = (options: Scope.Options = {}): Scope => {
  return new ScopeImpl(options)
}

export const run = async <T>(variable: Injectable<T>, options?: Scope.Options) => {
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
