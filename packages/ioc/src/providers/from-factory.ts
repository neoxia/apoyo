import { ProviderKey } from '../keys'
import { Fn, Tuple } from '../types'
import { Provider } from './provider'

export function fromFactory<Deps extends Tuple, T>(factory: Fn<Deps, T>, deps: Provider.ArrayOf<Deps>): Provider<T> {
  return Provider.from(async (container) => {
    const args: any = []
    for (const dep of deps) {
      args.push(await container.get(dep))
    }
    return factory(...args) as any
  }, new ProviderKey(factory.name))
}
