import { Arr, pipe, Task } from '@apoyo/std'

import { Resource } from '../resources'
import { Scope } from '../scopes'
import { create } from './core'
import { Injectable } from './types'

export const array = <A>(variables: Injectable<A>[], strategy: Task.Strategy): Injectable<A[]> =>
  create(
    async (ctx): Promise<Injectable.Loader> => {
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

export const all = <A>(variables: Injectable<A>[]): Injectable<A[]> => array(variables, Task.all)
export const sequence = <A>(variables: Injectable<A>[]): Injectable<A[]> => array(variables, Task.sequence)
export const concurrent = (nb: number) => <A>(variables: Injectable<A>[]): Injectable<A[]> =>
  array(variables, Task.concurrent(nb))

export function tuple(): Injectable<[]>
export function tuple<A>(a: Injectable<A>): Injectable<[A]>
export function tuple<A, B>(a: Injectable<A>, b: Injectable<B>): Injectable<[A, B]>
export function tuple<A, B, C>(a: Injectable<A>, b: Injectable<B>, c: Injectable<C>): Injectable<[A, B, C]>
export function tuple<A, B, C, D>(
  a: Injectable<A>,
  b: Injectable<B>,
  c: Injectable<C>,
  d: Injectable<D>
): Injectable<[A, B, C, D]>
export function tuple<A, B, C, D, E>(
  a: Injectable<A>,
  b: Injectable<B>,
  c: Injectable<C>,
  d: Injectable<D>,
  e: Injectable<E>
): Injectable<[A, B, C, D, E]>
export function tuple<A, B, C, D, E, F>(
  a: Injectable<A>,
  b: Injectable<B>,
  c: Injectable<C>,
  d: Injectable<D>,
  e: Injectable<E>,
  f: Injectable<F>
): Injectable<[A, B, C, D, E, F]>
export function tuple(...vars: Injectable[]): Injectable<any[]> {
  return all(vars)
}
