import { Resource } from '../resources'
import { INJECTABLE_ABSTRACT } from './symbols'
import { override, proxify } from './core'
import { Injectable } from './types'
import { thunk } from './constants'

export const isAbstract = <T>(variable: Injectable<T>): variable is Injectable.Abstract<T> =>
  (variable as Injectable.Abstract<T>)[INJECTABLE_ABSTRACT] === true

export const abstract = <T>(description: string): Injectable.Abstract<T> =>
  proxify({
    ...thunk<T>(() => {
      throw new Error(`cannot mount abstract variable ${description}`)
    }),
    [INJECTABLE_ABSTRACT]: true
  })

export const defaultVar = <U, T extends U>(def: Injectable<T>) => (variable: Injectable.Abstract<U>): Injectable<U> =>
  override(variable, async (ctx) => {
    const loaded = await ctx.scope.load(def)
    return {
      scope: loaded.scope,
      mount: () => ctx.scope.get<T>(def).then(Resource.of)
    }
  })
