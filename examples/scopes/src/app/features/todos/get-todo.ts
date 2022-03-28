import { Todo } from '@/app/models/todo.model'
import { TodoRepository } from '@/app/repositories/todo.repository'
import { Injectable } from '@apoyo/scopes'

export const $getTodo = Injectable.define(TodoRepository.$findById, (findById) => {
  return (id: string): Promise<Todo | undefined> => findById(id)
})
