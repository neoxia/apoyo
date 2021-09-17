import { Dict, pipe, Prom } from '@apoyo/std'
import { HttpCode } from './HttpCode'
import { Json } from './Json'

import { Response as Res } from './Response'

export type Http = never
export namespace Http {
  export type Response = Res
}

export const send = (body?: string, status = 200): Http.Response => pipe(Res.status(status), Res.send(body))
export const json = (data?: Json, status = 200): Http.Response => pipe(Res.status(status), Res.json(data))

export const redirect = (url: string, status = 302): Http.Response => pipe(Res.status(status), Res.redirect(url))
export const download = (stream: ReadableStream, fileName?: string, fileType?: string): Http.Response =>
  pipe(
    Res.status(200),
    (res) => (fileName ? pipe(res, Res.header('Content-Disposition', `attachment; filename="${fileName}"`)) : res),
    (res) => (fileType ? pipe(res, Res.header('Content-Type', fileType)) : res),
    Res.stream(stream)
  )

export const tryCatch = (fn: () => Res | Promise<Res>): Promise<Http.Response> =>
  pipe(
    Prom.thunk(fn),
    Prom.catchError((err) => (Res.isResponse(err) ? Prom.resolve(err) : Prom.reject(err)))
  )

export const Ok = (data: Json): Http.Response => json(data, 200)
export const Created = (data: Json): Http.Response => json(data, 201)
export const NoContent = (): Http.Response => json(undefined, 204)

const errorFactory = (status: HttpCode, code: string, message: string) => (data: Dict = {}): Http.Response =>
  json(
    pipe(
      {
        status,
        code,
        message: data.message || message
      },
      Dict.union(data)
    ),
    status
  )

export const BadRequest = errorFactory(HttpCode.BAD_REQUEST, 'bad_request', '400 Bad Request')
export const Unauthorized = errorFactory(HttpCode.UNAUTHORIZED, 'unauthorized', '401 Unauthorized')
export const PaymentRequired = errorFactory(HttpCode.PAYMENT_REQUIRED, 'payment_required', '402 Payment Required')
export const Forbidden = errorFactory(HttpCode.FORBIDDEN, 'forbidden', '403 Forbidden')
export const NotFound = errorFactory(HttpCode.NOT_FOUND, 'not_found', '404 Not Found')
export const MethodNotAllowed = errorFactory(
  HttpCode.METHOD_NOT_ALLOWED,
  'method_not_allowed',
  '405 Method Not Allowed'
)
export const NotAcceptable = errorFactory(HttpCode.NOT_ACCEPTABLE, 'not_acceptable', '406 Not Acceptable')
export const RequestTimeout = errorFactory(HttpCode.REQUEST_TIMEOUT, 'request_timeout', '408 Request Timeout')
export const Conflict = errorFactory(HttpCode.CONFLICT, 'conflict', '409 Conflict')
export const UnprocessableEntity = errorFactory(
  HttpCode.UNPROCESSABLE_ENTITY,
  'unprocessable_entity',
  '422 Unprocessable Entity'
)
export const InternalError = errorFactory(HttpCode.INTERNAL_ERROR, 'internal_server_error', '500 Internal Server Error')
export const NotImplemented = errorFactory(HttpCode.NOT_IMPLEMENTED, 'not_implemented', '501 Not Implemented')
export const BadGateway = errorFactory(HttpCode.BAD_GATEWAY, 'bad_gateway', '502 Bad Gateway')
export const ServiceUnavailable = errorFactory(
  HttpCode.SERVICE_UNAVAILABLE,
  'service_unavailable',
  '503 Service Unavailable'
)
export const GatewayTimeout = errorFactory(HttpCode.GATEWAY_TIMEOUT, 'gateway_timeout', '504 Gateway Timeout')

export const Http = {
  /**
   * @description
   * Create a response that sends a given body to the client.
   */
  send,

  /**
   * @description
   * Create a response that sends a given JSON object to the client.
   */
  json,

  /**
   * @description
   * Create a response to redirect the user to another URL
   */
  redirect,

  /**
   * @description
   * Create a response to download a given readable stream
   */
  download,

  /**
   * @description
   * Catches thrown `Http.Response`s and resolves them.
   * All other errors will not be catched!
   */
  tryCatch,

  Ok,
  Created,
  NoContent,
  BadRequest,
  Unauthorized,
  PaymentRequired,
  Forbidden,
  NotFound,
  MethodNotAllowed,
  NotAcceptable,
  RequestTimeout,
  Conflict,
  UnprocessableEntity,
  InternalError,
  NotImplemented,
  BadGateway,
  ServiceUnavailable,
  GatewayTimeout
}
