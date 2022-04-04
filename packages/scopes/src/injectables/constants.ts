import { Injectable } from './types'
import { define } from './define'

export const of = <T>(value: T): Injectable<T> => define(() => value)

export const empty = of<void>(undefined)
