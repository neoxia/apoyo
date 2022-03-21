import { Injectable } from '@apoyo/scopes'

import { Todo } from '../models/todo.model'
import { TodoRepository } from '../infra/repositories/todo.repository'

export const $findAll = Injectable.define(TodoRepository.$findAll, (findAll) => {
  return (): Promise<Todo[]> => findAll()
})

export const $findById = Injectable.define(TodoRepository.$findById, (findById) => {
  return (id: string): Promise<Todo | undefined> => findById(id)
})

export const TodoService = {
  $findAll,
  $findById
}
