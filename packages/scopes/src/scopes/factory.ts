import type { Scope } from './types'
import { Injectable } from '../injectables'
import { SCOPE_INTERNAL } from './symbols'
import * as Core from './core'
import { computeBindings } from './utils'
import { Context } from '../types'

class ScopeImplementation implements Scope {
  public [SCOPE_INTERNAL] = {
    bindings: new Map(),
    created: new WeakMap(),
    mounted: new WeakMap(),
    unmount: [],
    open: true
  }
  public parent?: Context

  constructor(options: Scope.Options = {}) {
    this.parent = options.parent
    this[SCOPE_INTERNAL].bindings = computeBindings(this, options.bindings ?? [])
  }

  get root(): Scope {
    return this.parent ? this.parent.scope.root : this
  }

  load<T>(variable: Injectable<T>): Promise<Injectable.Loader<T>> {
    return Core.load(this, variable)
  }
  get<T>(variable: Injectable<T>): Promise<T> {
    return Core.get(this, variable)
  }
  factory(): Scope.Factory {
    return Core.factory(this)
  }
  close(): Promise<void> {
    return Core.close(this)
  }
}

export const create = (options: Scope.Options = {}): Scope => {
  return new ScopeImplementation(options)
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
