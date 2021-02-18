import * as A from './Array'
import { Dict } from './Dict'
import { merge } from './Object'
import * as O from './Option'
import { pipe } from './pipe'
import { template } from './String'

interface IErr extends Error {
  cause?: IErr
  info?: Dict<any>
}

export interface FormattedError {
  readonly name: string
  readonly stack: string
  message: string
  info: Dict<any>
}

export type Err = IErr

export const of = (msg: string, info?: Dict<any>, cause?: Error): Error => {
  const message = pipe(msg, template(info || {}))
  const e: Err = new Error(message)
  if (info && info.name) {
    e.name = info.name
  }
  e.info = info
  e.cause = cause
  return e
}

export const create = of

export const fromUnknown = (err: unknown): Error => (err instanceof Error ? err : of(String(err)))

export const wrap = (msg: string, info?: Dict<any>) => (e: unknown): Error => {
  const err = fromUnknown(e)
  return of(msg, info, err)
}

export const chain = (msg: string, info?: Dict<any>) => (e: unknown): Error => {
  const err = fromUnknown(e)
  return of(`${msg}: ${err.message}`, info, err)
}

export const toArray = (err: Error) => {
  const errors: Err[] = []
  let cur: O.Option<Err> = err
  while (cur) {
    errors.push(cur)
    cur = cur.cause
  }
  return errors
}

export const find = (fn: (info: Dict<any>) => boolean) => (err: Error): O.Option<Error> => {
  let cur: O.Option<Err> = err
  while (cur) {
    const found = pipe(cur.info, O.map(fn))
    if (found) {
      return cur
    }
    cur = cur.cause
  }
  return undefined
}

export const has = (fn: (info: Dict<any>) => boolean) => (err: Error): boolean =>
  pipe(err, find(fn), (value) => (value ? true : false))

export const info = (err: unknown) => {
  const infos = pipe(
    err,
    fromUnknown,
    toArray,
    A.filterMap((err) => err.info),
    A.reverse
  )
  return merge(...infos)
}

const cause = (err: unknown): O.Option<Error> => err && (err as any).cause

const fullStack = (err: unknown) =>
  pipe(
    err,
    fromUnknown,
    toArray,
    A.filterMap((err) => err.stack),
    A.join(`\ncaused by: `)
  )

const format = (e: unknown): FormattedError => {
  const err = fromUnknown(e)
  const i = info(err)
  return {
    message: err.message,
    name: i.name || err.name,
    info: i,
    get stack() {
      return fullStack(err)
    }
  }
}

const toJSON = (err: FormattedError, stackTrace = true) => ({
  name: err.name,
  message: err.message,
  info: err.info,
  stack: stackTrace ? err.stack : undefined
})

export const Err = {
  of,
  create,
  fromUnknown,
  wrap,
  chain,
  find,
  has,
  info,
  cause,
  fullStack,
  format,
  toArray,
  toJSON
}
