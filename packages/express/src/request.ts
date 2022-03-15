import {
  ErrorRequestHandler,
  Handler as ExpressHandler,
  NextFunction as ExpressNext,
  Request as ExpressRequest,
  Response as ExpressResponse
} from 'express'
import { pipeline } from 'stream'

import { DecodeError, Decoder } from '@apoyo/decoders'
import { Http, Response } from '@apoyo/http'
import { Injectable } from '@apoyo/scopes'
import { pipe, Prom, Result } from '@apoyo/std'

import { ExceptionFilter } from './exception-filters'

export type Request = ExpressRequest

export namespace Request {
  export type Handler = ExpressHandler
  export type ErrorHandler = ErrorRequestHandler
}

export type MaybePromise<T> = Promise<T> | T

export const send = (res: ExpressResponse, next: ExpressNext, response: Http.Response) => {
  return pipe(
    response,
    Response.match({
      Result: (response) => {
        res.status(response.status)
        res.set(response.headers)
        if (response.body === undefined || typeof response.body === 'string') {
          res.send(response.body)
        } else {
          res.json(response.body)
        }
      },
      Redirect: (response) => {
        res.status(response.status)
        res.set(response.headers)
        res.redirect(response.url)
      },
      Stream: (response) => {
        res.status(response.status)
        res.set(response.headers)
        pipeline(response.stream, res, (err) => {
          if (err) {
            res.end()
          }
        })
      },
      Callback: (response) => response.callback(res),
      Next: () => next()
    })
  )
}

export function reply(fn: () => MaybePromise<Http.Response>): Request.Handler
export function reply<A>(a: Injectable<A>, fn: (a: A) => MaybePromise<Http.Response>): Request.Handler
export function reply<A, B>(
  a: Injectable<A>,
  b: Injectable<B>,
  fn: (a: A, b: B) => MaybePromise<Http.Response>
): Request.Handler
export function reply<A, B, C>(
  a: Injectable<A>,
  b: Injectable<B>,
  c: Injectable<C>,
  fn: (a: A, b: B, c: C) => MaybePromise<Http.Response>
): Request.Handler
export function reply<A, B, C, D>(
  a: Injectable<A>,
  b: Injectable<B>,
  c: Injectable<C>,
  d: Injectable<D>,
  fn: (a: A, b: B, c: C, d: D) => MaybePromise<Http.Response>
): Request.Handler
export function reply<A, B, C, D, E>(
  a: Injectable<A>,
  b: Injectable<B>,
  c: Injectable<C>,
  d: Injectable<D>,
  e: Injectable<E>,
  fn: (a: A, b: B, c: C, d: D, e: E) => MaybePromise<Http.Response>
): Request.Handler
export function reply<A, B, C, D, E, F>(
  a: Injectable<A>,
  b: Injectable<B>,
  c: Injectable<C>,
  d: Injectable<D>,
  e: Injectable<E>,
  f: Injectable<F>,
  fn: (a: A, b: B, c: C, d: D, e: E, f: F) => MaybePromise<Http.Response>
): Request.Handler
export function reply(...args: any[]) {
  const fn: (...args: any[]) => MaybePromise<Http.Response> = args.pop()
  const deps = Injectable.sequence(args)

  return async (req: ExpressRequest, res: ExpressResponse, next: ExpressNext) => {
    await pipe(
      Http.tryCatch(async () => {
        const scope = (req as any).scope
        const resolved = await scope.get(deps)
        return fn(...resolved)
      }),
      Prom.tryCatch,
      Prom.map(
        Result.fold(
          (ok) => send(res, next, ok),
          (ko) => next(ko)
        )
      )
    )
  }
}

export function catchException(fn: (err: unknown) => MaybePromise<Http.Response>): Request.ErrorHandler
export function catchException<A>(
  a: Injectable<A>,
  fn: (err: unknown, a: A) => MaybePromise<Http.Response>
): Request.ErrorHandler
export function catchException<A, B>(
  a: Injectable<A>,
  b: Injectable<B>,
  fn: (err: unknown, a: A, b: B) => MaybePromise<Http.Response>
): Request.ErrorHandler
export function catchException<A, B, C>(
  a: Injectable<A>,
  b: Injectable<B>,
  c: Injectable<C>,
  fn: (err: unknown, a: A, b: B, c: C) => MaybePromise<Http.Response>
): Request.ErrorHandler
export function catchException<A, B, C, D>(
  a: Injectable<A>,
  b: Injectable<B>,
  c: Injectable<C>,
  d: Injectable<D>,
  fn: (err: unknown, a: A, b: B, c: C, d: D) => MaybePromise<Http.Response>
): Request.ErrorHandler
export function catchException<A, B, C, D, E>(
  a: Injectable<A>,
  b: Injectable<B>,
  c: Injectable<C>,
  d: Injectable<D>,
  e: Injectable<E>,
  fn: (err: unknown, a: A, b: B, c: C, d: D, e: E) => MaybePromise<Http.Response>
): Request.ErrorHandler
export function catchException<A, B, C, D, E, F>(
  a: Injectable<A>,
  b: Injectable<B>,
  c: Injectable<C>,
  d: Injectable<D>,
  e: Injectable<E>,
  f: Injectable<F>,
  fn: (err: unknown, a: A, b: B, c: C, d: D, e: E, f: F) => MaybePromise<Http.Response>
): Request.ErrorHandler
export function catchException(...args: any[]) {
  const fn: (err: unknown, ...args: any[]) => MaybePromise<Http.Response> = args.pop()
  const deps = Injectable.sequence(args)

  return async (err: unknown, req: ExpressRequest, res: ExpressResponse, next: ExpressNext) => {
    await pipe(
      Http.tryCatch(async () => {
        const scope = (req as any).scope
        const resolved = await scope.get(deps)
        return fn(err, ...resolved)
      }),
      Prom.tryCatch,
      Prom.map(
        Result.fold(
          (ok) => send(res, next, ok),
          (ko) => next(ko)
        )
      )
    )
  }
}

export const catchFilters = (filters: ExceptionFilter[]) =>
  catchException((err) => ExceptionFilter.execute(err, filters))

export const req: Injectable.Abstract<Request> = Injectable.abstract<Request>('Express.Request')

export const validate = <T>(data: unknown, decoder: Decoder<unknown, T>, message: string) =>
  pipe(
    data,
    Decoder.validate(decoder),
    Result.mapError((err) =>
      Http.UnprocessableEntity({
        message,
        errors: DecodeError.format(err)
      })
    ),
    Result.get
  )

export const body = <T>(decoder: Decoder<unknown, T>): Injectable<T> =>
  Injectable.define(req, (req) => validate(req.body, decoder, 'Request body failed validation'))

export const query = <T>(decoder: Decoder<unknown, T>): Injectable<T> =>
  Injectable.define(req, (req) => validate(req.query, decoder, 'Request query parameters failed validation'))

export const param = <T>(name: string, decoder: Decoder<unknown, T>): Injectable<T> =>
  Injectable.define(req, (req) => validate(req.params[name], decoder, 'Request parameter failed validation'))

export function header(name: string): Injectable<string | undefined>
export function header<T>(name: string, decoder: Decoder<unknown, T>): Injectable<T>
export function header(name: string, decoder?: Decoder<unknown, any>) {
  return Injectable.define(req, (req) => {
    const value = req.header(name)
    return decoder ? validate(value, decoder, 'Request header failed validation') : value
  })
}

export const Request = {
  reply,
  catch: catchException,
  catchFilters,

  validate,

  req,
  body,
  query,
  param,
  header
}
