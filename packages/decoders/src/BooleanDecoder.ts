import { pipe, Result } from '@apoyo/std'
import { DecodeError } from './DecodeError'
import { Decoder } from './Decoder'
import { ErrorCode } from './Errors'
import { IntegerDecoder } from './IntegerDecoder'
import { TextDecoder } from './TextDecoder'

export type BooleanDecoder<I> = Decoder<I, boolean>

const TEXT_TRUE = new Set(['true', 'yes', 'y', '1'])
const TEXT_FALSE = new Set(['false', 'no', 'no', '0'])

export const strict: BooleanDecoder<unknown> = Decoder.fromGuard(
  (input: unknown): input is boolean => typeof input === 'boolean',
  `value is not a boolean`,
  {
    code: ErrorCode.BOOL_STRICT
  }
)

export const fromString = pipe(
  TextDecoder.string,
  Decoder.parse((str) => {
    const low = str.toLowerCase()
    return TEXT_TRUE.has(low)
      ? Result.ok(true)
      : TEXT_FALSE.has(low)
      ? Result.ok(false)
      : Result.ko(DecodeError.value(str, `string is not a boolean`))
  }),
  Decoder.withMessage(`could not parse input string into a boolean`, {
    code: ErrorCode.BOOL_FROM_STRING
  })
)

export const fromNumber = pipe(
  IntegerDecoder.strict,
  Decoder.parse((nb) =>
    nb === 1
      ? Result.ok(true)
      : nb === 0
      ? Result.ok(false)
      : Result.ko(DecodeError.value(nb, `number is not a boolean`))
  ),
  Decoder.withMessage(`could not parse input number into a boolean`, {
    code: ErrorCode.BOOL_FROM_NUMBER
  })
)

export const boolean: BooleanDecoder<unknown> = pipe(
  Decoder.union(strict, fromString, fromNumber),
  Decoder.withMessage(`value is not a boolean`, {
    code: ErrorCode.BOOL
  })
)

export const equals = <T extends boolean>(bool: T) =>
  pipe(
    boolean,
    Decoder.filter((value): value is T => value === bool, `boolean is not ${bool}`, {
      code: ErrorCode.BOOL_EQUALS
    })
  )

/**
 * @namespace BooleanDecoder
 *
 * @description
 * This namespace contains boolean decoders and additional utilities for boolean validations.
 */
export const BooleanDecoder = {
  /**
   * @description
   * Check if the input is a boolean.
   *
   * This function is strict and does not autocast the input into a boolean.
   */
  strict,

  /**
   * @description
   * Check if the input is a boolean.
   *
   * This function will autocast the input into a boolean if possible.
   */
  boolean,

  /**
   * @description
   * Check if the boolean is true or false
   *
   * @example
   * ```
   * const decoder = BooleanDecoder.equals(true)
   *
   * expect(pipe(true, Decoder.validate(decoder), Result.isOk)).toBe(true)
   * expect(pipe(false, Decoder.validate(decoder), Result.isKo)).toBe(true)
   * ```
   */
  equals,

  /**
   * @description
   * Decodes an input from a string into a boolean:
   * - 'true', 'yes', 'y', '1' becomes true
   * - 'false', 'no', 'n', '0' becomes false
   *
   * Any other value will fail validation.
   *
   * @example
   * ```
   * expect(pipe('yes', Decoder.validate(BooleanDecoder.fromString), Result.get)).toBe(true)
   * ```
   */
  fromString,

  /**
   * @description
   * Decodes an input from a number into a boolean:
   * - 1 becomes true
   * - 0 becomes false
   *
   * Any other value will fail validation.
   *
   * @example
   * ```
   * expect(pipe(1, Decoder.validate(BooleanDecoder.fromNumber), Result.get)).toBe(true)
   * ```
   */
  fromNumber
}
