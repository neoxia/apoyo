import { Route } from '@apoyo/express'
import { getTodo, listTodos } from './controllers/todo.controller'

export const todoRoutes = Route.group('/todos', {
  children: [
    // Routes
    Route.get('/', listTodos),
    Route.get('/:id', getTodo)
  ]
})
