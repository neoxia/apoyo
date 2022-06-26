import { Injectable } from './injectable'
import * as fns from './functions'

declare module './injectable' {
  namespace Injectable {
    const create: typeof fns.create
    const define: typeof fns.define
    const of: typeof fns.of
    const lazy: typeof fns.lazy
    const array: typeof fns.array
    const abstract: typeof fns.abstract
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
