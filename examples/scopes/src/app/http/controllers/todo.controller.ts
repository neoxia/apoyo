import { Http, Request, Route } from '@apoyo/express'
import { TextDecoder } from '@apoyo/decoders'
import { TodoService } from '@/app/services/todo.service'

const $todoId = Request.param('id', TextDecoder.uuid)

export const todoById = Request.reply($todoId, TodoService.$findById, async (id, findById) => {
  const todo = await findById(id)
  if (!todo) {
    throw Http.NotFound()
  }
  return Http.Ok(todo)
})

export const todos = Request.reply(TodoService.$findAll, async (findAll) => {
  const todos = await findAll()
  return Http.Ok(todos)
})

export const todoRoutes = Route.group('/todos', {
  children: [Route.get('/', todos), Route.get('/:id', todoById)]
})
