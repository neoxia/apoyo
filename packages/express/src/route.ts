import { Request } from './request'

export type Route = Route.Single | Route.Group

export namespace Route {
  export interface Single {
    path: string
    method: string
    handler: Request.Handler
  }
  export interface Group {
    path?: string
    middlewares?: Request.Handler[]
    catch?: Request.ErrorHandler[]
    children: Route[]
  }
  export interface GroupConfig {
    middlewares?: Request.Handler[]
    catch?: Request.ErrorHandler[]
    children: Route[]
  }
}

const method = (method: string) => (path: string, handler: Request.Handler): Route.Single => ({
  method,
  path,
  handler
})

const get = method('get')
const post = method('post')
const put = method('put')
const patch = method('patch')
const deleteMethod = method('delete')

function group(route: Route.GroupConfig): Route.Group
function group(prefix: string, config: Route.GroupConfig): Route.Group
function group(prefixOrConfig: string | Route.GroupConfig, config?: Route.Group): Route.Group {
  const path = typeof prefixOrConfig === 'string' ? prefixOrConfig : undefined
  const { middlewares, children, catch: catchExceptions } = config ? config : (prefixOrConfig as Route.GroupConfig)

  return {
    path,
    middlewares,
    children,
    catch: catchExceptions
  }
}

export const Route = {
  get,
  post,
  put,
  patch,
  delete: deleteMethod,
  group
}
