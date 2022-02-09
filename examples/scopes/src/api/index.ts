import express from 'express'
import { Server } from 'http'

import { Config } from '@/config'
import { Injectable, Resource } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'

import { Routes } from './routes'

export const API = pipe(
  Injectable.struct({
    config: Config.API,
    routes: Routes
  }),
  Injectable.resource(async ({ config, routes }) => {
    const app = express()
    // use middlewares
    // ...
    // use routes
    app.use(routes)

    const port = config.port
    const server = await new Promise<Server>((resolve) => {
      const server = app.listen(port, () => resolve(server))
    })

    const close = async () => {
      console.log('Stopping server...')
      await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())))
    }

    console.log(`Server started on port ${port}`)

    return Resource.of(server, close)
  })
)
