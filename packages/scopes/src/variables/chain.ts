import { pipe } from '@apoyo/std'
import { Resource } from '../resources'
import { Scope } from '../scopes'
import { create, factory } from './core'
import { Var } from './types'

export const chain = <A, B>(fn: (value: A) => PromiseLike<Var<B>> | Var<B>) => (variable: Var<A>) =>
  factory(
    fn,
    create<B>(
      async (ctx): Promise<Var.Loader> => {
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

export const chainArgs = <A extends any[], B>(fn: (...args: A) => Var<B> | PromiseLike<Var<B>>) => (variable: Var<A>) =>
  factory(
    fn,
    pipe(
      variable,
      chain((args) => fn(...args))
    )
  )
