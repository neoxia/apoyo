import { Route } from '@apoyo/express'
import { healthRoutes } from './health.controller'
import { todoRoutes } from './todo.controller'

export const routes = Route.group({
  children: [healthRoutes, todoRoutes]
})
