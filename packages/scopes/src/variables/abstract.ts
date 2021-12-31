import { Resource } from '../Resource'
import { ABSTRACT_SYMBOL } from './constants'
import { override, thunk } from './core'
import { Var } from './core'

export const isAbstract = <T>(variable: Var<T>): variable is Var.Abstract<T> =>
  (variable as Var.Abstract<T>)[ABSTRACT_SYMBOL] === true

export const abstract = <T>(description: string): Var.Abstract<T> => ({
  ...thunk<T>(() => {
    throw new Error(`cannot mount abstract variable ${description}`)
  }),
  [ABSTRACT_SYMBOL]: true
})

export const defaultVar = <U, T extends U>(def: Var<T>) => (variable: Var.Abstract<U>): Var<U> =>
  override(variable, async (ctx) => {
    const loaded = await ctx.scope.load(def)
    return {
      scope: loaded.scope,
      mount: () => ctx.scope.get<T>(def).then(Resource.of)
    }
  })
