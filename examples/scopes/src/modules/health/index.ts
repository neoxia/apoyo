import { Route } from '@apoyo/express'
import { getHealth } from './health.controller'

export const healthRoutes = Route.group('/health', {
  children: [Route.get('/', getHealth)]
})
