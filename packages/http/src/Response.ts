import { Dict, Enum, pipe, Str } from '@apoyo/std'

import { Json } from './Json'

export enum ResponseType {
  RESULT = 'http.result',
  REDIRECT = 'http.redirect',
  STREAM = 'http.stream'
}

export type Response = Response.Result | Response.Redirect | Response.Stream | Response.Callback
export namespace Response {
  export interface Open {
    status: number
    headers: Dict
    cookies: Dict
  }
  export interface Result extends Open {
    type: ResponseType.RESULT
    body?: string
  }
  export interface Redirect extends Open {
    type: ResponseType.REDIRECT
    url: string
  }
  export interface Stream extends Open {
    type: ResponseType.STREAM
    stream: ReadableStream
  }
  export type Callback = (...args: any[]) => void
}

const hasType = Str.oneOf(Enum.values(ResponseType))

const isResponse = (input: any): input is Response => hasType(input.type)

const status = (status: number): Response.Open => ({
  status,
  headers: {},
  cookies: {}
})

const header = (name: string, value: string) => (res: Response.Open): Response.Open => ({
  ...res,
  headers: {
    ...res.headers,
    [name]: value
  }
})

const cookie = (name: string, value: string) => (res: Response.Open): Response.Open => ({
  ...res,
  cookies: {
    ...res.cookies,
    [name]: value
  }
})

const send = (body?: string) => (res: Response.Open): Response.Result => ({
  ...res,
  type: ResponseType.RESULT,
  body
})

const json = (data?: Json) => (res: Response.Open): Response.Result =>
  pipe(res, send(data ? JSON.stringify(data) : undefined))

const redirect = (url: string) => (res: Response.Open): Response.Redirect => ({
  ...res,
  type: ResponseType.REDIRECT,
  url
})

const stream = (readable: ReadableStream) => (res: Response.Open): Response.Stream => ({
  ...res,
  type: ResponseType.STREAM,
  stream: readable
})

export const Response = {
  isResponse,
  status,
  send,
  json,
  header,
  cookie,
  redirect,
  stream
}
