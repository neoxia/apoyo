import { Arr, pipe, Prom } from '@apoyo/std'

import { Scope, ScopeBuilder } from './Scope'
import { Context } from './types'
import { getLowestScope, getRoot } from './utils'

export type Var<T = any> = {
  symbol: symbol
  tag: 'var'
  create: (ctx: Context) => Promise<Var.Created<T>>
}
export namespace Var {
  export type Unmount = () => Promise<void> | void

  export interface Created<T = any> {
    scope: Scope
    dependencies: Var[]
    mount: () => Promise<{
      value: T
      unmount?: Unmount
    }>
  }
}

export const thunk = <T>(thunk: () => T | Promise<T>): Var<T> => ({
  tag: 'var',
  symbol: Symbol('<anonymous>'),
  create: async (ctx) => ({
    scope: getRoot(ctx.scope),
    dependencies: [],
    mount: () =>
      pipe(
        Prom.thunk(thunk),
        Prom.map((value) => ({ value }))
      )
  })
})

export const of = <T>(value: T): Var<T> => thunk(() => value)

export const lazy = <A>(fn: () => Promise<Var<A>> | Var<A>): Var<A> => ({
  tag: 'var',
  symbol: Symbol('<anonymous>'),
  create: async (ctx) => {
    const variable = await fn()
    return ctx.scope.load(variable)
  }
})

export const closeWith = <A>(fn: (value: A) => Promise<void> | void) => (variable: Var<A>): Var<A> => ({
  tag: 'var',
  symbol: Symbol('<anonymous>'),
  create: async (ctx) => {
    const created = await ctx.scope.load(variable)

    return {
      scope: created.scope,
      dependencies: [variable],
      mount: () =>
        ctx.scope.get(variable).then((value) => ({
          value,
          unmount: () => fn(value)
        }))
    }
  }
})

export const map = <A, B>(fn: (value: A) => B | Promise<B>) => (variable: Var<A>): Var<B> => ({
  tag: 'var',
  symbol: Symbol('<anonymous>'),
  create: async (ctx): Promise<Var.Created> => {
    const created = await ctx.scope.load(variable)

    return {
      scope: created.scope,
      dependencies: [variable],
      mount: () =>
        ctx.scope
          .get(variable)
          .then(fn)
          .then((value) => ({
            value
          }))
    }
  }
})

export const chain = <A, B>(fn: (value: A) => Promise<Var<B>> | Var<B>) => (variable: Var<A>): Var<B> => ({
  tag: 'var',
  symbol: Symbol('<anonymous>'),
  create: async (ctx): Promise<Var.Created> => {
    const chainedVar = await ctx.scope.get(variable).then(fn)

    const createdVar = await ctx.scope.load(variable)
    const created = await ctx.scope.load(chainedVar)

    return {
      scope: getLowestScope(ctx.scope, [createdVar.scope, created.scope]),
      dependencies: [variable, chainedVar],
      mount: created.mount
    }
  }
})

export const spawner = (): Var<() => ScopeBuilder> => ({
  tag: 'var',
  symbol: Symbol('<anonymous>'),
  create: async (ctx) => {
    return {
      scope: ctx.scope,
      dependencies: [],
      mount: async () => ({
        value: () => Scope.childOf(ctx),
        unmount: () => undefined
      })
    }
  }
})

export const all = <A>(variables: Var<A>[]): Var<A[]> => ({
  tag: 'var',
  symbol: Symbol('<anonymous>'),
  create: async (ctx) => {
    const created = await pipe(
      variables,
      Arr.map((v) => ctx.scope.load(v)),
      Prom.all
    )

    return {
      scope: getLowestScope(
        ctx.scope,
        pipe(
          created,
          Arr.map((c) => c.scope)
        )
      ),
      dependencies: variables,
      mount: () =>
        pipe(
          variables,
          Arr.map((v) => ctx.scope.get(v)),
          Prom.all,
          Prom.map((value) => ({ value }))
        )
    }
  }
})

export function inject<A>(a: Var<A>): Var<[A]>
export function inject<A, B>(a: Var<A>, b: Var<B>): Var<[A, B]>
export function inject<A, B, C>(a: Var<A>, b: Var<B>, c: Var<C>): Var<[A, B, C]>
export function inject(...vars: Var[]): Var<any[]> {
  return all(vars)
}

export const abstract = <T>(description: string) =>
  pipe(
    thunk<T>(() => {
      throw new Error(`cannot mount abstract variable ${description}`)
    }),
    named(description)
  )

export const named = (description: string) => <T>(variable: Var<T>) => ({
  ...variable,
  symbol: Symbol(description)
})

export const Var = {
  thunk,
  of,
  lazy,
  all,
  inject,
  map,
  chain,
  closeWith,
  spawner,
  abstract,
  named
}
