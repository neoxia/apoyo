import type { Dict } from './Dict'
import type { Option } from './Option'

import * as A from './Array'
import * as D from './Dict'
import { merge, omit } from './Object'
import { pipe } from './pipe'
import { template } from './String'
import { Exception } from './Exception'

export interface FormattedError {
  name: string
  message: string
  info: Dict
  stack: string
}

export type Err = Error & {
  cause?: Err
  [key: string]: any
}

const INFO_RESERVED = new Set(['message', 'stack', 'cause'])

const isNotReserved = (_: unknown, key: string) => !INFO_RESERVED.has(key)

const info = (err: unknown) => {
  return pipe(merge<Dict>(toError(err) as any), D.filter(isNotReserved))
}

const fullInfo = (err: unknown) => {
  const infos = pipe(err, toError, toArray, A.filterMap(info), A.reverse)
  return merge(...infos)
}

const fullStack = (err: unknown) =>
  pipe(
    err,
    toError,
    toArray,
    A.filterMap((err) => err.stack),
    A.join(`\ncaused by: `)
  )

export const of = (msg: string, info: Dict<any> = {}, cause?: Err, constructorOpt?: Function): Err => {
  const data = pipe(info, D.filter(isNotReserved))
  const message = pipe(msg, template(data))
  const e = new Exception(message, cause) as Err
  Object.assign(e, data)
  Error.captureStackTrace(e, constructorOpt || of)
  return e
}

export const toError = (err: unknown): Err => (err instanceof Error ? (err as Err) : of(String(err)))

export const toArray = (err: unknown): Err[] => {
  const errors: Err[] = []
  let cur: Option<Err> = toError(err)
  while (cur) {
    errors.push(cur)
    cur = cur.cause
  }
  return errors
}

export function wrap(msg: string, info?: Dict<any>) {
  return function _wrap(e: unknown): Err {
    const err = toError(e)
    return of(msg, info, err, _wrap)
  }
}

export function chain(msg: string, info?: Dict<any>) {
  return function _chain(e: unknown): Err {
    const err = toError(e)
    return of(`${msg}: ${err.message}`, info, err, _chain)
  }
}

export const find = (fn: (err: Err) => boolean) => (source: unknown): Option<Err> => {
  let cur: Option<Err> = toError(source)
  while (cur) {
    const found = fn(cur)
    if (found) {
      return cur
    }
    cur = cur.cause
  }
  return undefined
}

export const has = (fn: (err: Err) => boolean) => (source: unknown): boolean =>
  pipe(source, find(fn), (value) => (value ? true : false))

export const hasName = (name: string) => has((info) => info.name === name)

export const format = (e: unknown): FormattedError => {
  const err = toError(e)
  const stack = fullStack(err)
  const i = fullInfo(err)
  return {
    name: i.name ? String(i.name) : err.name,
    message: err.message,
    stack,
    info: i
  }
}

export const omitStack = omit<FormattedError, 'stack'>(['stack'])

/**
 * @namespace Err
 *
 * @deprecated Prefer creating custom exception classes using the provided `Exception` class.
 *
 * @description
 * This namespace contains utilities to create custom errors.
 *
 * This namespace has also heavily been inspired by verror:
 * https://www.npmjs.com/package/verror
 *
 * As such, it contains utilities to create, chain, wrap and format errors.
 *
 * However, this package has multiple advantages:
 * - Easier templating: usage of mustaches instead of printf style
 * - Better compatibility with errors from other library
 */
export const Err = {
  /**
   * @description
   * Create a new error. You can also attach additional properties to the error
   *
   * @param msg - Error message with mustach style templating
   * @param info - Additional properties to add to the error
   * @param cause - The original error, that has caused this error
   * @param constructorOpt - Useful if you want to create a custom error factory. For more information, see https://nodejs.org/api/errors.html#errors_error_capturestacktrace_targetobject_constructoropt
   *
   * @example
   * ```ts
   * const divide = (a, b) => {
   *   if (b === 0) {
   *     throw Err.of(`cannot divide {a} by {b}`, { a, b })
   *   }
   *   return a / b
   * }
   * ```
   */
  of,

  /**
   * @description
   * Returns the error instance or creates a new error if the `err` param is an instance of `Error`.
   *
   * @param err
   */
  toError,

  /**
   * @description
   * Chain an error and override the message with the new one.
   * This function is mostly used to hide low-level details to an user.
   *
   * The original error can be accessed in the `cause` property.
   *
   * @see `Err.chain` - To preprend the new message to the previous one
   *
   * @example
   * ```ts
   * const source = new Error('Database error')
   * const err = pipe(
   *   source,
   *   Err.wrap('Could not find user #{userId}', { userId: 'xxxx' })
   * )
   *
   * expect(source.message).toBe('Database error')
   * expect(err.message).toBe('Could not find user xxxx')
   * ```
   */
  wrap,

  /**
   * @description
   * Chain an error and preprend the new message to the previous one.
   *
   * The original error can be accessed in the `cause` property.
   *
   * @see `Err.wrap` - To override the message of the error
   *
   * @example
   * ```ts
   * const source = new Error('Database error')
   * const err = pipe(
   *   source,
   *   Err.chain('Could not find user #{userId}', { userId: 'xxxx' })
   * )
   *
   * expect(source.message).toBe('Database error')
   * expect(err.message).toBe('Could not find user xxxx: Database error')
   * ```
   */
  chain,

  /**
   * @description
   * Find a specific cause in the error matching the given predicate.
   *
   * @see `Err.has`
   * @see `Err.hasName`
   *
   * @example
   * ```ts
   * const source = Err.of('cannot divide {a} by {b}', {
   *   name: 'DivideError',
   *   code: 'ZeroDivide',
   *   a: 3,
   *   b: 0
   * })
   *
   * const err = pipe(
   *   source,
   *   Err.chain('Job failed', { name: 'JobError' })
   * )
   *
   * const result = pipe(
   *   err,
   *   Err.find(e => e.name === 'DivideError')
   * )
   * expect(result === source).toBe(true)
   * ```
   */
  find,

  /**
   * @description
   * Check if the error contains a specific cause matching the given predicate.
   *
   * @see `Err.find`
   * @see `Err.hasName`
   *
   * @example
   * ```ts
   * const source = Err.of('cannot divide {a} by {b}', {
   *   name: 'DivideError',
   *   code: 'ZeroDivide',
   *   a: 3,
   *   b: 0
   * })
   *
   * const err = pipe(
   *   source,
   *   Err.chain('Job failed', { name: 'JobError' })
   * )
   *
   * expect(pipe(err, Err.has(e => e.name === 'DivideError'))).toBe(true)
   * ```
   */
  has,

  /**
   * @description
   * Check if the error contains a specific cause matching the given name.
   *
   * @see `Err.find`
   * @see `Err.has`
   *
   * @example
   * ```ts
   * const source = Err.of('cannot divide {a} by {b}', {
   *   name: 'DivideError',
   *   code: 'ZeroDivide',
   *   a: 3,
   *   b: 0
   * })
   *
   * const err = pipe(
   *   source,
   *   Err.chain('Job failed', { name: 'JobError' })
   * )
   *
   * expect(pipe(err, Err.hasName('DivideError'))).toBe(true)
   * ```
   */
  hasName,

  /**
   * @description
   * Format the given error.
   * This combines all informational properties of the errors into one `info` object.
   * This also creates a full stack trace including the stack traces from all causes.
   *
   * @example
   * ```ts
   * const source = Err.of('cannot divide {a} by {b}', {
   *   name: 'DivideError',
   *   code: 'ZeroDivide',
   *   a: 3,
   *   b: 0
   * })
   *
   * const err = pipe(
   *   source,
   *   Err.chain('Job failed', { name: 'JobError', code: 'InternalError' })
   * )
   *
   * const formatted = Err.format(err)
   *
   * expect(formatted).toEqual({
   *   name: 'JobError',
   *   message: 'Job failed: cannot divide 3 by 0',
   *   stack: '...',
   *   info: {
   *     code: 'InternalError',
   *     name: 'JobError',
   *     a: 3,
   *     b: 0
   *   },
   * })
   * ```
   */
  format,

  /**
   * @description
   * Omit the stack property from the error.
   */
  omitStack
}
