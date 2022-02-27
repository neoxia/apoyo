import { IntegerDecoder } from '@apoyo/decoders'

import { Http, Request, Route } from '../../../src'
import { TodoCreateDto, TodoEditDto, TodoPaginationDto } from './todos.dto'

// Request variables
const TodoId = Request.param('id', IntegerDecoder.positive)
const TodoPaginationParams = Request.query(TodoPaginationDto)
const TodoCreateBody = Request.body(TodoCreateDto)
const TodoEditBody = Request.body(TodoEditDto)

// Request handlers
export const listTodos = Request.reply(TodoPaginationParams, (_pagination) => {
  return Http.Ok([])
})

export const getTodo = Request.reply(TodoId, (_id) => {
  return Http.NotFound()
})

export const createTodo = Request.reply(TodoCreateBody, (_dto) => {
  return Http.Created({})
})

export const patchTodo = Request.reply(TodoId, TodoEditBody, (_id, _dto) => {
  return Http.Ok({})
})

export const removeTodo = Request.reply(TodoId, (_id) => {
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
