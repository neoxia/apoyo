import express from 'express'
import { json } from 'body-parser'

import { Injectable } from '@apoyo/scopes'

import { routes } from './controllers'
import { Express } from '@apoyo/express'
import { Config } from '@/utils/config'
import { IntegerDecoder } from '@apoyo/decoders'

export const $router = Express.createRouter(routes)

export const $config = Config.fromEnv({
  port: Config.prop('PORT', IntegerDecoder.positive)
})

export const $app = Injectable.define($router, (router) => {
  const app = express()

  app.use(json())
  app.use(router)

  return app
})

export const $server = Express.createServer($app, $config)
