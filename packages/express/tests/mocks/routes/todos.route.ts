import { Http, Request, Route } from '../../../src'

// Request handlers
export const listTodos = Request.reply(() => {
  return Http.Ok([])
})

export const getTodo = Request.reply(() => {
  return Http.NotFound()
})

export const createTodo = Request.reply(() => {
  return Http.Created({})
})

export const patchTodo = Request.reply(() => {
  return Http.Ok({})
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
