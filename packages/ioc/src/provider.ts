import { Container } from './container'
import { ProviderKey } from './keys'
import { ShutdownHook, ShutdownPriority } from './shutdown'
import { Fn, Tuple, Type } from './types'

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

  public async factory(container: Container): Promise<T> {
    const res = await this._provide(container)
    if (res instanceof Provider) {
      return container.get(res) as any
    }
    return res as any
  }

  // Static methods

  public static from<T>(
    initializer: (container: Container) => Provider.ReturnType<T>,
    key = ProviderKey.create()
  ): Provider<T> {
    return new Provider(initializer, key)
  }

  public static fromConst<T>(value: Provider.ReturnType<T>): Provider<T> {
    return Provider.from(() => value)
  }

  public static fromClass<T, Args extends Tuple>(type: Type<T, Args>, deps: Provider.ArrayOf<Args>): Provider<T> {
    return Provider.from(async (container) => {
      const args: any = []
      for (const dep of deps) {
        args.push(await container.get(dep))
      }
      return new type(...args)
    }, new ProviderKey(type.name))
  }

  public static fromFactory<T, Args extends Tuple>(factory: Fn<Args, T>, deps: Provider.ArrayOf<Args>): Provider<T> {
    return Provider.from(async (container) => {
      const args: any = []
      for (const dep of deps) {
        args.push(await container.get(dep))
      }
      return factory(...args) as any
    }, new ProviderKey(factory.name))
  }

  public static fromArray<T>(providers: Provider<T>[]): Provider<T[]> {
    return Provider.from(async (container) => {
      const items: T[] = []
      for (const provider of providers) {
        items.push(await container.get(provider))
      }
      return items
    })
  }

  public static fromObject<T extends { [key: string]: any }>(
    providers: { [P in keyof T]: Provider<T[P]> }
  ): Provider<T> {
    return Provider.from(async (container) => {
      const items: T = {} as any
      for (const [key, provider] of Object.entries(providers)) {
        items[key as keyof T] = await container.get(provider)
      }
      return items
    })
  }

  public static asType<Interface>() {
    return <Type extends Interface>(provider: Provider<Type>): Provider<Interface> => provider as Provider<Interface>
  }

  public static asResource<T>(options: {
    priority?: ShutdownPriority
    init?(item: T): Promise<void>
    close?(item: T): Promise<void>
  }) {
    return (provider: Provider<T>) => {
      return new Provider(
        async (container): Promise<T> => {
          const current = await container.get(provider)
          const { priority, init, close } = options

          if (init) {
            await init(current)
          }
          if (close) {
            const hook: ShutdownHook = {
              close: () => close(current),
              priority: priority ?? ShutdownPriority.LOW
            }
            container.on('close', hook)
          }
          return current
        }
      )
    }
  }
}
