import { Var } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'

import { Router } from 'express'

export const TodoRoutes = pipe(
  Var.inject(),
  Var.map(() => {
    const route = Router({
      mergeParams: true
    })

    route.get('/', (_req, res) => {
      res.json([
        {
          id: 1,
          title: 'Eat breakfast',
          done: false
        },
        {
          id: 2,
          title: 'Go to work',
          done: false
        }
      ])
    })

    return route
  })
)
