import { Resource } from '../resources'
import { Var } from '../variables'
import { ScopeFactory } from './types'

export const Factory = (): Var<ScopeFactory> =>
  Var.create(async (ctx) => {
    return {
      scope: ctx.scope,
      mount: async () => Resource.of(ctx.scope.factory())
    }
  })
