import { Http, Request, Route } from '@apoyo/express'

export const getHealth = Request.reply(() => {
  return Http.Ok({
    message: 'Service online'
  })
})

export const healthRoutes = Route.group('/health', {
  children: [Route.get('/', getHealth)]
})
