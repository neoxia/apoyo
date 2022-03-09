import { Injectable } from '@apoyo/scopes'
import { Todo } from '@/app/models/todo.model'
import { JsonPlaceholder } from '@/infra/jsonplaceholder'

export const findAll = Injectable.define(JsonPlaceholder.$axios, (api) => {
  return () => api.get<Todo[]>(`/todos`).then((res) => res.data)
})

export const findById = Injectable.define(JsonPlaceholder.$axios, (api) => {
  return (id: string) => api.get<Todo>(`/todos/${id}`).then((res) => res.data)
})

export const TodoRepository = Injectable.struct({
  findAll,
  findById
})
