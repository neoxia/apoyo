import type { Context } from '../types'

import { Var } from './types'
import { Ref } from '../refs'
import { Resource } from '../resources'
import { VAR_CREATE, VAR_FACTORY, VAR_REF } from './symbols'
import { pipe } from '@apoyo/std'
import { map } from './map'

export const isVar = (value: any): value is Var<any> => (value as Var)[VAR_REF] !== undefined

export const getReference = (variable: Var) => variable[VAR_REF]
export const getFactory = <Fun>(variable: Var.Factory<any, Fun>) => variable[VAR_FACTORY]
export const getLoader = <T>(variable: Var<T>) => variable[VAR_CREATE]

export function proxify<T>(internal: Var.Value<T>): Var<T> {
  const proxy = new Proxy(internal, {
    get(target: any, key) {
      const v = target[key]
      if (v) {
        return v
      }
      // eslint-disable-next-line no-console
      console.log('proxify get key', key)
      return (
        target[key] ??
        pipe(
          target,
          map((t: any) => t[key])
        )
      )
    }
  })

  return proxy
}

export const create = <T>(fn: (ctx: Context) => PromiseLike<Var.Loader<T>>): Var<T> =>
  proxify({
    [VAR_REF]: Ref.create(),
    [VAR_CREATE]: fn
  })

export const override = <T>(variable: Var<T>, fn: (ctx: Context) => PromiseLike<Var.Loader<T>>): Var<T> =>
  proxify({
    [VAR_REF]: variable[VAR_REF],
    [VAR_CREATE]: fn
  })

export const factory = <T, Fun>(factory: Fun, variable: Var<T>): Var.Factory<T, Fun> =>
  proxify({
    ...variable,
    [VAR_FACTORY]: factory
  }) as any

export const lazy = <A>(fn: () => PromiseLike<Var<A>> | Var<A>): Var<A> =>
  create(async (ctx) => Promise.resolve().then(fn).then(ctx.scope.load))

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
