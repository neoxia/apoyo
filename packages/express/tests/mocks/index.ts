import express, { Application } from 'express'

import { Injectable } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'

import { ExceptionFilter, Express, Http, Request, Route } from '../../src'
import { AccessException } from './access-exception'

export interface Logger {
  info(msg: string, data?: any): void
  warn(msg: string, data?: any): void
  error(msg: string, data?: any): void
}

export const Logger = pipe(Injectable.abstract<Logger>('Logger'), Injectable.default(Injectable.of(console)))

export const catchByFilters = Request.catchFilters([
  ExceptionFilter.instanceOf(AccessException, (err) =>
    Http.Forbidden({
      message: err.message
    })
  )
])

export const catchAll = Request.catch(Logger, (err, logger) => {
  logger.error('Internal error', err)
  throw err
})

export const todoRoutes = Route.group('/todos', {
  children: [
    Route.get(
      '/',
      Request.reply(() => Http.Ok([]))
    ),
    Route.get(
      '/:id',
      Request.reply(() => {
        throw new Error('Some error')
      })
    ),
    Route.delete(
      '/:id',
      Request.reply(() => {
        return Http.NoContent()
      })
    )
  ]
})

export const routes = Route.group({
  children: [
    Route.get(
      '/health',
      Request.reply(() => Http.Ok('OK'))
    ),
    Route.get(
      '/uncaught-access',
      Request.reply(() => {
        throw new AccessException()
      })
    ),
    Route.group({
      children: [
        Route.get(
          '/caught-access',
          Request.reply(() => {
            throw new AccessException()
          })
        ),
        Route.get(
          '/uncaught-error',
          Request.reply(() => {
            throw new Error()
          })
        )
      ],
      catch: [catchByFilters]
    }),
    todoRoutes
  ],
  catch: [catchAll]
})

export const Config = Injectable.of({
  port: 3000
})

export const Router = Express.createRouter(routes)

export const App = pipe(
  Injectable.struct({
    router: Router
  }),
  Injectable.map(
    ({ router }): Application => {
      const app = express()

      app.use(router)

      return app
    }
  )
)

export const Server = Express.createServer({
  app: App,
  config: Config
})
