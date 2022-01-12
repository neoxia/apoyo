import { Resource } from '../resources'
import { VAR_ABSTRACT } from './symbols'
import { override, proxify } from './core'
import { Var } from './types'
import { thunk } from './constants'

export const isAbstract = <T>(variable: Var<T>): variable is Var.Abstract<T> =>
  (variable as Var.Abstract<T>)[VAR_ABSTRACT] === true

export const abstract = <T>(description: string): Var.Abstract<T> =>
  proxify({
    ...thunk<T>(() => {
      throw new Error(`cannot mount abstract variable ${description}`)
    }),
    [VAR_ABSTRACT]: true
  }) as any

export const defaultVar = <U, T extends U>(def: Var<T>) => (variable: Var.Abstract<U>): Var<U> =>
  override(variable, async (ctx) => {
    const loaded = await ctx.scope.load(def)
    return {
      scope: loaded.scope,
      mount: () => ctx.scope.get<T>(def).then(Resource.of)
    }
  })
