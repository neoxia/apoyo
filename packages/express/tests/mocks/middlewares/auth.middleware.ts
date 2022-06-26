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

export const authenticateByJwt = Request.reply((req: any) => {
  const token = getBearerToken(req.header('Authorization'))
  if (!token) {
    throw Http.Unauthorized()
  }
  req.user = {
    email: 'john.doe@example.com',
    role: 'admin'
  }
  return Http.next()
})

export const isAdmin = Request.reply((req: any) => {
  const user = req.user
  if (!user) {
    throw Http.Unauthorized()
  }
  if (user.role !== 'admin') {
    throw Http.Forbidden()
  }
  return Http.next()
})
