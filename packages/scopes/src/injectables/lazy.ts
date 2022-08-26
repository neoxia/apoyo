import { create } from './create'

import type { Injectable } from './injectable'

export const lazy = <A>(fn: () => PromiseLike<Injectable<A>> | Injectable<A>): Injectable<A> =>
  create(async (container) => container.get(await fn()))
