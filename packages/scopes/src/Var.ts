import { Arr, Dict, pipe, Task } from '@apoyo/std'

import { Scope } from './Scope'
import { Context } from './types'
import { getLowestScope, getRoot } from './utils'

export type Var<T = any> = {
  symbol: symbol
  tag: 'var'
  create: (ctx: Context) => PromiseLike<Var.Created<T>>
}
export namespace Var {
  export type Unmount = () => PromiseLike<void> | void

  export type Struct<A extends Dict<Var>> = Var<
    {
      [P in keyof A]: A[P] extends Var<infer I> ? I : never
    }
  >

  export interface Created<T = any> {
    scope: Scope
    dependencies: Var[]
    mount: () => PromiseLike<{
      value: T
      unmount?: Unmount
    }>
  }
}

export const thunk = <T>(thunk: () => T | PromiseLike<T>): Var<T> => ({
  tag: 'var',
  symbol: Symbol('<anonymous>'),
  create: async (ctx) => ({
    scope: getRoot(ctx.scope),
    dependencies: [],
    mount: () =>
      pipe(
        Task.thunk(thunk),
        Task.map((value) => ({ value }))
      )
  })
})

export const of = <T>(value: T): Var<T> => thunk(() => value)

export const lazy = <A>(fn: () => PromiseLike<Var<A>> | Var<A>): Var<A> => ({
  tag: 'var',
  symbol: Symbol('<anonymous>'),
  create: async (ctx) => {
    const variable = await fn()
    return ctx.scope.load(variable)
  }
})

export const closeWith = <A>(fn: (value: A) => PromiseLike<void> | void) => (variable: Var<A>): Var<A> => ({
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

export const map = <A, B>(fn: (value: A) => B | PromiseLike<B>) => (variable: Var<A>): Var<B> => ({
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

export const mapWith = <A extends any[], B>(fn: (...args: A) => B | PromiseLike<B>) => map<A, B>((args) => fn(...args))

export const chain = <A, B>(fn: (value: A) => PromiseLike<Var<B>> | Var<B>) => (variable: Var<A>): Var<B> => ({
  tag: 'var',
  symbol: Symbol('<anonymous>'),
  create: async (ctx): Promise<Var.Created> => {
    const chainedVar = await ctx.scope.get(variable).then(fn)

    const createdVar = await ctx.scope.load(variable)
    const created = await ctx.scope.load(chainedVar)

    return {
      scope: getLowestScope(ctx.scope, [createdVar.scope, created.scope]),
      dependencies: [variable, chainedVar],
      mount: () => ctx.scope.get(chainedVar).then((value) => ({ value }))
    }
  }
})

export const chainWith = <A extends any[], B>(fn: (...args: A) => Var<B> | PromiseLike<Var<B>>) =>
  chain<A, B>((args) => fn(...args))

export const array = <A>(variables: Var<A>[], strategy: Task.Strategy): Var<A[]> => ({
  tag: 'var',
  symbol: Symbol('<anonymous>'),
  create: async (ctx) => {
    const created = await pipe(variables, Arr.map(Task.taskify(ctx.scope.load)), strategy)

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
          Arr.map(Task.taskify(ctx.scope.get)),
          strategy,
          Task.map((value) => ({ value }))
        )
    }
  }
})

export const all = <A>(variables: Var<A>[]): Var<A[]> => array(variables, Task.all)
export const sequence = <A>(variables: Var<A>[]): Var<A[]> => array(variables, Task.sequence)
export const concurrent = (nb: number) => <A>(variables: Var<A>[]): Var<A[]> => array(variables, Task.concurrent(nb))

export function struct<A extends Dict<Var>>(obj: A): Var.Struct<A>
export function struct(obj: Dict<Var>): Var<Dict>
export function struct(obj: Dict<Var>): Var<Dict> {
  return {
    tag: 'var',
    symbol: Symbol('<anonymous>'),
    create: async (ctx: Context) => {
      const created = await pipe(obj, Dict.map(Task.taskify(ctx.scope.load)), Task.struct(Task.all))

      return {
        scope: getLowestScope(
          ctx.scope,
          pipe(
            created,
            Dict.collect((c) => c.scope)
          )
        ),
        dependencies: pipe(obj, Dict.values),
        mount: () =>
          pipe(
            obj,
            Dict.map(Task.taskify(ctx.scope.get)),
            Task.struct(Task.all),
            Task.map((value) => ({ value }))
          )
      }
    }
  }
}

export function inject(): Var<[]>
export function inject<A>(a: Var<A>): Var<[A]>
export function inject<A, B>(a: Var<A>, b: Var<B>): Var<[A, B]>
export function inject<A, B, C>(a: Var<A>, b: Var<B>, c: Var<C>): Var<[A, B, C]>
export function inject<A, B, C, D>(a: Var<A>, b: Var<B>, c: Var<C>, d: Var<D>): Var<[A, B, C, D]>
export function inject<A, B, C, D, E>(a: Var<A>, b: Var<B>, c: Var<C>, d: Var<D>, e: Var<E>): Var<[A, B, C, D, E]>
export function inject<A, B, C, D, E, F>(
  a: Var<A>,
  b: Var<B>,
  c: Var<C>,
  d: Var<D>,
  e: Var<E>,
  f: Var<F>
): Var<[A, B, C, D, E, F]>
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
  array,
  all,
  sequence,
  concurrent,
  struct,
  inject,
  map,
  mapWith,
  chain,
  chainWith,
  closeWith,
  abstract,
  named
}
