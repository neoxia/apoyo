import type { Resource } from '../resources'
import type { Var } from './types'

import { create, factory } from './core'

export const resource = <A, B>(fn: (value: A) => Resource<B> | PromiseLike<Resource<B>>) => (variable: Var<A>) =>
  factory(
    fn,
    create<B>(async (ctx) => {
      const created = await ctx.scope.load(variable)

      return {
        scope: created.scope,
        mount: () => ctx.scope.get(variable).then(fn)
      }
    })
  )
