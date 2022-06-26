import { Err } from '@apoyo/std'
import { Injectable } from './injectable'

export class Abstract<T> extends Injectable<T> {
  constructor(public readonly name: string, public readonly defaultValue?: Injectable<T>) {
    super((container) => {
      if (defaultValue) {
        return container.get(defaultValue)
      }
      throw Err.of(`Abstract ${JSON.stringify(name)} has not been implemented`, {
        name: 'InjectionError',
        code: 'NotImplemented'
      })
    })
  }
}

export const abstract = <T>(name: string, defaultValue?: Injectable<T>) => new Abstract<T>(name, defaultValue)
