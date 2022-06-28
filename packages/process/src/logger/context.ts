import { AsyncLocalStorage } from 'async_hooks'
import { Logger } from 'pino'

import { Injectable } from '@apoyo/scopes'

export class LoggerContext {
  private _storage = new AsyncLocalStorage<Logger>()

  public run(logger: Logger, fn: () => void) {
    return this._storage.run(logger, fn)
  }

  public runAsync<T>(logger: Logger, fn: () => Promise<T>) {
    return new Promise<T>((resolve) => this._storage.run(logger, () => fn().then(resolve)))
  }

  public get() {
    return this._storage.getStore()
  }
}

export const $context = Injectable.define(() => new LoggerContext())
