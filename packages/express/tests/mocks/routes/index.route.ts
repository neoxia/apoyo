import { Http, Request, Route } from '../../../src'
import { AccessException } from '../exceptions/access-exception'
import { $logger } from '../services/logger.service'
import { adminRoutes } from './admin.route'
import { healthRoutes } from './health.route'
import { todoRoutes } from './todos.route'

export const catchAppErrors = Request.catch((err) => {
  if (err instanceof AccessException) {
    throw Http.Forbidden({
      message: err.message
    })
  }
  throw err
})

export const catchAll = Request.catch($logger, (err, logger) => {
  logger.error('Internal error', err)
  throw err
})

export const errorRoutes = [
  Route.get(
    '/throw-access',
    Request.reply(() => {
      throw new AccessException()
    })
  ),
  Route.get(
    '/throw-error',
    Request.reply(() => {
      throw new Error()
    })
  )
]

export const routes = Route.group({
  children: [
    todoRoutes,
    healthRoutes,
    adminRoutes,
    Route.group('/uncatched', {
      children: errorRoutes
    }),
    Route.group('/catched', {
      children: errorRoutes,
      catch: [catchAppErrors]
    })
  ],
  catch: [catchAll]
})
