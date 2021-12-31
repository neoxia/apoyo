import { Dict, pipe, Task } from '@apoyo/std'

import { Resource } from '../Resource'
import { Context } from '../types'
import { create, Var } from './core'
import { getLowestScope } from './utils'

export function struct<A extends Dict<Var>>(obj: A): Var.Struct<A>
export function struct(obj: Dict<Var>): Var<Dict>
export function struct(obj: Dict<Var>): Var<Dict> {
  return create(
    async (ctx: Context): Promise<Var.Loader> => {
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
