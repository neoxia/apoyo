import type { Scope } from './types'

import { Resource } from '../resources'
import { Var } from '../variables'

export interface Binding<A = any, B extends A = any> {
  from: Var<A>
  to: Var<B>
}

export interface Bound<T = any> {
  from: Var
  to: T
  scope: Scope
}

export const bind = <T, U extends T>(from: Var<T>, to: U | Var<U>): Binding<T, U> => ({
  from,
  to: Var.isVar(to) ? to : Var.of(to)
})

export const override = <T>(binding: Bound<T>): Var<T> => {
  const { from, to, scope } = binding
  if (Var.isVar(to)) {
    return Var.override(from, async (ctx) => {
      return {
        scope,
        mount: () => ctx.scope.get<T>(to).then(Resource.of)
      }
    })
  }
  return Var.override(from, async () => {
    return {
      scope,
      mount: async () => Resource.of(to)
    }
  })
}
