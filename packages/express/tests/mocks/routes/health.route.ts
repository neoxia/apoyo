import { Http, Request, Route } from '../../../src'

export const healthRoutes = Route.group({
  children: [
    Route.get(
      '/health',
      Request.reply(() => Http.Ok('OK'))
    )
  ]
})
