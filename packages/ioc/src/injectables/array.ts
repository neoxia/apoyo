import { Tuple } from '../types'
import { create } from './create'

import type { Injectable } from './injectable'

export const array = <A>(deps: Injectable<A>[]): Injectable<A[]> => {
  return create(async (container) => {
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
