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

export const of = (msg: string, info?: Dict<any>): Err => {
  const message = pipe(msg, template(info || {}))
  const e: Err = new Error(message)
  e.info = info
  return e
}
export const create = of

export const wrap = (msg: string, info?: Dict<any>) => (err: Error): Err => {
  const error = of(msg, info)
  error.cause = err
  return error
}

export const chain = (msg: string, info?: Dict<any>) => (err: Error): Err =>
  pipe(err, wrap(`${msg}: ${err.message}`, info))

export const toArray = (err: Error) => {
  const errors: Err[] = []
  let cur: O.Option<Err> = err
  while (cur) {
    errors.push(cur)
    cur = cur.cause
  }
  return errors
}

export const find = (fn: (info: Dict<any>) => boolean) => (err: Error): O.Option<Err> => {
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

export const info = (err: Error) => {
  const infos = pipe(
    err,
    toArray,
    A.filterMap((err) => err.info),
    A.reverse
  )
  return merge(...infos)
}

const fullStack = (err: Error) =>
  pipe(
    err,
    toArray,
    A.filterMap((err) => err.stack),
    A.join(`\ncaused by: `)
  )

const format = (err: Error): FormattedError => {
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

const toJSON = (err: FormattedError, stackTrace: boolean = true): object => ({
  name: err.name,
  message: err.message,
  info: err.info,
  stack: stackTrace ? err.stack : undefined
})

export const Err = {
  of,
  create,
  wrap,
  chain,
  find,
  has,
  info,
  fullStack,
  format,
  toArray,
  toJSON
}
