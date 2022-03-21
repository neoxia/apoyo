import { Http, Request, Route } from '../../../src'
import { authenticateByJwt, isAdmin } from '../middlewares/auth.middleware'

export const adminRoutes = Route.group('/admin', {
  middlewares: [authenticateByJwt, isAdmin],
  children: [
    Route.get(
      '/users',
      Request.reply(() => Http.Ok([]))
    )
  ]
})
