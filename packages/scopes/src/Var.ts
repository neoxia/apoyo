import { Arr, Dict, Option, pipe, Prom, Task } from '@apoyo/std'
import { Ref } from './Ref'
import { Resource } from './Resource'
import { Scope } from './Scope'
import { Context } from './types'
import { getInternalScope, getRoot } from './utils'

export const ABSTRACT_SYMBOL: unique symbol = Symbol('Var.Abstract')

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

  export interface Factory<T, Fun> extends Var<T> {
    factory: Fun
  }

  export interface Abstract<T> extends Var<T> {
    [ABSTRACT_SYMBOL]: boolean
  }

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

export const mapArgs = <A extends any[], B>(fn: (...args: A) => B | PromiseLike<B>) => (variable: Var<A>) =>
  factory(
    fn,
    pipe(
      variable,
      map((args) => fn(...args))
    )
  )

export const chain = <A, B>(fn: (value: A) => PromiseLike<Var<B>> | Var<B>) => (variable: Var<A>) =>
  factory(
    fn,
    create<B>(
      async (ctx): Promise<Var.Created> => {
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

export const chainArgs = <A extends any[], B>(fn: (...args: A) => Var<B> | PromiseLike<Var<B>>) => (variable: Var<A>) =>
  factory(
    fn,
    pipe(
      variable,
      chain((args) => fn(...args))
    )
  )

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
      const mount = () => pipe(variables, Arr.map(Task.taskify(ctx.scope.get)), strategy, Task.map(Resource.of))

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
      const mount = () => pipe(obj, Dict.map(Task.taskify(ctx.scope.get)), Task.struct(Task.all), Task.map(Resource.of))

      return {
        scope,
        mount
      }
    }
  )
}

export function tuple(): Var<[]>
export function tuple<A>(a: Var<A>): Var<[A]>
export function tuple<A, B>(a: Var<A>, b: Var<B>): Var<[A, B]>
export function tuple<A, B, C>(a: Var<A>, b: Var<B>, c: Var<C>): Var<[A, B, C]>
export function tuple<A, B, C, D>(a: Var<A>, b: Var<B>, c: Var<C>, d: Var<D>): Var<[A, B, C, D]>
export function tuple<A, B, C, D, E>(a: Var<A>, b: Var<B>, c: Var<C>, d: Var<D>, e: Var<E>): Var<[A, B, C, D, E]>
export function tuple<A, B, C, D, E, F>(
  a: Var<A>,
  b: Var<B>,
  c: Var<C>,
  d: Var<D>,
  e: Var<E>,
  f: Var<F>
): Var<[A, B, C, D, E, F]>
export function tuple(...vars: Var[]): Var<any[]> {
  return all(vars)
}

export const abstract = <T>(description: string): Var.Abstract<T> => ({
  ...thunk<T>(() => {
    throw new Error(`cannot mount abstract variable ${description}`)
  }),
  [ABSTRACT_SYMBOL]: true
})

export const defaultVar = <U, T extends U>(def: Var<T>) => (variable: Var.Abstract<U>): Var.Abstract<U> => ({
  tag: VarTags.VAR,
  symbol: variable.symbol,
  create: async (ctx) => {
    const loaded = await ctx.scope.load(def)
    return {
      scope: loaded.scope,
      mount: () => ctx.scope.get<T>(def).then(Resource.of)
    }
  },
  [ABSTRACT_SYMBOL]: true
})

export const Var = {
  empty,
  thunk,
  of,
  lazy,
  array,
  all,
  sequence,
  concurrent,
  struct,
  tuple,
  resource,
  map,
  mapArgs,
  chain,
  chainArgs,
  abstract,
  default: defaultVar
}
