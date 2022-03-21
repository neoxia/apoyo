import { Dict, Enum, Str } from '@apoyo/std'

export enum ResponseType {
  RESULT = 'http.result',
  REDIRECT = 'http.redirect',
  STREAM = 'http.stream',
  CALLBACK = 'http.callback',
  NEXT = 'http.next'
}

export type Response = Response.Result | Response.Redirect | Response.Stream | Response.Callback | Response.Next
export namespace Response {
  export interface Open {
    status: number
    headers: Dict
  }
  export interface Result extends Open {
    type: ResponseType.RESULT
    body?: unknown
  }
  export interface Redirect extends Open {
    type: ResponseType.REDIRECT
    url: string
  }
  export interface Stream extends Open {
    type: ResponseType.STREAM
    stream: NodeJS.ReadableStream
  }
  export interface Callback {
    type: ResponseType.CALLBACK
    callback: (...args: any[]) => void
  }
  export interface Next {
    type: ResponseType.NEXT
  }
}

const hasType = Str.oneOf(Enum.values(ResponseType))

const isResponse = (input: any): input is Response => hasType(input.type)

const isResult = (input: Response): input is Response.Result => input.type === ResponseType.RESULT

const isNext = (input: Response): input is Response.Next => input.type === ResponseType.NEXT

const status = (status: number): Response.Open => ({
  status,
  headers: {}
})

const header = (name: string, value: string) => (res: Response.Open): Response.Open => ({
  ...res,
  headers: {
    ...res.headers,
    [name]: value
  }
})

const send = (body?: unknown) => (res: Response.Open): Response.Result => ({
  ...res,
  type: ResponseType.RESULT,
  body
})

const redirect = (url: string) => (res: Response.Open): Response.Redirect => ({
  ...res,
  type: ResponseType.REDIRECT,
  url
})

const stream = (readable: NodeJS.ReadableStream) => (res: Response.Open): Response.Stream => ({
  ...res,
  type: ResponseType.STREAM,
  stream: readable
})

const callback = (fn: (...args: any[]) => any): Response.Callback => ({
  type: ResponseType.CALLBACK,
  callback: fn
})

const next = (): Response.Next => ({
  type: ResponseType.NEXT
})

const match = <T>(cases: {
  Result: (value: Response.Result) => T
  Redirect: (value: Response.Redirect) => T
  Stream: (value: Response.Stream) => T
  Callback: (value: Response.Callback) => T
  Next: () => T
}) => (res: Response) => {
  if (res.type === ResponseType.CALLBACK) {
    return cases.Callback(res)
  }
  if (res.type === ResponseType.RESULT) {
    return cases.Result(res)
  }
  if (res.type === ResponseType.REDIRECT) {
    return cases.Redirect(res)
  }
  if (res.type === ResponseType.STREAM) {
    return cases.Stream(res)
  }
  return cases.Next()
}

export const Response = {
  isResponse,
  isResult,
  isNext,
  status,
  send,
  header,
  redirect,
  stream,
  callback,
  next,
  match
}
