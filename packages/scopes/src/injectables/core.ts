import type { Context } from '../types'

import { Injectable } from './types'
import { Ref } from '../refs'
import { INJECTABLE_CREATE, INJECTABLE_FACTORY, INJECTABLE_REF } from './symbols'
import { pipe } from '@apoyo/std'
import { map } from './map'

export const isInjectable = (value: any): value is Injectable<any> =>
  (value as Injectable)[INJECTABLE_REF] !== undefined

export const getReference = (variable: Injectable) => variable[INJECTABLE_REF]
export const getFactory = <Fun>(variable: Injectable.Factory<any, Fun>) => variable[INJECTABLE_FACTORY]
export const getLoader = <T>(variable: Injectable<T>) => variable[INJECTABLE_CREATE]

export function proxify<T, Fun>(internal: Injectable.Factory<T, Fun>): Injectable.Factory<T, Fun>
export function proxify<T>(internal: Injectable.Abstract<T>): Injectable.Abstract<T>
export function proxify<T>(internal: Injectable.Value<T>): Injectable<T>
export function proxify<T>(internal: Injectable.Value<T>): Injectable<T> {
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

export const create = <T>(fn: (ctx: Context) => PromiseLike<Injectable.Loader<T>>): Injectable<T> =>
  proxify({
    [INJECTABLE_REF]: Ref.create(),
    [INJECTABLE_CREATE]: fn
  })

export const override = <T>(
  variable: Injectable<T>,
  fn: (ctx: Context) => PromiseLike<Injectable.Loader<T>>
): Injectable<T> =>
  proxify({
    [INJECTABLE_REF]: variable[INJECTABLE_REF],
    [INJECTABLE_CREATE]: fn
  })

export const factory = <T, Fun>(factory: Fun, variable: Injectable<T>): Injectable.Factory<T, Fun> =>
  proxify({
    ...variable,
    [INJECTABLE_FACTORY]: factory
  })
