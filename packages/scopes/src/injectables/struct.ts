import { Dict, pipe, Task } from '@apoyo/std'

import { Resource } from '../resources'
import { Scope } from '../scopes'
import { Context } from '../types'
import { create } from './core'
import { Injectable } from './types'

export function struct<A extends Dict<Injectable>>(obj: A): Injectable.Struct<A>
export function struct(obj: Dict<Injectable>): Injectable<Dict>
export function struct(obj: Dict<Injectable>): Injectable<Dict> {
  return {
    ...create<Dict>(
      async (ctx: Context): Promise<Injectable.Loader> => {
        const created = await pipe(obj, Dict.map(Task.taskify((v) => ctx.scope.load(v))), Task.struct(Task.all))
        const scope = Scope.getLowestScope(
          ctx.scope,
          pipe(
            created,
            Dict.collect((c) => c.scope)
          )
        )
        const mount = () =>
          pipe(obj, Dict.map(Task.taskify((v) => ctx.scope.get(v))), Task.struct(Task.all), Task.map(Resource.of))

        return {
          scope,
          mount
        }
      }
    ),
    ...obj
  }
}
