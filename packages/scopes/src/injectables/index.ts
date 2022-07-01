import { Injectable } from './injectable'
import * as fns from './functions'

const Fns = fns

declare module '.' {
  namespace Injectable {
    const create: typeof Fns.create
    const define: typeof Fns.define
    const of: typeof Fns.of
    const lazy: typeof Fns.lazy
    const array: typeof Fns.array
    const abstract: typeof Fns.abstract
  }
}

// Side-effects: augment Injectable class to include static functions
Object.assign(Injectable, {
  create: fns.create,
  define: fns.define,
  of: fns.of,
  lazy: fns.lazy,
  array: fns.array,
  abstract: fns.abstract
})

export { Injectable } from './injectable'
export { Abstract } from './abstract'
export { Implementation } from './implementation'
