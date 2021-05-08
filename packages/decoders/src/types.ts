declare const _uuid: unique symbol
declare const _email: unique symbol
declare const _date: unique symbol
declare const _datetime: unique symbol
declare const _int: unique symbol

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

/**
 * An UUID
 */
export type UUID = string & UUIDBrand

/**
 * An email
 */
export type Email = string & EmailBrand

/**
 * A number without a decimal point
 */
export type Int = number & IntBrand

export namespace ISO {
  /**
   * A date string with the following format:
   *
   * YYYY-MM-DD
   */
  export type Date = string & DateBrand

  /**
   * An ISO datetime string with the following format:
   *
   * YYYY-MM-DD HH:mm:ssZ
   */
  export type Datetime = string & DatetimeBrand
}
