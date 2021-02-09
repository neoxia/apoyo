import { reduce } from './Array'
import { Dict } from './Dict'
import { pipe } from './pipe'

const BRACE_REGEXP = /{(\d+|[a-z$_][a-z\d$_]*?(?:\.[a-z\d$_]*?)*?)}/gi

export type Str = string

export namespace Str {
  export type Replacer = (substring: string, ...args: any[]) => string
}

export const of = (value: any) => String(value)

export const split = (sep: string) => (str: string) => str.split(sep)

export function replace(regexp: RegExp | string, replacer: string | Str.Replacer) {
  return (str: string) => str.replace(regexp, replacer as any)
}

export const template = (info: Dict<any>) => (str: string) => {
  return str.replace(BRACE_REGEXP, (_, key) =>
    pipe(
      key,
      split('.'),
      reduce((obj, prop) => (obj ? obj[prop] : ''), info),
      of
    )
  )
}

export const Str = {
  of,
  split,
  replace,
  template
}
