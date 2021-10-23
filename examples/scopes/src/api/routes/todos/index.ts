import { Router } from 'express'

import { Req } from '@/api/utils/request'
import { Scope, Var } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'

import { ListTodos } from './list'

export const TodoRoutes = pipe(
  Var.inject(Scope.spawner()),
  Var.mapWith((spawner) => {
    const route = Router({
      mergeParams: true
    })

    route.get('/', async (req, res) => {
      try {
        const todos = await pipe(spawner.spawn(), Scope.bind(Req, req), Scope.run(ListTodos))
        res.json(todos)
      } catch (err) {
        res.status(500).json({
          message: 'Internal error'
        })
      }
    })

    return route
  })
)
