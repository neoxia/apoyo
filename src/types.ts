declare const _uuid: unique symbol
declare const _email: unique symbol
declare const _date: unique symbol
declare const _datetime: unique symbol
declare const _int: unique symbol
declare const _uint: unique symbol
declare const _NaN: unique symbol

interface UUIDBrand {
  readonly [_uuid]: unknown
}
interface EmailBrand {
  readonly [_email]: unknown
}
interface DateBrand {
  readonly [_date]: unknown
}
interface DatetimeBrand {
  readonly [_datetime]: unknown
}
interface IntBrand {
  readonly [_int]: unknown
}
interface UIntBrand {
  readonly [_uint]: unknown
}

interface NaNBrand {
  readonly [_NaN]: unknown
}

/**
 * An UUID
 */
export type uuid = string & UUIDBrand

/**
 * An email
 */
export type email = string & EmailBrand

/**
 * A date string with the following format:
 *
 * YYYY-MM-DD
 */
export type date = string & DateBrand

/**
 * An ISO datetime string with the following format:
 *
 * YYYY-MM-DD HH:mm:ssZ
 */
export type datetime = string & DatetimeBrand

/**
 * A number without a decimal point
 */
export type int = number & IntBrand

/**
 * A positive number without a decimal point
 */
export type uint = number & UIntBrand

export type NaN = number & NaNBrand

const REGEXP_EMAIL = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
const REGEXP_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const REGEXP_DATE = /^([0-9]{4}[-](0?[1-9]|1[0-2])[-](0?[1-9]|[12][0-9]|3[01]))$/
const REGEXP_DATETIME = /^([0-9]{4}[-](0?[1-9]|1[0-2])[-](0?[1-9]|[12][0-9]|3[01]))[T ]((0?[1-9]|[1][0-9]|2[0-3]):([0-5][0-9])(:([0-5][0-9])(\.\d+)?)?)Z?$/

export const isUUID = (str: string): str is uuid => REGEXP_UUID.test(str)
export const isEmail = (str: string): str is email => REGEXP_EMAIL.test(str)
export const isDateFormat = (str: string): str is date => REGEXP_DATE.test(str)
export const isDatetimeFormat = (str: string): str is datetime => REGEXP_DATETIME.test(str)
export const isInt = (nb: number): nb is int => nb % 1 === 0
export const isUInt = (nb: number): nb is uint => isInt(nb) && nb >= 0

export const isString = (value: unknown): value is string => typeof value === 'string'
export const isNumber = (value: unknown): value is number => typeof value === 'number'
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
export const isDate = (value: unknown): value is Date => value instanceof Date

export const isNaN = (value: number): value is NaN => Number.isNaN(value)
export const isNull = <A>(value: A | null): value is null => value === null
export const isUndefined = <A>(value: A | undefined): value is undefined => value === undefined

export const isObject = (input: unknown): input is Record<string | number | symbol, unknown> =>
  typeof input === 'object' && input !== null

export const isFunction = (input: unknown): input is Function => typeof input === 'function'
