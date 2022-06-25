import { Err } from '@apoyo/std'
import { Injectable } from './injectable'

export class Abstract<T> extends Injectable<T> {
  constructor(public readonly name: string) {
    super(() => {
      throw Err.of(`Abstract ${JSON.stringify(name)} has not been implemented`, {
        name: 'InjectionError',
        code: 'NotImplemented'
      })
    })
  }
}

export const abstract = <T>(name: string) => new Abstract<T>(name)
