import { Http, Request, Route } from '../../../src'
import { AuthenticateByJwt, IsAdmin } from '../middlewares/auth.middleware'

export const adminRoutes = Route.group('/admin', {
  middlewares: [AuthenticateByJwt, IsAdmin],
  children: [
    Route.get(
      '/users',
      Request.reply(() => Http.Ok([]))
    )
  ]
})
