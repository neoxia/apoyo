import express from 'express'
import { Server } from 'http'

import { Config } from '@/config'
import { Var } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'

import { Routes } from './routes'

export const API = pipe(
  Var.inject(Config.API, Routes),
  Var.mapWith(async (config, routes) => {
    const app = express()
    // use middlewares
    // ...
    // use routes
    app.use(routes)

    const port = config.port
    const server = await new Promise<Server>((resolve) => {
      const server = app.listen(port, () => resolve(server))
    })

    console.log(`Server started on port ${port}`)

    return server
  }),
  Var.closeWith(async (server) => {
    console.log('Stopping server...')
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())))
  })
)
