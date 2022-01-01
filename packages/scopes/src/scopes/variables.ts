import type { Scope } from './types'
import { Resource } from '../resources'
import { Var } from '../variables'

export const Factory = (): Var<Scope.Factory> =>
  Var.create(async (ctx) => {
    return {
      scope: ctx.scope,
      mount: async () => Resource.of(ctx.scope.factory())
    }
  })
