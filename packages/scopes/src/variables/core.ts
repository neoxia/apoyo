import { pipe, Prom, Dict } from '@apoyo/std'
import { Ref } from '../Ref'
import { Resource } from '../Resource'
import { Scope } from '../Scope'
import { Context } from '../types'
import { getRoot } from '../utils'
import { ABSTRACT_SYMBOL, VAR_SYMBOL } from './constants'
import { getLowestScope } from './utils'

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

export const thunk = <T>(thunk: () => T | PromiseLike<T>): Var<T> =>
  create(async (ctx) => ({
    scope: getRoot(ctx.scope),
    mount: () => pipe(Prom.thunk(thunk), Prom.map(Resource.of))
  }))

export const of = <T>(value: T): Var<T> => thunk(() => value)

export const empty = of<void>(undefined)

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

export const map = <A, B>(fn: (value: A) => B | PromiseLike<B>) => (variable: Var<A>) =>
  factory(
    fn,
    pipe(
      variable,
      resource((v) => Promise.resolve(v).then(fn).then(Resource.of))
    )
  )

export const chain = <A, B>(fn: (value: A) => PromiseLike<Var<B>> | Var<B>) => (variable: Var<A>) =>
  factory(
    fn,
    create<B>(
      async (ctx): Promise<Var.Loader> => {
        const chainedVar = await ctx.scope.get(variable).then(fn)
        const createdVar = await ctx.scope.load(chainedVar)
        const created = await ctx.scope.load(variable)

        return {
          scope: getLowestScope(ctx.scope, [created.scope, createdVar.scope]),
          mount: () => ctx.scope.get(chainedVar).then(Resource.of)
        }
      }
    )
  )
