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
import { Injectable } from '@apoyo/ioc'
import { pipe, Prom, Result } from '@apoyo/std'

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

export function reply(fn: (req: ExpressRequest) => MaybePromise<Http.Response>): Request.Handler
export function reply<A>(
  a: Injectable<A>,
  fn: (req: ExpressRequest, a: A) => MaybePromise<Http.Response>
): Request.Handler
export function reply<A, B>(
  a: Injectable<A>,
  b: Injectable<B>,
  fn: (req: ExpressRequest, a: A, b: B) => MaybePromise<Http.Response>
): Request.Handler
export function reply<A, B, C>(
  a: Injectable<A>,
  b: Injectable<B>,
  c: Injectable<C>,
  fn: (req: ExpressRequest, a: A, b: B, c: C) => MaybePromise<Http.Response>
): Request.Handler
export function reply<A, B, C, D>(
  a: Injectable<A>,
  b: Injectable<B>,
  c: Injectable<C>,
  d: Injectable<D>,
  fn: (req: ExpressRequest, a: A, b: B, c: C, d: D) => MaybePromise<Http.Response>
): Request.Handler
export function reply<A, B, C, D, E>(
  a: Injectable<A>,
  b: Injectable<B>,
  c: Injectable<C>,
  d: Injectable<D>,
  e: Injectable<E>,
  fn: (req: ExpressRequest, a: A, b: B, c: C, d: D, e: E) => MaybePromise<Http.Response>
): Request.Handler
export function reply<A, B, C, D, E, F>(
  a: Injectable<A>,
  b: Injectable<B>,
  c: Injectable<C>,
  d: Injectable<D>,
  e: Injectable<E>,
  f: Injectable<F>,
  fn: (req: ExpressRequest, a: A, b: B, c: C, d: D, e: E, f: F) => MaybePromise<Http.Response>
): Request.Handler
export function reply(...args: any[]) {
  const fn: (...args: any[]) => MaybePromise<Http.Response> = args.pop()
  const deps = Injectable.array(args)

  return async (req: ExpressRequest, res: ExpressResponse, next: ExpressNext) => {
    await pipe(
      Http.tryCatch(async () => {
        const scope = (req as any).container
        const resolved = await scope.get(deps)
        return fn(req, ...resolved)
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
  const deps = Injectable.array(args)

  return async (err: unknown, req: ExpressRequest, res: ExpressResponse, next: ExpressNext) => {
    await pipe(
      Http.tryCatch(async () => {
        const scope = (req as any).container
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

export const Request = {
  reply,
  catch: catchException,
  validate
}
