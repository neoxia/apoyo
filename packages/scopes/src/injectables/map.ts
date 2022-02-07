import { pipe } from '@apoyo/std'

import { Resource } from '../resources'
import { factory } from './core'
import { resource } from './resource'
import { Injectable } from './types'

export const map = <A, B>(fn: (value: A) => B | PromiseLike<B>) => (variable: Injectable<A>) =>
  factory(
    fn,
    pipe(
      variable,
      resource((v) => Promise.resolve(v).then(fn).then(Resource.of))
    )
  )

export const mapArgs = <A extends any[], B>(fn: (...args: A) => B | PromiseLike<B>) => (variable: Injectable<A>) =>
  factory(
    fn,
    pipe(
      variable,
      map((args) => fn(...args))
    )
  )
