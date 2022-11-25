import { Provider } from './provider'
import { Tuple, Type } from '../types'
import { ProviderKey } from '../keys'

export function fromClass<T, Args extends Tuple>(type: Type<T, Args>, deps: Provider.ArrayOf<Args>): Provider<T> {
  return Provider.from(async (container) => {
    const args: any = []
    for (const dep of deps) {
      args.push(await container.get(dep))
    }
    return new type(...args)
  }, new ProviderKey(type.name))
}
