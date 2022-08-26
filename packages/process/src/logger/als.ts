import { AsyncLocalStorage } from 'async_hooks'
import { Bindings } from 'pino'

import { Implementation } from '@apoyo/scopes'

export class LoggerALS {
  private _storage = new AsyncLocalStorage<Bindings>()

  public run(bindings: Bindings, fn: () => void) {
    const parent = this.bindings()
    return this._storage.run(
      {
        ...parent,
        ...bindings
      },
      fn
    )
  }

  public runAsync<T>(bindings: Bindings, fn: () => Promise<T>) {
    return new Promise<T>((resolve) => this.run(bindings, () => fn().then(resolve)))
  }

  public bindings() {
    return this._storage.getStore()
  }
}

export const $als = Implementation.create(() => new LoggerALS())
