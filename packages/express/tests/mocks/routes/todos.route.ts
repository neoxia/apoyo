import { Http, Request, Route } from '../../../src'
import { createTodoSchema, updateTodoSchema } from './todos.dto'

// Request handlers
export const listTodos = Request.reply(() => {
  return Http.Ok([])
})

export const getTodo = Request.reply(() => {
  return Http.NotFound()
})

export const createTodo = Request.reply((req) => {
  const dto = Request.validate(req.body, createTodoSchema, 'Invalid body')
  return Http.Created(dto)
})

export const patchTodo = Request.reply((req) => {
  const dto = Request.validate(req.body, updateTodoSchema, 'Invalid body')
  return Http.Ok(dto)
})

export const removeTodo = Request.reply(() => {
  return Http.NoContent()
})

// Routes
export const todoRoutes = Route.group('/todos', {
  children: [
    Route.get('/', listTodos),
    Route.get('/:id', getTodo),
    Route.post('/', createTodo),
    Route.patch('/:id', patchTodo),
    Route.delete('/:id', removeTodo)
  ]
})
