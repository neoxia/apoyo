import type { Injectable } from './types'

import { create } from './core'

export const lazy = <A>(fn: () => PromiseLike<Injectable<A>> | Injectable<A>): Injectable<A> =>
  create(async (ctx) => Promise.resolve().then(fn).then(ctx.scope.load))
