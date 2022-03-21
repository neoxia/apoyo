import { Injectable } from '@apoyo/scopes'
import { Http, Request } from '../../../src'

const getBearerToken = (header: string | undefined) => {
  if (!header) {
    return undefined
  }
  if (header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length)
  }
  return undefined
}

export interface User {
  email: string
  role: 'member' | 'admin'
}

const $authHeader = Request.header('Authorization')
const $bearerToken = Injectable.define($authHeader, getBearerToken)

export const authenticateByJwt = Request.reply(Request.$request, $bearerToken, (req: any, token) => {
  if (!token) {
    throw Http.Unauthorized()
  }
  req.user = {
    email: 'john.doe@example.com',
    role: 'admin'
  }
  return Http.next()
})

export const $currentUser = Injectable.define(
  Request.$request,
  (req: any): User => {
    const user = req.user
    if (!user) {
      throw Http.Unauthorized()
    }
    return user
  }
)

export const isAdmin = Request.reply($currentUser, (user) => {
  if (user.role !== 'admin') {
    throw Http.Forbidden()
  }
  return Http.next()
})
