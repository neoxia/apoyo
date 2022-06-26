import { Injectable } from './injectable'

export const lazy = <A>(fn: () => PromiseLike<Injectable<A>> | Injectable<A>): Injectable<A> =>
  new Injectable(async (container) => container.get(await fn()))
