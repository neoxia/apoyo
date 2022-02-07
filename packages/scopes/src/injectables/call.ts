import { pipe } from '@apoyo/std'
import { Injectable } from './types'
import { tuple } from './array'
import { mapArgs } from './map'

export const call = <A, B>(variableFn: Injectable<(value: A) => B | PromiseLike<B>>) => (variable: Injectable<A>) =>
  pipe(
    tuple(variable, variableFn),
    mapArgs((value, fn) => fn(value))
  )

export const callArgs = <A extends any[], B>(variableFn: Injectable<(...args: A) => B | PromiseLike<B>>) => (
  variable: Injectable<A>
) =>
  pipe(
    tuple(variable, variableFn),
    mapArgs((args, fn) => fn(...args))
  )
