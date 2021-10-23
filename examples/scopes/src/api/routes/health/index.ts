import { Var } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'

import { Router } from 'express'

export const HealthRoutes = pipe(
  Var.inject(),
  Var.map(() => {
    const route = Router({
      mergeParams: true
    })

    route.get('/', (_req, res) => {
      res.json({
        status: 'OK'
      })
    })

    return route
  })
)
