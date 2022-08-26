import { Arr } from '@apoyo/std'

import { Injectable } from './injectables'
import { Ref } from './refs'
import { Resource } from './resources'

const override = <T>(from: Injectable, to: Injectable<T> | T): Injectable<T> => {
  if (Injectable.is(to)) {
    return Injectable.create(async (container) => container.get(to), from.ref)
  }
  return Injectable.create(async () => to, from.ref)
}

export namespace Container {
  export interface Binding<A = any, B extends A = any> {
    from: Injectable<A>
    to: B | Injectable<B>
  }
  export interface Options {
    bindings?: Binding<any, any>[]
  }
}

export class Container {
  private _isOpen = true
  private _bindings: Map<Ref, Injectable> = new Map()
  private _mounted: WeakMap<Ref, PromiseLike<any>> = new WeakMap()
  private _beforeCloseHooks: Resource.Unmount[] = []

  public static create(options: Container.Options = {}) {
    return new Container(options)
  }

  public static bind<T, U extends T>(from: Injectable<T>, to: U | Injectable<U>): Container.Binding<T, U> {
    return {
      from,
      to
    }
  }

  constructor(options: Container.Options = {}) {
    const bindings = options.bindings ?? []
    this._bindings = new Map(bindings.map(({ from, to }) => [from.ref, override(from, to)]))
  }

  public resolve<T>(injectable: Injectable<T>): Injectable<T> {
    return (this._bindings.get(injectable.ref) as Injectable<T> | undefined) ?? injectable
  }
  public async get<T>(variable: Injectable<T>): Promise<T> {
    if (!this._isOpen) {
      throw new Error('Scope has been closed and cannot be re-used')
    }

    const target = this.resolve(variable)
    if (!this._mounted.has(target.ref)) {
      this._mounted.set(target.ref, target.initialize(this))
    }
    return this._mounted.get(target.ref)!
  }
  public async close(): Promise<void> {
    if (!this._isOpen) {
      throw new Error('Scope already closed')
    }
    this._isOpen = false
    for (const unmount of Arr.reverse(this._beforeCloseHooks)) {
      await unmount()
    }
  }

  public beforeClose(fn: () => void | Promise<void>) {
    this._beforeCloseHooks.push(fn)
  }
}
