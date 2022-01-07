import { Arr, pipe, Task } from '@apoyo/std'

import { Resource } from '../resources'
import { Scope } from '../scopes'
import { create, Var } from './core'

export const array = <A>(variables: Var<A>[], strategy: Task.Strategy): Var<A[]> =>
  create(
    async (ctx): Promise<Var.Loader> => {
      const created = await pipe(variables, Arr.map(Task.taskify(ctx.scope.load)), strategy)
      const scope = Scope.getLowestScope(
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
