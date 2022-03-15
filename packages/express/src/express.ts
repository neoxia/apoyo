import { Application, Router } from 'express'
import { Server } from 'http'

import { Injectable, Resource, Scope } from '@apoyo/scopes'

import { Request } from './request'
import { Route } from './route'

export type Express = Application

export namespace Express {
  export interface Config {
    port: number
  }

  export interface CreateServerOptions {
    app: Injectable<Application>
    config: Injectable<Config>
  }
}

const applyMiddlewares = (router: Router, middlewares: Request.Handler[] = []) => {
  for (const middleware of middlewares) {
    router.use(middleware)
  }
}

const applyChildren = (router: Router, routes: Route[] = []) => {
  for (const route of routes) {
    router.use(applyRoute(route))
  }
}

const applyCatchers = (router: Router, catchers: Request.ErrorHandler[] = []) => {
  for (const catcher of catchers) {
    router.use(catcher)
  }
}

const prefixRoute = (router: Router, prefix: string) => {
  const prefixed = Router({
    mergeParams: true
  })
  prefixed.use(prefix, router)
  return prefixed
}

const applyRoute = (route: Route): Router => {
  const router = Router({
    mergeParams: true
  })
  if ('children' in route) {
    applyMiddlewares(router, route.middlewares)
    applyChildren(router, route.children)
    applyCatchers(router, route.catch)
    return route.path ? prefixRoute(router, route.path) : router
  }
  return (router as any)[route.method](route.path, route.handler)
}

export const createRouter = (route: Route, factory: Injectable<Scope.Factory> = Scope.Factory()): Injectable<Router> =>
  Injectable.define(factory, (factory) => {
    const router = Router({
      mergeParams: true
    })

    router.use((req: any, _res, next) => {
      req.scope = factory.create({
        bindings: [Scope.bind(Request.req, req as Request)]
      })
      next()
    })

    router.use(applyRoute(route))
    return router
  })

export const listen = (app: Application, port: number): Promise<Server> => {
  return new Promise<Server>((resolve) => {
    const server = app.listen(port, () => resolve(server))
  })
}

export const close = (server: Server) => {
  return new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()))
  })
}

export const createServer = (options: Express.CreateServerOptions): Injectable<Server> =>
  Injectable.define(options.app, options.config, async (app, config) => {
    const server = await Express.listen(app, config.port)
    const close = () => Express.close(server)
    return Resource.of(server, close)
  })

export const Express = {
  createRouter,
  createServer,
  listen,
  close
}
