import type { Var } from './Var'

export type Resource<T> = {
  value: T
  unmount?: Var.Unmount
}

export const of = <T>(value: T, unmount?: Var.Unmount): Resource<T> => ({
  value,
  unmount
})

export const Resource = {
  of
}
