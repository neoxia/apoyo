import { pipe, Result } from '@apoyo/std'

import { DecodeError } from './DecodeError'
import { Decoder } from './Decoder'
import { ErrorCode } from './Errors'
import { TextDecoder } from './TextDecoder'

export type DateDecoder<I, O extends Date> = Decoder<I, O>

export const date = pipe(
  TextDecoder.date,
  Decoder.map((str) => new Date(str))
)
export const datetime = pipe(
  TextDecoder.datetime,
  Decoder.map((str) => new Date(str))
)

export const strict = Decoder.fromGuard(
  (input: unknown): input is Date => input instanceof Date,
  `input is not a Date object`,
  {
    code: ErrorCode.DATE_STRICT
  }
)

export const native: Decoder<unknown, Date> = pipe(
  TextDecoder.string,
  Decoder.map((str) => new Date(str)),
  Decoder.filter((date): date is Date => !Number.isNaN(date.getTime()), `string is not a valid Date`, {
    code: ErrorCode.DATE
  })
)

export const min = (minDate: Date | (() => Date)) =>
  Decoder.parse((input: Date) => {
    const min = typeof minDate === 'function' ? minDate() : minDate
    return input.getTime() >= min.getTime()
      ? Result.ok(input)
      : Result.ko(
          DecodeError.value(input, `date should be above ${min.toISOString()}`, {
            code: ErrorCode.DATE_MIN,
            min
          })
        )
  })

export const max = (maxDate: Date | (() => Date)) =>
  Decoder.parse((input: Date) => {
    const max = typeof maxDate === 'function' ? maxDate() : maxDate
    return input.getTime() <= max.getTime()
      ? Result.ok(input)
      : Result.ko(
          DecodeError.value(input, `date should be below ${max.toISOString()}`, {
            code: ErrorCode.DATE_MAX,
            max
          })
        )
  })

/**
 * @namespace DateDecoder
 *
 * @description
 * This namespace contains date decoders and additional utilities for date validations.
 */
export const DateDecoder = {
  /**
   * @description
   * Check if the input is a date.
   *
   * @example
   * ```ts
   * expect(pipe('2021-01-01', Decoder.validate(DateDecoder.date), Result.isOk)).toBe(true)
   * expect(pipe('2021-01-01 12:00:00', Decoder.validate(DateDecoder.date), Result.isKo)).toBe(true)
   * ```
   */
  date,

  /**
   * @description
   * Check if the input is a datetime.
   * @example
   * ```ts
   * expect(pipe('2021-01-01', Decoder.validate(DateDecoder.datetime), Result.isOk)).toBe(true)
   * expect(pipe('2021-01-01 12:00:00', Decoder.validate(DateDecoder.datetime), Result.isOk)).toBe(true)
   * expect(pipe('2021-01-01 12:00:00Z', Decoder.validate(DateDecoder.datetime), Result.isOk)).toBe(true)
   * ```
   */
  datetime,

  /**
   * @description
   * Check if the input is a valid `Date` object.
   *
   * @example
   * ```ts
   * expect(pipe(new Date('2021-01-01'), Decoder.validate(DateDecoder.strict), Result.isOk)).toBe(true)
   * expect(pipe('2021-01-01', Decoder.validate(DateDecoder.strict), Result.isKo)).toBe(true)
   * ```
   */
  strict,

  /**
   * @description
   * Check if the input can be cast to a valid `Date` object.
   *
   * expect(pipe(new Date('2021-01-01'), Decoder.validate(DateDecoder.native), Result.isOk)).toBe(true)
   * expect(pipe('2021-01-01', Decoder.validate(DateDecoder.native), Result.isOk)).toBe(true)
   * expect(pipe('2021-01-01 12:00:00Z', Decoder.validate(DateDecoder.native), Result.isOk)).toBe(true)
   */
  native,

  /**
   * @description
   * Check if the date is above a specific date
   *
   * @example
   * ```ts
   * // The date needs to be above the current date
   * const futureDate = pipe(
   *   Decoder.date,
   *   Decoder.min(() => {
   *     const today = new Date().toISOString().split('T')[0]
   *     return new Date(today)
   *   })
   * )
   * ```
   */
  min,

  /**
   * @description
   * Check if the date is above a specific date
   *
   * @example
   * ```ts
   * // The date cannot be above "now"
   * const futureDate = pipe(
   *   Decoder.datetime,
   *   Decoder.max(() => {
   *     const now = new Date()
   *     return now
   *   })
   * )
   * ```
   */
  max
}
