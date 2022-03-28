import { Http, Request } from '@apoyo/express'

export const getHealth = Request.reply(() => {
  return Http.Ok({
    message: 'Service online'
  })
})
