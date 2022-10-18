import { Injectable } from '../injectables'
import { Tuple } from '../types'
import { create } from './create'
import { Implementation } from './implementation'

export type Type<T, Args extends Tuple> = { new (...args: Args): T }

export function fromClass<T, Args extends Tuple>(
  type: Type<T, Args>,
  deps: Injectable.ArrayOf<Args>
): Implementation<Args, T> {
  // TODO: find a way to remove any
  return create(deps, (...args) => new type(...(args as any)))
}
