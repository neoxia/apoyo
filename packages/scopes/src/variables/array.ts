import { Arr, pipe, Task } from '@apoyo/std'

import { Resource } from '../Resource'
import { create, Var } from './core'
import { getLowestScope } from './utils'

export const array = <A>(variables: Var<A>[], strategy: Task.Strategy): Var<A[]> =>
  create(
    async (ctx): Promise<Var.Loader> => {
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
