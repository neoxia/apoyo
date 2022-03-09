import { Http, Request, Route } from '@apoyo/express'
import { TextDecoder } from '@apoyo/decoders'
import { TodoService } from '@/app/services/todo.service'

const $todoId = Request.param('id', TextDecoder.string)

export const todoById = Request.reply($todoId, TodoService.findById, async (id, findById) => {
  const todo = await findById(id)
  if (!todo) {
    throw Http.NotFound()
  }
  // FIXME: @apoyo/http Json type not working correctly
  return Http.Ok(todo as any)
})

export const todos = Request.reply(TodoService.findAll, async (findAll) => {
  const todos = await findAll()
  // FIXME: @apoyo/http Json type not working correctly
  return Http.Ok(todos as any)
})

export const todoRoutes = Route.group('/todos', {
  children: [Route.get('/', todos), Route.get('/:id', todoById)]
})
