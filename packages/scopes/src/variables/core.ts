import type { Context } from '../types'

import { Var } from './types'
import { Ref } from '../refs'
import { VAR_CREATE, VAR_FACTORY, VAR_REF } from './symbols'
import { pipe } from '@apoyo/std'
import { map } from './map'

export const isVar = (value: any): value is Var<any> => (value as Var)[VAR_REF] !== undefined

export const getReference = (variable: Var) => variable[VAR_REF]
export const getFactory = <Fun>(variable: Var.Factory<any, Fun>) => variable[VAR_FACTORY]
export const getLoader = <T>(variable: Var<T>) => variable[VAR_CREATE]

export function proxify<T, Fun>(internal: Var.Factory<T, Fun>): Var.Factory<T, Fun>
export function proxify<T>(internal: Var.Abstract<T>): Var.Abstract<T>
export function proxify<T>(internal: Var.Value<T>): Var<T>
export function proxify<T>(internal: Var.Value<T>): Var<T> {
  const proxy = new Proxy(internal, {
    get(target: any, key) {
      let v = target[key]
      if (v === undefined) {
        v = target[key] = pipe(
          target,
          map((t: any) => t[key])
        )
      }
      return v
    }
  })

  return proxy
}

export const create = <T>(fn: (ctx: Context) => PromiseLike<Var.Loader<T>>): Var<T> =>
  proxify({
    [VAR_REF]: Ref.create(),
    [VAR_CREATE]: fn
  })

export const override = <T>(variable: Var<T>, fn: (ctx: Context) => PromiseLike<Var.Loader<T>>): Var<T> =>
  proxify({
    [VAR_REF]: variable[VAR_REF],
    [VAR_CREATE]: fn
  })

export const factory = <T, Fun>(factory: Fun, variable: Var<T>): Var.Factory<T, Fun> =>
  proxify({
    ...variable,
    [VAR_FACTORY]: factory
  })
