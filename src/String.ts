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

/**
 * @namespace Str
 *
 * @description
 * This namespace contains commonly used utilities for Strings, as well as pipeable versions of already existing String methods.
 */
export const Str = {
  /**
   * @description
   * Transform value to string
   */
  of,

  /**
   * @description
   * Split string by given separator.
   * This function is the pipeable equivalent to the native split function.
   *
   * @example
   * ```ts
   * const fileName = pipe(
   *   'path/to/file.txt',
   *   Str.split('/'),
   *   Arr.last
   * )
   *
   * expect(fileName).toBe('file.txt')
   * ```
   */
  split,

  /**
   * @description
   * Replace occurences in a string.
   * This function is the pipeable equivalent to the native replace function.
   *
   * @example
   * ```ts
   * const str = pipe(
   *   'Hello John',
   *   Str.replace('John', 'Doe')
   * )
   *
   * expect(str).toBe('Hello Doe')
   * ```
   */
  replace,

  /**
   * @description
   * Simple string templating
   *
   * @example
   * ```ts
   * const message = Str.template(`Hello {name}!`, {
   *   name: "John"
   * })
   * ```
   */
  template,

  /**
   * @description
   * Escape HTML sensible characters
   *
   * @see `Str.htmlUnescape`
   *
   * @example
   * ```ts
   * const escaped = Str.htmlEscape(`<script>window.alert("Hello")</script>`)
   *
   * expect(escaped).toBe('&lt;script&gt;window.alert(&quot;Hello&quot;)&lt;/script&gt;')
   * ```
   */
  htmlEscape,

  /**
   * @description
   *
   * Unescape an HTML escaped string
   *
   * @see `Str.htmlEscape`
   *
   * @example
   * ```ts
   * const unescaped = Str.htmlUnescape('&lt;script&gt;window.alert(&quot;Hello&quot;)&lt;/script&gt;')
   *
   * expect(unescaped).toBe(`<script>window.alert("Hello")</script>`)
   * ```
   */
  htmlUnescape
}
