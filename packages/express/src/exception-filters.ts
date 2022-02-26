import { Http } from '@apoyo/http'
import { Option } from '@apoyo/std'

export type ExceptionFilter<T = unknown> = {
  guard(err: unknown): err is T
  execute(err: T): Http.Response
}

const create = <T>(guard: (err: unknown) => err is T, execute: (err: T) => Http.Response): ExceptionFilter<T> => ({
  guard,
  execute
})

type Type<T> = {
  new (...args: any[]): T
}

const instanceOf = <T>(clazz: Type<T>, execute: (err: T) => Http.Response): ExceptionFilter => ({
  guard: (err: unknown): err is T => err instanceof clazz,
  execute
})

const search = (err: unknown, arr: ExceptionFilter[]): Option<ExceptionFilter> => {
  return arr.find((filter) => filter.guard(err))
}

const execute = (err: unknown, arr: ExceptionFilter[]): Http.Response | never => {
  const matching = search(err, arr)
  if (matching) {
    return matching.execute(err)
  }
  throw err
}

export const ExceptionFilter = {
  create,
  instanceOf,
  search,
  execute
}
