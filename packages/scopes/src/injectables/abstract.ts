import { Resource } from '../resources'
import { INJECTABLE_ABSTRACT } from './symbols'
import { override } from './core'
import { Injectable } from './types'
import { define } from './define'

export const isAbstract = <T>(variable: Injectable<T>): variable is Injectable.Abstract<T> =>
  (variable as Injectable.Abstract<T>)[INJECTABLE_ABSTRACT] === true

export function abstract<T>(description: string): Injectable.Abstract<T>
export function abstract<T>(description: string, def: Injectable<T>): Injectable<T>
export function abstract<T>(description: string, def?: Injectable<T>): Injectable<T> {
  const variable: Injectable.Abstract<T> = {
    ...define<T>(() => {
      throw new Error(`cannot mount abstract variable ${description}`)
    }),
    [INJECTABLE_ABSTRACT]: true
  }
  if (def) {
    return override(variable, async (ctx) => {
      const loaded = await ctx.scope.load(def)
      return {
        scope: loaded.scope,
        mount: () => ctx.scope.get<T>(def).then(Resource.of)
      }
    })
  }
  return variable
}
