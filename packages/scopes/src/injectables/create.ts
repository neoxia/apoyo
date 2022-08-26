import type { Injectable } from './injectable'
import type { Container } from '../container'
import { Ref } from '../refs'

export const create = <T>(initialize: (container: Container) => Promise<T>, ref = Ref.create()): Injectable<T> => ({
  initialize,
  ref
})

export const of = <T>(value: T): Injectable<T> => create(async () => value)

export const is = (value: unknown): value is Injectable<unknown> =>
  value &&
  typeof value === 'object' &&
  typeof (value as any).initialize === 'function' &&
  typeof (value as any).ref === 'object'
    ? true
    : false
