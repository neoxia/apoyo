import type { Container } from '../container'
import { Provider } from './provider'
import { Fn, Tuple, Type } from '../types'
import { fromAbstract } from './from-abstract'
import { fromClass } from './from-class'
import { fromFactory } from './from-factory'

export class UnboundProvider<Interface = unknown> {
  public toClass<T extends Interface, Args extends Tuple>(
    type: Type<T, Args>,
    deps: Provider.ArrayOf<Args>
  ): Provider<Interface> {
    return fromClass(type, deps)
  }

  public toFactory<T extends Interface, Args extends Tuple>(
    factory: Fn<Args, T>,
    deps: Provider.ArrayOf<Args>
  ): Provider<Interface> {
    return fromFactory(factory, deps)
  }

  public toAbstract(name: string): Provider<Interface> {
    return fromAbstract(name)
  }

  public toConst<T extends Interface>(value: T): Provider<Interface> {
    return Provider.fromConst(value)
  }

  public to<T extends Interface>(fn: (container: Container) => T | Promise<T>): Provider<Interface> {
    return Provider.from(fn)
  }
}
