import { Arr, Dict, Option, pipe, Prom, Task } from '@apoyo/std'
import { Ref } from './Ref'
import { Scope } from './Scope'
import { Context } from './types'
import { getInternalScope, getRoot } from './utils'

export const enum VarTags {
  VAR = 'var'
}

export type Var<T = any> = {
  symbol: Ref
  tag: VarTags.VAR
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
    mount: () => PromiseLike<{
      value: T
      unmount?: Unmount
    }>
  }
}

export const getRootScope = (scope: Scope) => getInternalScope(scope).root

export const getLowestScope = (scope: Scope, scopes: Scope[]) => {
  const internal = getInternalScope(scope)
  return pipe(scopes, Arr.min(internal.ord), Option.get(internal.root))
}

export const create = <T>(fn: (ctx: Context) => PromiseLike<Var.Created<T>>) => ({
  tag: VarTags.VAR,
  symbol: Ref.create(),
  create: fn
})

export const thunk = <T>(thunk: () => T | PromiseLike<T>): Var<T> =>
  create(async (ctx) => ({
    scope: getRoot(ctx.scope),
    mount: () =>
      pipe(
        Prom.thunk(thunk),
        Prom.map((value) => ({ value }))
      )
  }))

export const of = <T>(value: T): Var<T> => thunk(() => value)

export const lazy = <A>(fn: () => PromiseLike<Var<A>> | Var<A>): Var<A> =>
  create(async (ctx) => Promise.resolve().then(fn).then(ctx.scope.load))

export const closeWith = <A>(fn: (value: A) => PromiseLike<void> | void) => (variable: Var<A>): Var<A> =>
  create(async (ctx) => {
    const created = await ctx.scope.load(variable)

    return {
      scope: created.scope,
      mount: () =>
        ctx.scope.get(variable).then((value) => ({
          value,
          unmount: () => fn(value)
        }))
    }
  })

export const map = <A, B>(fn: (value: A) => B | PromiseLike<B>) => (variable: Var<A>): Var<B> => ({
  tag: VarTags.VAR,
  symbol: Ref.create(),
  create: async (ctx): Promise<Var.Created> => {
    const created = await ctx.scope.load(variable)

    return {
      scope: created.scope,
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
  tag: VarTags.VAR,
  symbol: Ref.create(),
  create: async (ctx): Promise<Var.Created> => {
    const chainedVar = await ctx.scope.get(variable).then(fn)
    const createdVar = await ctx.scope.load(chainedVar)
    const created = await ctx.scope.load(variable)

    return {
      scope: getLowestScope(ctx.scope, [created.scope, createdVar.scope]),
      mount: () => ctx.scope.get(chainedVar).then((value) => ({ value }))
    }
  }
})

export const chainWith = <A extends any[], B>(fn: (...args: A) => Var<B> | PromiseLike<Var<B>>) =>
  chain<A, B>((args) => fn(...args))

export const array = <A>(variables: Var<A>[], strategy: Task.Strategy): Var<A[]> =>
  create(
    async (ctx): Promise<Var.Created> => {
      const created = await pipe(variables, Arr.map(Task.taskify(ctx.scope.load)), strategy)
      const scope = getLowestScope(
        ctx.scope,
        pipe(
          created,
          Arr.map((c) => c.scope)
        )
      )
      const mount = () =>
        pipe(
          variables,
          Arr.map(Task.taskify(ctx.scope.get)),
          strategy,
          Task.map((value) => ({ value }))
        )

      return {
        scope,
        mount
      }
    }
  )

export const all = <A>(variables: Var<A>[]): Var<A[]> => array(variables, Task.all)
export const sequence = <A>(variables: Var<A>[]): Var<A[]> => array(variables, Task.sequence)
export const concurrent = (nb: number) => <A>(variables: Var<A>[]): Var<A[]> => array(variables, Task.concurrent(nb))

export function struct<A extends Dict<Var>>(obj: A): Var.Struct<A>
export function struct(obj: Dict<Var>): Var<Dict>
export function struct(obj: Dict<Var>): Var<Dict> {
  return create(
    async (ctx: Context): Promise<Var.Created> => {
      const created = await pipe(obj, Dict.map(Task.taskify(ctx.scope.load)), Task.struct(Task.all))
      const scope = getLowestScope(
        ctx.scope,
        pipe(
          created,
          Dict.collect((c) => c.scope)
        )
      )
      const mount = () =>
        pipe(
          obj,
          Dict.map(Task.taskify(ctx.scope.get)),
          Task.struct(Task.all),
          Task.map((value) => ({ value }))
        )

      return {
        scope,
        mount
      }
    }
  )
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
  thunk<T>(() => {
    throw new Error(`cannot mount abstract variable ${description}`)
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
  abstract
}
