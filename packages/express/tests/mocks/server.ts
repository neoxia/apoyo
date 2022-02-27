import express, { Application } from 'express'
import bodyParser from 'body-parser'

import { Injectable } from '@apoyo/scopes'

import { Express } from '../../src'
import { routes } from './routes/index.route'

export const Config = Injectable.of({
  port: 3000
})

export const Router = Express.createRouter(routes)

export const App = Injectable.define(
  Router,
  (router): Application => {
    const app = express()
    app.use(bodyParser.json())
    app.use(router)
    return app
  }
)

export const Server = Express.createServer({
  app: App,
  config: Config
})
