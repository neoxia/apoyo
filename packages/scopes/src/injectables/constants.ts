import { pipe, Prom } from '@apoyo/std'
import { Resource } from '../resources'

import { Injectable } from './types'
import { create } from './core'

export const thunk = <T>(thunk: () => T | PromiseLike<T>): Injectable<T> =>
  create(async (ctx) => ({
    scope: ctx.scope.root,
    mount: () => pipe(Prom.thunk(thunk), Prom.map(Resource.of))
  }))

export const of = <T>(value: T): Injectable<T> => thunk(() => value)

export const empty = of<void>(undefined)
