import { Resource } from '../resources'
import { MaybePromise } from '../types'
import { sequence } from './array'
import { create, factory } from './core'
import { Injectable } from './types'

type InjectableType<T> = T extends Injectable<infer I> ? I : never
type InjectableTypes<Tuple extends [...any[]]> = {
  [Index in keyof Tuple]: InjectableType<Tuple[Index]>
} & { length: Tuple['length'] }

type DefineFactory<T, Deps extends Injectable[]> = (...args: InjectableTypes<Deps>) => T
type DefineArgs<T, Deps extends Injectable[]> = [...Deps, DefineFactory<T, Deps>]

export function define<A>(fn: () => Promise<A>): Injectable.Factory<A, () => Promise<A>>
export function define<A>(fn: () => Resource<A>): Injectable.Factory<A, () => Resource<A>>
export function define<A>(fn: () => A): Injectable.Factory<A, () => A>
export function define<T, Deps extends Injectable[]>(
  ...args: DefineArgs<Promise<T>, Deps>
): Injectable.Factory<T, DefineFactory<Promise<T>, Deps>>
export function define<T, Deps extends Injectable[]>(
  ...args: DefineArgs<Resource<T>, Deps>
): Injectable.Factory<T, DefineFactory<Resource<T>, Deps>>
export function define<T, Deps extends Injectable[]>(
  ...args: DefineArgs<T, Deps>
): Injectable.Factory<T, DefineFactory<T, Deps>>
export function define(...args: any[]) {
  const fn: (...args: any[]) => MaybePromise<any> = args.pop()
  const deps = sequence(args)

  return factory(
    fn,
    create(async (ctx) => {
      const created = await ctx.scope.load(deps)

      return {
        scope: created.scope,
        mount: async () => {
          const resolved = await ctx.scope.get(deps)
          const value = await fn(...resolved)
          return value instanceof Resource ? value : Resource.of(value)
        }
      }
    })
  )
}
