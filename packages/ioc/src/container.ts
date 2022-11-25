import { Provider } from './providers'
import { ProviderKey } from './keys'
import { ContainerAlreadyClosedException, ContainerClosedException } from './exceptions'

const override = <T>(from: Provider, to: Provider<T> | T): Provider<T> => {
  if (to instanceof Provider) {
    return Provider.from(async (container) => container.get(to), from.key)
  }
  return Provider.from(async () => to, from.key)
}

export namespace Container {
  export interface Binding<A = any, B extends A = any> {
    from: Provider<A>
    to: B | Provider<B>
  }
  export interface Options {
    bindings?: Binding<any, any>[]
  }
}

export class Container {
  private _isOpen = true
  private _bindings: Map<ProviderKey, Provider> = new Map()
  private _mounted: WeakMap<ProviderKey, PromiseLike<any>> = new WeakMap()

  public static create(options: Container.Options = {}) {
    return new Container(options)
  }

  public static bind<T, U extends T>(from: Provider<T>, to: U | Provider<U>): Container.Binding<T, U> {
    return {
      from,
      to
    }
  }

  constructor(options: Container.Options = {}) {
    const bindings = options.bindings ?? []
    this._bindings = new Map(bindings.map(({ from, to }) => [from.key, override(from, to)]))
  }

  public resolve<T>(injectable: Provider<T>): Provider<T> {
    return (this._bindings.get(injectable.key) as Provider<T> | undefined) ?? injectable
  }

  public async get<T>(variable: Provider<T>): Promise<T> {
    if (!this._isOpen) {
      throw new ContainerClosedException()
    }

    const target = this.resolve(variable)
    if (!this._mounted.has(target.key)) {
      this._mounted.set(target.key, target.provide(this))
    }
    return this._mounted.get(target.key)!
  }

  public async close(): Promise<void> {
    if (!this._isOpen) {
      throw new ContainerAlreadyClosedException()
    }
    const destroyHooks = await this.get(Provider.$onDestroy)
    await destroyHooks.execute()

    this._mounted = new WeakMap()
    this._isOpen = false
  }
}
