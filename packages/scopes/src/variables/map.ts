import { pipe } from '@apoyo/std'

import { Resource } from '../resources'
import { factory, resource, Var } from './core'

export const map = <A, B>(fn: (value: A) => B | PromiseLike<B>) => (variable: Var<A>) =>
  factory(
    fn,
    pipe(
      variable,
      resource((v) => Promise.resolve(v).then(fn).then(Resource.of))
    )
  )

export const mapArgs = <A extends any[], B>(fn: (...args: A) => B | PromiseLike<B>) => (variable: Var<A>) =>
  factory(
    fn,
    pipe(
      variable,
      map((args) => fn(...args))
    )
  )
