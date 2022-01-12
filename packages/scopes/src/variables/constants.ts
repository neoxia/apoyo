import { pipe, Prom } from '@apoyo/std'
import { Resource } from '../resources'

import { Var } from './types'
import { create } from './core'

export const thunk = <T>(thunk: () => T | PromiseLike<T>): Var<T> =>
  create(async (ctx) => ({
    scope: ctx.scope.root,
    mount: () => pipe(Prom.thunk(thunk), Prom.map(Resource.of))
  }))

export const of = <T>(value: T): Var<T> => thunk(() => value)

export const empty = of<void>(undefined)
