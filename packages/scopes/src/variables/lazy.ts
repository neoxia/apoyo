import type { Var } from './types'

import { create } from './core'

export const lazy = <A>(fn: () => PromiseLike<Var<A>> | Var<A>): Var<A> =>
  create(async (ctx) => Promise.resolve().then(fn).then(ctx.scope.load))
