import { Container } from '../container'
import { Injectable } from '../injectables'
import { Resource } from '../resources'
import { Fn, Tuple } from '../types'
import { Implementation } from './implementation'

export function create<T>(fn: Fn<[], T>): Implementation<[], T>
export function create<Deps extends Tuple, T>(
  deps: Injectable.ArrayOf<Deps>,
  factory: Fn<Deps, T>
): Implementation<Deps, T>
export function create<Deps extends Tuple, T>(options: Implementation.Options<Deps, T>): Implementation<Deps, T>
export function create(optionsOrDepsOrFactory: any, factory?: any) {
  if (optionsOrDepsOrFactory instanceof Function) {
    return _create({
      factory: optionsOrDepsOrFactory
    })
  }
  if (factory) {
    return _create({
      inject: optionsOrDepsOrFactory,
      factory
    })
  }
  return _create(optionsOrDepsOrFactory)
}

function _create<Deps extends Tuple, T>(options: Implementation.Options<Deps, T>): Implementation<Deps, T> {
  return Object.assign(
    Injectable.create((container) => _initialize<T>(container, options)),
    {
      inject: options.inject,
      factory: options.factory
    }
  )
}

async function _initialize<T>(
  container: Container,
  options: Implementation.Options<unknown[], unknown>
): Promise<Implementation.ReturnType<T>> {
  const res = await _execute<T>(container, options)

  if (Injectable.is(res)) {
    return container.get(res) as any
  }

  if (res instanceof Resource) {
    if (res.unmount) {
      container.beforeClose(res.unmount)
    }
    return res.value
  }

  return res as any
}

async function _execute<T>(container: Container, options: Implementation.Options<unknown[], unknown>): Promise<T> {
  const deps = options.inject ?? []
  const execute = options.factory as (...args: any[]) => T

  if (deps.length === 0) {
    return execute()
  }
  if (deps.length === 1) {
    const resolved = await container.get(deps[0])
    return execute(resolved)
  }
  const args = []
  for (const dep of deps) {
    args.push(await container.get(dep))
  }
  return execute(...args)
}
