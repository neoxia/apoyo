import { Err } from '@apoyo/std'

import { Injectable } from '../injectables'

export interface Abstract<T> extends Injectable<T> {
  readonly name: string
  readonly defaultValue?: Injectable<T>
}

export const create = <T>(name: string, defaultValue?: Injectable<T>): Abstract<T> => {
  return Object.assign(
    Injectable.create((container) => {
      if (defaultValue) {
        return container.get(defaultValue)
      }
      throw Err.of(`Abstract ${JSON.stringify(name)} has not been implemented`, {
        name: 'InjectionError',
        code: 'NotImplemented'
      })
    }),
    {
      name,
      defaultValue
    }
  )
}

export const Abstract = {
  create
}
