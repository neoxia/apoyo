import type { Scope } from './types'
import { Resource } from '../resources'
import { Injectable } from '../injectables'

export const Factory = (): Injectable<Scope.Factory> =>
  Injectable.create(async (ctx) => {
    return {
      scope: ctx.scope,
      mount: async () => Resource.of(ctx.scope.factory())
    }
  })
