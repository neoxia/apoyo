import { flow, pipe, Str } from '@apoyo/std'
import { Decoder } from './Decoder'
import { ErrorCode } from './Errors'
import { Email, UUID } from './types'

const REGEXP_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const REGEXP_EMAIL =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/

export type TextDecoder<I> = Decoder<I, string>

export const string: TextDecoder<unknown> = Decoder.fromGuard(
  (input: unknown): input is string => typeof input === 'string',
  `value is not a string`,
  {
    code: ErrorCode.STRING
  }
)

export const length = (len: number) =>
  Decoder.filter((input: string) => input.length === len, `string should contain exactly ${len} characters`, {
    code: ErrorCode.STRING_LENGTH,
    length: len
  })

export const min = (minLength: number) =>
  Decoder.filter(
    (input: string) => input.length >= minLength,
    `string should contain at least ${minLength} characters`,
    {
      code: ErrorCode.STRING_MIN,
      minLength
    }
  )

export const max = (maxLength: number) =>
  Decoder.filter(
    (input: string) => input.length <= maxLength,
    `string should contain at most ${maxLength} characters`,
    {
      code: ErrorCode.STRING_MAX,
      maxLength
    }
  )

export const between = (minLength: number, maxLength: number) => flow(min(minLength), max(maxLength))

export const varchar = (minLength: number, maxLength: number) => pipe(string, between(minLength, maxLength))

export const nullable = flow(
  Decoder.map((str: string) => (str.length === 0 ? null : str)),
  Decoder.nullable
)

export const optional = flow(
  Decoder.map((str: string) => (str.length === 0 ? undefined : str)),
  Decoder.optional
)

export const trim = Decoder.map(Str.trim)
export const htmlEscape = Decoder.map(Str.htmlEscape)

export const email = pipe(
  string,
  Decoder.filter((str): str is Email => REGEXP_EMAIL.test(str), `string is not an email`, {
    code: ErrorCode.STRING_EMAIL
  })
)

export const uuid = pipe(
  string,
  Decoder.filter((str): str is UUID => REGEXP_UUID.test(str), `string is not an uuid`, {
    code: ErrorCode.STRING_UUID
  })
)

export const equals = <T extends string>(value: T) =>
  pipe(
    string,
    Decoder.filter((str): str is T => str === value, `string is not equal to value ${JSON.stringify(value)}`, {
      code: ErrorCode.STRING_EQUALS
    })
  )

export function oneOf<T extends string>(arr: T[]): Decoder<unknown, T>
export function oneOf<T extends string>(arr: Set<T>): Decoder<unknown, T>
export function oneOf(arr: string[] | Set<string>): any {
  const set = new Set(arr)
  return pipe(
    string,
    Decoder.filter((str: string) => set.has(str), `string is not included in the given values`, {
      code: ErrorCode.STRING_ONE_OF,
      values: arr
    })
  )
}

/**
 * @namespace TextDecoder
 *
 * @description
 * This namespace contains string decoders and additional utilities for string validations.
 */
export const TextDecoder = {
  /**
   * @description
   * Check if the input is a string
   */
  string,

  /**
   * @description
   * Check the length of the string
   */
  length,

  /**
   * @description
   * Check the minimum length of the string
   *
   * @example
   * ```ts
   * const decoder = pipe(
   *   TextDecoder.string,
   *   TextDecoder.min(1)
   * )
   *
   * expect(pipe('1', Decoder.validate(decoder), Result.isOk)).toBe(true)
   * expect(pipe('', Decoder.validate(decoder), Result.isKo)).toBe(true)
   * ```
   */
  min,

  /**
   * @description
   * Check the maximum length of the string
   *
   * @example
   * ```ts
   * const decoder = pipe(
   *   TextDecoder.string,
   *   TextDecoder.max(5)
   * )
   *
   * expect(pipe('12345', Decoder.validate(decoder), Result.isOk)).toBe(true)
   * expect(pipe('123456', Decoder.validate(decoder), Result.isKo)).toBe(true)
   * ```
   */
  max,

  /**
   * @description
   * Check both the minimum and maximum length of the string
   *
   * @example
   * ```ts
   * const decoder = pipe(
   *   TextDecoder.string,
   *   TextDecoder.between(1, 100)
   * )
   *
   * expect(pipe('', Decoder.validate(decoder), Result.isKo)).toBe(true)
   * ```
   */
  between,

  /**
   * @description
   * Trim the string
   *
   * @example
   * ```ts
   * const decoder = pipe(
   *   TextDecoder.string,
   *   TextDecoder.trim,
   *   TextDecoder.between(1, 100)
   * )
   *
   * expect(pipe('     ', Decoder.validate(decoder), Result.isKo)).toBe(true)
   * ```
   */
  trim,

  /**
   * @description
   * Check if the input is an email
   *
   * @example
   * ```ts
   * expect(pipe("test@example.com", Decoder.validate(TextDecoder.email), Result.isOk)).toBe(true)
   * expect(pipe("test", Decoder.validate(TextDecoder.email), Result.isKo)).toBe(true)
   * ```
   */
  email,

  /**
   * @description
   * Check if the input is an UUID
   */
  uuid,

  /**
   * @description
   * Check if the input is a string between the given length.
   *
   * @example
   * ```ts
   * // The following:
   * const decoder = TextDecoder.varchar(1, 100)
   * // is the same as:
   * const decoder = pipe(TextDecoder.string, TextDecoder.between(1, 100))
   * ```
   */
  varchar,

  /**
   * @description
   * This makes the string nullable. If the string is empty, `null` is returned.
   *
   * @see `TextDecoder.optional`
   * @see `Decoder.nullable`
   *
   * @example
   * ```ts
   * const decoder = pipe(TextDecoder.string, TextDecoder.nullable)
   *
   * expect(pipe("Hello", Decoder.validate(decoder), Result.get)).toBe("Hello")
   * expect(pipe(null, Decoder.validate(decoder), Result.get)).toBe(null)
   * expect(pipe("", Decoder.validate(decoder), Result.get)).toBe(null)
   * ```
   */
  nullable,

  /**
   * @description
   * This makes the string optional (allows `undefined`). If the string is empty, `undefined` is returned.
   *
   * @see `TextDecoder.nullable`
   * @see `Decoder.optional`
   *
   * @example
   * ```ts
   * const decoder = pipe(TextDecoder.string, TextDecoder.optional)
   *
   * expect(pipe("Hello", Decoder.validate(decoder), Result.get)).toBe("Hello")
   * expect(pipe(undefined, Decoder.validate(decoder), Result.get)).toBe(undefined)
   * expect(pipe("", Decoder.validate(decoder), Result.get)).toBe(undefined)
   * ```
   */
  optional,

  /**
   * @deprecated Use `EnumDecoder.isIn` instead.
   *
   * @description
   * Check if the string is included in the given values
   *
   * @example
   * ```ts
   * const decoder = TextDecoder.oneOf(['todo', 'in-progress', 'done', 'archived'] as const)
   *
   * expect(pipe("todo", Decoder.validate(decoder), Result.isOk)).toBe(true)
   * expect(pipe("unknown", Decoder.validate(decoder), Result.isKo)).toBe(true)
   * ```
   */
  oneOf,

  /**
   * @deprecated Use `EnumDecoder.literal` instead.
   *
   * @description
   * Check if the string is included in the given values
   *
   * @example
   * ```ts
   * const decoder = TextDecoder.equals('ongoing')
   *
   * expect(pipe("todo", Decoder.validate(decoder), Result.isOk)).toBe(true)
   * expect(pipe("unknown", Decoder.validate(decoder), Result.isKo)).toBe(true)
   * ```
   */
  equals,

  /**
   * @description
   * Escapes the HTML in the string.
   *
   * @example
   * ```ts
   * const decoder = pipe(
   *   TextDecoder.string,
   *   TextDecoder.trim,
   *   TextDecoder.htmlEscape,
   *   TextDecoder.between(1, 2000)
   * )
   *
   * const escaped = pipe(
   *   "<script>window.alert("Hello")</script>",
   *   Decoder.validate(decoder),
   *   Result.get
   * )
   *
   * expect(escaped).toBe('&lt;script&gt;window.alert(&quot;Hello&quot;)&lt;/script&gt;')
   * ```
   */
  htmlEscape
}
