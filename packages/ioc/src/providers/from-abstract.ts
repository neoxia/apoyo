import { AbstractProviderException } from '../exceptions'
import { ProviderKey } from '../keys'
import { Provider } from './provider'

export function fromAbstract<T>(name: string): Provider<T> {
  return Provider.from(async () => {
    throw new AbstractProviderException(name)
  }, new ProviderKey(name))
}
