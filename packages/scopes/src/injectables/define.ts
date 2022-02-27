import { Resource } from '../resources'
import { sequence } from './array'
import { create, factory } from './core'
import { Injectable } from './types'

type InjectableType<T> = T extends Injectable<infer I> ? I : never
type InjectableTypes<Tuple extends [...any[]]> = {
  [Index in keyof Tuple]: InjectableType<Tuple[Index]>
} & { length: Tuple['length'] }

type DefineFactory<T, Deps extends Injectable[]> = (...args: InjectableTypes<Deps>) => T
type DefineArgs<T, Deps extends Injectable[]> = [...Deps, DefineFactory<T, Deps>]

export function define<T>(fn: () => Promise<Resource<T>>): Injectable.Factory<T, () => Promise<Resource<T>>>
export function define<T>(fn: () => Promise<T>): Injectable.Factory<T, () => Promise<T>>
export function define<T>(fn: () => Resource<T>): Injectable.Factory<T, () => Resource<T>>
export function define<T>(fn: () => T): Injectable.Factory<T, () => T>
export function define<T, Deps extends Injectable[]>(
  ...args: DefineArgs<Promise<Resource<T>>, Deps>
): Injectable.Factory<T, DefineFactory<Promise<Resource<T>>, Deps>>
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
  const fn: (...args: any[]) => any = args.pop()
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
