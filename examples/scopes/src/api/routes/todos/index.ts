import { Router } from 'express'

import { Var } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'

import { ListTodos } from './list'

export const TodoRoutes = pipe(
  Var.struct({
    list: ListTodos
  }),
  Var.map(({ list }) => {
    const route = Router({
      mergeParams: true
    })

    route.get('/', list)

    return route
  })
)
