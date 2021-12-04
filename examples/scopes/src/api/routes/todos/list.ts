import { TodoRepository } from '@/repositories/todos'
import { Var } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'
import { Request, Response } from 'express'

export const ListTodos = pipe(
  Var.inject(TodoRepository.FindTodos),
  Var.mapWith((findTodos) => async (_req: Request, res: Response) => {
    try {
      const todos = await findTodos()
      res.json(todos)
    } catch (err) {
      res.status(500).json({
        message: 'Internal error'
      })
    }
  })
)
