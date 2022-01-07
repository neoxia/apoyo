import { Dict } from '@apoyo/std'
import { Ref } from '../refs'
import { Resource } from '../resources'
import { Scope } from '../scopes'
import { Context } from '../types'
import { ABSTRACT_SYMBOL, VAR_SYMBOL } from './symbols'

export interface Var<T = any> {
  [VAR_SYMBOL]: Ref
  create: (ctx: Context) => PromiseLike<Var.Loader<T>>
}

export namespace Var {
  export interface Abstract<T> extends Var<T> {
    [ABSTRACT_SYMBOL]: boolean
  }

  export interface Factory<T, Fun> extends Var<T> {
    factory: Fun
  }
  export interface Loader<T = any> {
    scope: Scope
    mount: () => PromiseLike<Resource<T>>
  }
  export type Struct<A extends Dict<Var>> = Var<
    {
      [P in keyof A]: A[P] extends Var<infer I> ? I : never
    }
  >
}

export const isVar = (value: any): value is Var<any> => (value as Var)[VAR_SYMBOL] !== undefined

export const getReference = (variable: Var) => variable[VAR_SYMBOL]

export const create = <T>(fn: (ctx: Context) => PromiseLike<Var.Loader<T>>): Var<T> => ({
  [VAR_SYMBOL]: Ref.create(),
  create: fn
})

export const override = <T, U extends T>(
  variable: Var<T>,
  fn: (ctx: Context) => PromiseLike<Var.Loader<U>>
): Var<T> => ({
  [VAR_SYMBOL]: variable[VAR_SYMBOL],
  create: fn
})

export const factory = <T, Fun>(factory: Fun, variable: Var<T>): Var.Factory<T, Fun> => ({
  ...variable,
  factory
})

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
