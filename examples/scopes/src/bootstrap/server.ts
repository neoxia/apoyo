import express from 'express'

import { routes } from '@/app/http/routes'
import { Config } from '@/utils/config'
import { IntegerDecoder } from '@apoyo/decoders'
import { Express } from '@apoyo/express'
import { Injectable, Resource } from '@apoyo/scopes'

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

export const $server = Injectable.define($app, $config, async (app, config) => {
  console.log(`Start HTTP server on port ${config.port}`)
  const server = await Express.listen(app, config.port)

  return Resource.of(server, async () => {
    console.log(`Shutdown HTTP server`)
    await Express.close(server)
  })
})
