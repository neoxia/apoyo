import { Container } from '@apoyo/scopes'
import { $app, $logger } from './mocks'

import request from 'supertest'
import { Application } from 'express'

describe('Route', () => {
  let container: Container
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

    container = Container.create({
      bindings: [Container.bind($logger, logger)]
    })

    app = await container.get($app)
  })

  afterEach(async () => {
    await container.close()
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

    it('should return a not found response', async () => {
      const response = await request(app).get('/todos/1')

      expect(response.status).toEqual(404)
    })

    it('should return a validation error', async () => {
      const response = await request(app).post('/todos').send({})
      expect(response.status).toEqual(422)
    })

    it('should return created response', async () => {
      const response = await request(app).post('/todos').send({
        title: 'Test',
        done: false
      })
      expect(response.status).toEqual(201)
    })

    it('should return a no content response', async () => {
      const response = await request(app).delete('/todos/1')

      expect(response.status).toEqual(204)
      expect(response.noContent).toBe(true)
    })
  })

  describe('Catch errors', () => {
    it('should throw error and log error', async () => {
      const response = await request(app).get('/uncatched/throw-error')

      expect(response.status).toEqual(500)

      expect(logger.error.mock.calls.length).toBe(1)
      expect(logger.error.mock.calls[0][0]).toBe('Internal error')
    })

    it('should not catch filter when catch handler has been added', async () => {
      const response = await request(app).get('/uncatched/throw-access')

      expect(response.status).toEqual(500)
    })

    it('should not catch filter when filters do not match the error', async () => {
      const response = await request(app).get('/catched/throw-error')

      expect(response.status).toEqual(500)
    })

    it('should catch filter when catch handler has been added', async () => {
      const response = await request(app).get('/catched/throw-access')

      expect(response.status).toEqual(403)
    })
  })

  describe('Middlewares', () => {
    it('should throw unauthorized error', async () => {
      const response = await request(app).get('/admin/users')

      expect(response.status).toEqual(401)
    })

    it('should return ok response', async () => {
      const response = await request(app).get('/admin/users').set('Authorization', 'Bearer xxxx')

      expect(response.status).toEqual(200)
    })
  })
})
