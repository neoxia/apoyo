import { Var } from '../../src'

export const LazyVar = Var.thunk(() => {
  return 'lazy'
})
