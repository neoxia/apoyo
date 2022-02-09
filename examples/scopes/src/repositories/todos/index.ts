import { JsonPlaceholderAPI } from '@/services/jsonplaceholder'
import { Injectable } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'

export interface Todo {
  userId: number
  id: number
  title: string
  completed: boolean
}

export const findAll = pipe(
  JsonPlaceholderAPI,
  Injectable.map((api) => () => api.get<Todo[]>(`/todos`).then((res) => res.data))
)

export const TodoRepository = Injectable.struct({
  findAll
})
