import { TodoRepository } from '@/repositories/todos'
import { Injectable } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'
import { Request, Response } from 'express'

export const ListTodos = pipe(
  Injectable.struct({
    findAll: TodoRepository.findAll
  }),
  Injectable.map(({ findAll }) => async (_req: Request, res: Response) => {
    try {
      const todos = await findAll()
      res.json(todos)
    } catch (err) {
      res.status(500).json({
        message: 'Internal error'
      })
    }
  })
)
