import { JsonPlaceholderAPI } from '@/services/datasources'
import { Var } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'

export interface Todo {
  userId: number
  id: number
  title: string
  completed: boolean
}

export const FindTodos = pipe(
  JsonPlaceholderAPI,
  Var.map((api) => () => api.get<Todo[]>(`/todos`).then((res) => res.data))
)

export const TodoRepository = {
  FindTodos
}
