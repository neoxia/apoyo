import { Router } from 'express'

import { Injectable } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'

import { HealthRoutes } from './health'
import { TodoRoutes } from './todos'

export const Routes = pipe(
  Injectable.struct({
    health: HealthRoutes,
    todos: TodoRoutes
  }),
  Injectable.map((routes) => {
    const route = Router()
    route.use('/health', routes.health)
    route.use('/todos', routes.todos)
    return route
  })
)
