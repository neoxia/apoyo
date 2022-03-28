import { Http, Request } from '@apoyo/express'
import { TextDecoder } from '@apoyo/decoders'

import { $listTodos } from '@/app/features/todos/list-todos'
import { $getTodo } from '@/app/features/todos/get-todo'

export const listTodos = Request.reply($listTodos, async (listTodos) => {
  const todos = await listTodos()
  return Http.Ok(todos)
})

const $todoId = Request.param('id', TextDecoder.uuid)

export const getTodo = Request.reply($todoId, $getTodo, async (id, getTodo) => {
  const todo = await getTodo(id)
  if (!todo) {
    throw Http.NotFound()
  }
  return Http.Ok(todo)
})
