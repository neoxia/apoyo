import { Http, Request } from '@apoyo/express'
import { Err } from '@apoyo/std'

export const catchAll = Request.catch((err) => {
  if (process.env.NODE_ENV === 'production') {
    return Http.InternalError({
      message: 'Internal error'
    })
  }
  throw Http.InternalError(Err.format(err))
})
