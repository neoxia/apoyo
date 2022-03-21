import { Injectable } from '@apoyo/scopes'

import { Todo } from '../../models/todo.model'
import { JsonPlaceholder } from '../jsonplaceholder'

interface TodoListOptions {
  page?: number
  perPage?: number
}

const $findAll = Injectable.define(JsonPlaceholder.$http, (http) => {
  return (options: TodoListOptions = {}) =>
    http.get<Todo[]>(`/todos`, {
      params: {
        _page: options.page || 1,
        _perPage: options.perPage || 10
      }
    })
})

const $findById = Injectable.define(JsonPlaceholder.$http, (http) => {
  return (id: string) => http.get<Todo>(`/todos/${id}`)
})

export const TodoRepository = {
  $findAll,
  $findById
}
