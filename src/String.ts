import { Dict } from './Dict'
import { flow } from './flow'
import { property } from './Object'
import * as O from './Ord'
import { pipe } from './pipe'

const DOUBLE_BRACE_REGEXP = /{{(\d+|[a-z$_][a-z\d$_]*?(?:\.[a-z\d$_]*?)*?)}}/gi
const BRACE_REGEXP = /{(\d+|[a-z$_][a-z\d$_]*?(?:\.[a-z\d$_]*?)*?)}/gi

export type Str = string

export namespace Str {
  export type Replacer = (substring: string, ...args: any[]) => string
}

export const of = (value: any) => String(value)

export const length = (str: string) => str.length

export const split = (sep: string) => (str: string) => str.split(sep)

export const lower = (str: string) => str.toLowerCase()
export const upper = (str: string) => str.toUpperCase()
export const capitalize = (str: string) => str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase()

export const truncate = (maxLength: number, suffix = '...') => (str: string) =>
  str.length > maxLength ? str.slice(0, maxLength) + suffix : str

export const replace = (regexp: RegExp | string, replacer: string | Str.Replacer) => (str: string) =>
  str.replace(regexp, replacer as any)

export const regexpEscape = flow(replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'), replace(/-/g, '\\x2d'))

export const htmlEscape = flow(
  replace(/&/g, '&amp;'),
  replace(/"/g, '&quot;'),
  replace(/'/g, '&#39;'),
  replace(/`/g, '&#x60;'),
  replace(/</g, '&lt;'),
  replace(/>/g, '&gt;')
)

export const htmlUnescape = flow(
  replace(/&gt;/g, '>'),
  replace(/&lt;/g, '<'),
  replace(/&#x60;/g, '`'),
  replace(/&#0?39;/g, "'"),
  replace(/&quot;/g, '"'),
  replace(/&amp;/g, '&')
)

export const template = (info: Dict<any>) =>
  flow(
    replace(DOUBLE_BRACE_REGEXP, (_, key) => pipe(info, property(key), of, htmlEscape)),
    replace(BRACE_REGEXP, (_, key) => pipe(info, property(key), of))
  )

export const eq = pipe(O.string, O.eq)

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
   * Return length of the string
   */
  length,

  /**
   * @description
   * Lowercase string
   *
   * @see `upper`
   * @see `capitalize`
   *
   * @example
   * ```
   * const str = Str.lower('TeST')
   * expect(str).toBe('test')
   * ```
   */
  lower,

  /**
   * @description
   * Uppercase string
   *
   * @see `lower`
   * @see `capitalize`
   *
   * @example
   * ```
   * const str = Str.upper('TeST')
   * expect(str).toBe('TEST')
   * ```
   */
  upper,

  /**
   * @description
   * Capitalize first character of the string, while lowercasing everything else
   *
   * @see `lower`
   * @see `upper`
   *
   * @example
   * ```
   * const str = Str.capitalize('teST')
   * expect(str).toBe('Test')
   * ```
   */
  capitalize,

  /**
   * @description
   * Truncate string by given length
   *
   * @param maxLength - Max length of the string before being truncated
   * @param suffix - Chars to append when the string is truncated
   *
   * @example
   * ```ts
   * const line = `Lorem quis sit duis cupidatat elit ut fugiat ea enim exercitation.`
   * const truncated = pipe(line, Str.truncate(20))
   *
   * expect(truncated).toBe('Lorem quis sit duis ...')
   * ```
   */
  truncate,

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
   * This function has been inspired by:
   * https://github.com/sindresorhus/pupa
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
   * Escape regexp string
   *
   * This function has been inspired by:
   * https://github.com/sindresorhus/escape-string-regexp
   *
   * @example
   * ```
   * const escaped = 'How much $ for a 🦄?'
   * const regexp = new RegExp(escaped)
   *
   * expect(escaped).toBe('How much \\$ for a 🦄\\?')
   * ```
   */
  regexpEscape,

  /**
   * @description
   * Escape HTML sensible characters
   *
   * This function has been inspired by:
   * https://github.com/sindresorhus/escape-goat
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
   * This function has been inspired by:
   * https://github.com/sindresorhus/escape-goat
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
  htmlUnescape,

  /**
   * @description
   * Checks if the element is equal to the given string
   *
   * This function is curryable
   *
   * @see `Ord.eq` - If you want to compare other types
   *
   * @example
   * ```ts
   * const isSmith = Str.eq('John', 'Smith')
   *
   * expect(isSmith).toBe(false)
   *
   * const names = ['John', 'Doe', 'Smith']
   * const john = pipe(
   *   names,
   *   Arr.find(Str.eq('John'))
   * )
   *
   * expect(john).toBe('John')
   *
   * const hasDoe = pipe(
   *   names,
   *   Arr.includes(Str.eq('Doe'))
   * )
   *
   * expect(hasDoe).toBe(true)
   * ```
   */
  eq
}
