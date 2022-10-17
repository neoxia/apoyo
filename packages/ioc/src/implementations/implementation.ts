import { Tuple, Fn } from '../types'
import { Injectable } from '../injectables'
import { create } from './create'
import { fromClass } from './from-class'
import { Resource } from '../resources'

export interface Implementation<Args extends Tuple, T> extends Injectable<Implementation.ReturnType<T>> {
  readonly inject?: Injectable.ArrayOf<Args>
  readonly factory: Fn<Args, T>
}

export namespace Implementation {
  export interface Options<Deps extends Tuple, T> {
    inject?: Injectable.ArrayOf<Deps>
    factory: Fn<Deps, T>
  }

  export type ReturnType<T> = T extends PromiseLike<infer I>
    ? ReturnType<I>
    : T extends Injectable<infer I>
    ? ReturnType<I>
    : T extends Resource<infer I>
    ? I
    : T
}

export const Implementation = {
  create,
  fromClass
}
