import type { Container } from '../container'
import { ProviderKey } from '../keys'
import { ShutdownHooks, ShutdownPriority } from '../shutdown'
import { Tuple } from '../types'
import { UnboundProvider } from './unbound-provider'

export namespace Provider {
  export type ArrayOf<Deps extends Tuple> = Deps extends []
    ? []
    : {
        [Index in keyof Deps]: Provider<Deps[Index]>
      } & { length: Deps['length'] }

  export type ReturnType<T> = T | Provider<T> | Promise<T | Provider<T>>
}

export class Provider<T = unknown> {
  public readonly key: ProviderKey

  private readonly _provide: (container: Container) => Provider.ReturnType<T>

  private constructor(provide: (container: Container) => Provider.ReturnType<T>, key: ProviderKey = new ProviderKey()) {
    this._provide = provide
    this.key = key
  }

  public async provide(container: Container): Promise<T> {
    const res = await this._provide(container)
    if (res instanceof Provider) {
      return container.get(res) as any
    }
    return res as any
  }

  public asResource(options: {
    priority?: ShutdownPriority
    init?(item: T): Promise<void>
    close?(item: T): Promise<void>
  }): Provider<T> {
    return new Provider(
      async (container): Promise<T> => {
        const current = await container.get(this)
        const { priority, init, close } = options

        if (init) {
          await init(current)
        }
        if (close) {
          const hook = () => close(current)
          const destroyHooks = await container.get(Provider.$onDestroy)
          destroyHooks.register(hook, priority ?? ShutdownPriority.LOW)
        }
        return current
      }
    )
  }

  // Static methods & properties

  public static $container = Provider.from(async (container) => container)
  public static $onDestroy = Provider.from(async () => new ShutdownHooks())

  public static bind<Interface>() {
    return new UnboundProvider<Interface>()
  }

  public static from<T>(
    initializer: (container: Container) => Provider.ReturnType<T>,
    key = ProviderKey.create()
  ): Provider<T> {
    return new Provider(initializer, key)
  }

  public static fromConst<T>(value: Provider.ReturnType<T>): Provider<T> {
    return Provider.from(() => value)
  }
}
