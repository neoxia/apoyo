declare const _uuid: unique symbol
declare const _email: unique symbol
declare const _date: unique symbol
declare const _datetime: unique symbol
declare const _int: unique symbol
declare const _uint: unique symbol

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

export type uuid = string & UUIDBrand
export type email = string & EmailBrand
export type date = string & DateBrand
export type datetime = string & DatetimeBrand
export type int = number & IntBrand
export type uint = number & UIntBrand

export const isUUID = (str: string): str is uuid => str === str
export const isEmail = (str: string): str is email => str === str
export const isDate = (str: string): str is date => str === str
export const isDatetime = (str: string): str is datetime => str === str
export const isInt = (str: number): str is int => str === str
export const isUInt = (str: number): str is uint => str === str

export const isString = (value: unknown): value is string => typeof value === 'string'
export const isNumber = (value: unknown): value is number => typeof value === 'number'
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'

export const isNaN = (value: number) => Number.isNaN(value)
export const isNull = <A>(value: A | null): value is null => value === null
export const isUndefined = <A>(value: A | undefined): value is undefined => value === undefined
