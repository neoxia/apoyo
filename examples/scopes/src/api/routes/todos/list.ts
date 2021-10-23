import { TodoRepository } from '@/repositories/todos'
import { Var } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'

export const ListTodos = pipe(
  Var.inject(TodoRepository.FindTodos),
  Var.mapWith((findTodos) => findTodos())
)
