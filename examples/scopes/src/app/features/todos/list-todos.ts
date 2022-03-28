import { Todo } from '@/app/models/todo.model'
import { TodoRepository } from '@/app/repositories/todo.repository'
import { Injectable } from '@apoyo/scopes'

export const $listTodos = Injectable.define(TodoRepository.$findAll, (findAll) => {
  return (): Promise<Todo[]> =>
    findAll({
      page: 0,
      perPage: 20
    })
})
