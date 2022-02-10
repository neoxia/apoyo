import type { Scope } from './types'
import { Resource } from '../resources'
import { Injectable } from '../injectables'

export const bind = <T, U extends T>(from: Injectable<T>, to: U | Injectable<U>): Scope.Binding<T, U> => ({
  from,
  to
})

export const override = <T>(binding: Scope.Bound<T>): Injectable<T> => {
  const { from, to, scope } = binding
  if (Injectable.isInjectable(to)) {
    return Injectable.override(from, async (ctx) => {
      return {
        scope,
        mount: () => ctx.scope.get<T>(to).then(Resource.of)
      }
    })
  }
  return Injectable.override(from, async () => {
    return {
      scope,
      mount: async () => Resource.of(to)
    }
  })
}
