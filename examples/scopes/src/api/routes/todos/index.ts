import { Router } from 'express'

import { Injectable } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'

import { ListTodos } from './list'

export const TodoRoutes = pipe(
  Injectable.struct({
    list: ListTodos
  }),
  Injectable.map(({ list }) => {
    const route = Router({
      mergeParams: true
    })

    route.get('/', list)

    return route
  })
)
