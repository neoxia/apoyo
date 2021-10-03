import { pipe } from '@apoyo/std'
import { Decoder } from './Decoder'
import { TextDecoder } from './TextDecoder'
import { ISO } from './types'

const REGEXP_DATE = /^([0-9]{4}[-](0?[1-9]|1[0-2])[-](0?[1-9]|[12][0-9]|3[01]))$/
const REGEXP_DATETIME = /^([0-9]{4}[-](0?[1-9]|1[0-2])[-](0?[1-9]|[12][0-9]|3[01]))[T ]((0?[1-9]|[1][0-9]|2[0-3]):([0-5][0-9])(:([0-5][0-9])(\.\d+)?)?)Z?$/

export const isDateFormat = (str: string): str is ISO.Date => REGEXP_DATE.test(str)
export const isDatetimeFormat = (str: string): str is ISO.Datetime => REGEXP_DATETIME.test(str)

export type DateDecoder<I, O extends ISO.Date | ISO.Datetime> = Decoder<I, O>

export const enum DateCode {
  DATE = 'date.date',
  DATETIME = 'date.datetime',
  NATIVE = 'date.native'
}

export const date = pipe(
  TextDecoder.string,
  Decoder.filter(isDateFormat, `string is not a date string`, {
    code: DateCode.DATE
  })
)
export const datetime = pipe(
  TextDecoder.string,
  Decoder.filter(isDatetimeFormat, `string is not a datetime string`, {
    code: DateCode.DATETIME
  })
)

export const native: Decoder<unknown, Date> = pipe(
  TextDecoder.string,
  Decoder.map((str) => new Date(str)),
  Decoder.filter((date): date is Date => !Number.isNaN(date.getTime()), `string is not a valid Date`, {
    code: DateCode.NATIVE
  })
)

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
   */
  date,

  /**
   * @description
   * Check if the input is a datetime.
   */
  datetime,

  /**
   * @description
   * Check if the input is a valid `Date` object.
   */
  native
}
