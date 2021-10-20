import { Var } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'
import { HealthRoutes } from './health'
import { TodoRoutes } from './todos'

import { Router } from 'express'

export const Routes = pipe(
  Var.struct({
    health: HealthRoutes,
    todos: TodoRoutes
  }),
  Var.map((routes) => {
    const route = Router()
    route.use('/health', routes.health)
    route.use('/todos', routes.todos)
    return route
  })
)
