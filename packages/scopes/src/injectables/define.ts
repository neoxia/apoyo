import { Container } from '../container'
import { Fn, Tuple } from '../types'
import { Implementation } from './implementation'
import { Injectable } from './injectable'

export const create = <T>(fn: (container: Container) => Promise<T>) => new Injectable(fn)

export function define<T>(fn: Fn<[], T>): Implementation<[], T>
export function define<Deps extends Tuple, T>(
  deps: Injectable.ArrayOf<Deps>,
  factory: Fn<Deps, T>
): Implementation<Deps, T>
export function define<Deps extends Tuple, T>(options: Implementation.Options<Deps, T>): Implementation<Deps, T>
export function define(optionsOrDepsOrFactory: any, factory?: any) {
  if (optionsOrDepsOrFactory instanceof Function) {
    return new Implementation({
      factory: optionsOrDepsOrFactory
    })
  }
  if (factory) {
    return new Implementation({
      inject: optionsOrDepsOrFactory,
      factory
    })
  }
  return new Implementation(optionsOrDepsOrFactory)
}

export const of = <T>(value: T): Injectable<Injectable.ReturnType<T>> => define(() => value)
