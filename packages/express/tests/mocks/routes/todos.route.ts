import { IntegerDecoder } from '@apoyo/decoders'

import { Http, Request, Route } from '../../../src'
import { createTodoSchema, updateTodoSchema, paginateTodoSchema } from './todos.dto'

// Request variables
const $todoId = Request.param('id', IntegerDecoder.positive)
const $todoPaginationParams = Request.query(paginateTodoSchema)
const $todoCreateBody = Request.body(createTodoSchema)
const $todoEditBody = Request.body(updateTodoSchema)

// Request handlers
export const listTodos = Request.reply($todoPaginationParams, (_pagination) => {
  return Http.Ok([])
})

export const getTodo = Request.reply($todoId, (_id) => {
  return Http.NotFound()
})

export const createTodo = Request.reply($todoCreateBody, (_dto) => {
  return Http.Created({})
})

export const patchTodo = Request.reply($todoId, $todoEditBody, (_id, _dto) => {
  return Http.Ok({})
})

export const removeTodo = Request.reply($todoId, (_id) => {
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
