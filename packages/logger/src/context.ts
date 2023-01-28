import { AsyncLocalStorage } from 'async_hooks'
import { Bindings } from 'pino'

export class LoggerContext {
  private _storage = new AsyncLocalStorage<Bindings>()

  public attachBindings<T>(bindings: Bindings, fn: () => T) {
    const parent = this.bindings()
    return this._storage.run(
      {
        ...parent,
        ...bindings
      },
      fn
    )
  }

  public bindings() {
    return this._storage.getStore()
  }
}
