import { Tuple } from '../types'
import { Injectable } from './injectable'

export const array = <A>(deps: Injectable<A>[]): Injectable<A[]> => {
  return new Injectable(async (container) => {
    const args: A[] = []
    for (const dep of deps) {
      args.push(await container.get(dep))
    }
    return args
  })
}

export function tuple<Deps extends Tuple>(deps: Injectable.ArrayOf<Deps>): Injectable<Deps>
export function tuple(deps: Injectable[]): Injectable<any[]> {
  return array(deps)
}
