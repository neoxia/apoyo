import type { Dict } from './Dict'

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

export const isEmpty = (str: string) => str.length === 0

export function oneOf<T extends string>(arr: T[]): (value: string) => value is T
export function oneOf<T extends string>(arr: Set<T>): (value: string) => value is T
export function oneOf(arr: string[] | Set<string>): any {
  const set = new Set(arr)
  return (str: string) => set.has(str)
}

export const concat = (append: string) => (str: string) => str + append

export const split = (sep: string) => (str: string) => str.split(sep)

export const lower = (str: string) => str.toLowerCase()
export const upper = (str: string) => str.toUpperCase()
export const capitalize = (str: string) => str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase()

export const truncate = (maxLength: number, suffix = '...') => (str: string) =>
  str.length > maxLength ? str.slice(0, maxLength) + suffix : str

export const replace = (regexp: RegExp | string, replacer: string | Str.Replacer) => (str: string) =>
  str.replace(regexp, replacer as any)

export const replaceAll = (regexp: string, replacer: string | Str.Replacer) =>
  replace(new RegExp(regexp, 'g'), replacer)

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

export const WHITESPACE_CHARS = [
  ' ',
  '\f',
  '\n',
  '\r',
  '\t',
  '\v',
  '\u00a0',
  '\u1680',
  '\u2000',
  '\u200a',
  '\u2028',
  '\u2029',
  '\u202f',
  '\u205f',
  '\u3000',
  '\ufeff'
]

export const trimWhile = (fn: (char: string) => boolean) => {
  return (str: string) => {
    let start = 0
    let end = str.length

    while (start < end && fn(str[start])) ++start
    while (end > start && fn(str[end - 1])) --end
    return start > 0 || end < str.length ? str.substring(start, end) : str
  }
}

export const isWhitespace = oneOf(WHITESPACE_CHARS)

export const trim = trimWhile(isWhitespace)

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
   * Predicate to verify if the string is empty or not
   */
  isEmpty,

  /**
   * @description
   * Checks if string is one of the given values
   * This function can also act as a literal string type guard
   *
   * @example
   * ```ts
   * const isMouseEvent = Str.oneOf(['click', 'hover', 'focus'] as const)
   *
   * expect(isMouseEvent('click')).toBe(true)
   * expect(isMouseEvent('unknown')).toBe(false)
   * ```
   */
  oneOf,

  /**
   * @description
   * Concatenate a second string at the end of the given string
   */
  concat,

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
   * Replace first occurence (or all if a global RegExp has been specified) in a string.
   * This function is the pipeable equivalent to the native replace function.
   *
   * @example
   * ```ts
   * const str = pipe(
   *   'Hello John, John',
   *   Str.replace('John', 'Doe')
   * )
   *
   * expect(str).toBe('Hello Doe, John')
   * ```
   */
  replace,

  /**
   * @description
   * Replace all occurences in a string.
   * This function is the pipeable equivalent to the native replaceAll function.
   *
   * @example
   * ```ts
   * const str = pipe(
   *   'Hello John, John',
   *   Str.replaceAll('John', 'Doe')
   * )
   *
   * expect(str).toBe('Hello Doe, Doe')
   * ```
   */
  replaceAll,

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
  eq,

  /**
   * @description
   * Check if the given character is a whitespace character.
   */
  isWhitespace,

  /**
   * @description
   * Trim the start and the end of the string until the predicate returns true.
   *
   * @see `Str.trim`
   *
   * @example
   * ```ts
   * const trimmed = pipe(
   *   '|Hello|World|||',
   *   Str.trimWhile(Str.eq('|'))
   * )
   *
   * expect(trimmed).toBe('Hello|World')
   * ```
   */
  trimWhile,

  /**
   * @description
   * Trims all whitespaces characters at the start and the end of the string.
   *
   * @see `Str.trimWhile`
   *
   * @example
   * ```ts
   * const trimmed = pipe(
   *   '    Hello  world   ',
   *   Str.trim
   * )
   *
   * expect(trimmed).toBe('Hello  world')
   * ```
   */
  trim
}
