import express, { Application } from 'express'

import { Injectable } from '@apoyo/scopes'

import { Express } from '../../src'
import { routes } from './routes/index.route'
import { Implementation } from '@apoyo/scopes'

export const $config = Injectable.of({
  port: 3000
})

export const $router = Express.createRouter(routes)

export const $app = Implementation.create(
  [$router],
  (router): Application => {
    const app = express()
    app.use(express.json())
    app.use(router)
    return app
  }
)

export const Server = Express.createServer($app, $config)
