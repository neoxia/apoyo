import { Http, Request } from '@apoyo/express'
import { TextDecoder } from '@apoyo/decoders'

import { TodoService } from '../../services/todo.service'

export const listTodos = Request.reply(TodoService.$findAll, async (findAll) => {
  const todos = await findAll()
  return Http.Ok(todos)
})

const $todoId = Request.param('id', TextDecoder.uuid)

export const getTodo = Request.reply($todoId, TodoService.$findById, async (id, findById) => {
  const todo = await findById(id)
  if (!todo) {
    throw Http.NotFound()
  }
  return Http.Ok(todo)
})
