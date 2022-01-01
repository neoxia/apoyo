import { pipe } from '@apoyo/std'
import { Var } from './core'
import { tuple } from './array'
import { mapArgs } from './map'

export const call = <A, B>(variableFn: Var<(value: A) => B | PromiseLike<B>>) => (variable: Var<A>) =>
  pipe(
    tuple(variable, variableFn),
    mapArgs((value, fn) => fn(value))
  )

export const callArgs = <A extends any[], B>(variableFn: Var<(...args: A) => B | PromiseLike<B>>) => (
  variable: Var<A>
) =>
  pipe(
    tuple(variable, variableFn),
    mapArgs((args, fn) => fn(...args))
  )
