import type { Context } from '../types'

import { Injectable } from './types'
import { Ref } from '../refs'
import { INJECTABLE_CREATE, INJECTABLE_FACTORY, INJECTABLE_REF } from './symbols'

export const isInjectable = (value: any): value is Injectable<any> =>
  (value as Injectable)[INJECTABLE_REF] !== undefined

export const getReference = (variable: Injectable) => variable[INJECTABLE_REF]
export const getFactory = <Fun>(variable: Injectable.Factory<any, Fun>) => variable[INJECTABLE_FACTORY]
export const getLoader = <T>(variable: Injectable<T>) => variable[INJECTABLE_CREATE]

export const create = <T>(fn: (ctx: Context) => PromiseLike<Injectable.Loader<T>>): Injectable<T> => ({
  [INJECTABLE_REF]: Ref.create(),
  [INJECTABLE_CREATE]: fn
})

export const override = <T>(
  variable: Injectable<T>,
  fn: (ctx: Context) => PromiseLike<Injectable.Loader<T>>
): Injectable<T> => ({
  [INJECTABLE_REF]: variable[INJECTABLE_REF],
  [INJECTABLE_CREATE]: fn
})

export const factory = <T, Fun>(factory: Fun, variable: Injectable<T>): Injectable.Factory<T, Fun> => ({
  ...variable,
  [INJECTABLE_FACTORY]: factory
})
