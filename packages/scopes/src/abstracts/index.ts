import { Err } from '@apoyo/std'

import type { Container } from '../container'
import { Injectable } from '../injectables'

export interface Abstract<T> extends Injectable<T> {
  readonly name: string
  readonly defaultValue?: Injectable<T>
}

const _execute = <T>(container: Container, name: string, defaultValue?: Injectable<T>) => {
  if (defaultValue) {
    return container.get(defaultValue)
  }
  throw Err.of(`Abstract ${JSON.stringify(name)} has not been implemented`, {
    name: 'InjectionError',
    code: 'NotImplemented'
  })
}

export const create = <T>(name: string, defaultValue?: Injectable<T>): Abstract<T> => {
  return Object.assign(
    Injectable.create((container) => _execute(container, name, defaultValue)),
    {
      name,
      defaultValue
    }
  )
}

export const Abstract = {
  create
}
