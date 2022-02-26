import { Scope } from '@apoyo/scopes'
import { App, Logger } from './mocks'

import request from 'supertest'
import { Application } from 'express'

describe('Route', () => {
  let scope: Scope
  let app: Application
  let logger: {
    info: jest.Mock
    warn: jest.Mock
    error: jest.Mock
  }

  beforeEach(async () => {
    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    }

    scope = Scope.create({
      bindings: [Scope.bind(Logger, logger)]
    })

    app = await scope.get(App)
  })

  afterEach(async () => {
    await scope.close()
  })

  describe('Health route', () => {
    it('should return expected text response from health route', async () => {
      const response = await request(app).get('/health')

      expect(response.status).toEqual(200)
      expect(response.text).toEqual('OK')
    })
  })

  describe('Todo routes', () => {
    it('should return expected response from / route', async () => {
      const response = await request(app).get('/todos')

      expect(response.status).toEqual(200)
      expect(response.body).toEqual([])
    })

    it('should throw error and log error from /:id route', async () => {
      const response = await request(app).get('/todos/1')

      expect(response.status).toEqual(500)

      expect(logger.error.mock.calls.length).toBe(1)
      expect(logger.error.mock.calls[0][0]).toBe('Internal error')
    })

    it('should throw error and log error from /:id route', async () => {
      const response = await request(app).delete('/todos/1')

      expect(response.status).toEqual(204)
      expect(response.noContent).toBe(true)
    })
  })

  describe('Catch filters', () => {
    it('should not catch filter when catch handler has been added', async () => {
      const response = await request(app).get('/uncaught-access')

      expect(response.status).toEqual(500)
    })

    it('should not catch filter when filters do not match the error', async () => {
      const response = await request(app).get('/uncaught-error')

      expect(response.status).toEqual(500)
    })

    it('should catch filter when catch handler has been added', async () => {
      const response = await request(app).get('/caught-access')

      expect(response.status).toEqual(403)
    })
  })
})
