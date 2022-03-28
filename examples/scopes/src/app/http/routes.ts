import { Route } from '@apoyo/express'

import { getHealth } from './controllers/health.controller'
import { getTodo, listTodos } from './controllers/todo.controller'
import { catchAll } from './exception-filters/catch-all'

const healthRoutes = Route.group('/health', {
  children: [Route.get('/', getHealth)]
})

const todoRoutes = Route.group('/todos', {
  children: [
    // Routes
    Route.get('/', listTodos),
    Route.get('/:id', getTodo)
  ]
})

export const routes = Route.group({
  children: [healthRoutes, todoRoutes],
  catch: [catchAll]
})
