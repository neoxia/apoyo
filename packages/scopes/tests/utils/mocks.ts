import { Injectable } from '../../src'

export const LazyVar = Injectable.thunk(() => {
  return 'lazy'
})
