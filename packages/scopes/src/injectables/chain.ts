import { pipe } from '@apoyo/std'
import { Resource } from '../resources'
import { Scope } from '../scopes'
import { create, factory } from './core'
import { Injectable } from './types'

export const chain = <A, B>(fn: (value: A) => PromiseLike<Injectable<B>> | Injectable<B>) => (
  variable: Injectable<A>
) =>
  factory(
    fn,
    create<B>(
      async (ctx): Promise<Injectable.Loader> => {
        const chainedVar = await ctx.scope.get(variable).then(fn)
        const createdVar = await ctx.scope.load(chainedVar)
        const created = await ctx.scope.load(variable)

        return {
          scope: Scope.getLowestScope(ctx.scope, [created.scope, createdVar.scope]),
          mount: () => ctx.scope.get(chainedVar).then(Resource.of)
        }
      }
    )
  )

export const chainArgs = <A extends any[], B>(fn: (...args: A) => Injectable<B> | PromiseLike<Injectable<B>>) => (
  variable: Injectable<A>
) =>
  factory(
    fn,
    pipe(
      variable,
      chain((args) => fn(...args))
    )
  )
