import express from 'express'

import { Injectable } from '@apoyo/scopes'

import { healthRoutes } from '@/modules/health'
import { todoRoutes } from '@/modules/todos'

import { Express, Route } from '@apoyo/express'
import { Config } from '@/utils/config'
import { IntegerDecoder } from '@apoyo/decoders'

export const routes = Route.group({
  children: [healthRoutes, todoRoutes]
})

export const $router = Express.createRouter(routes)

export const $config = Config.fromEnv({
  port: Config.prop('PORT', IntegerDecoder.positive)
})

export const $app = Injectable.define($router, (router) => {
  const app = express()

  app.use(express.json())
  app.use(router)

  return app
})

export const $server = Express.createServer($app, $config)
