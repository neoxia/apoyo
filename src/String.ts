import { Dict } from './Dict'
import { property } from './Object'
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

export const htmlEscape = (string: string) =>
  string
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#x60;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

export const htmlUnescape = (htmlString: string) =>
  htmlString
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&#x60;/g, '`')
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')

export const template = (info: Dict<any>) => (str: string) => {
  return str.replace(BRACE_REGEXP, (_, key) => pipe(info, property(key), of))
}

export const Str = {
  of,
  split,
  replace,
  template,
  htmlEscape,
  htmlUnescape
}
