import { pipe, Result } from '@apoyo/std'
import { DecodeError } from './DecodeError'
import { Decoder } from './Decoder'
import { IntegerDecoder } from './IntegerDecoder'
import { TextDecoder } from './TextDecoder'

export type BooleanDecoder<I> = Decoder<I, boolean>

const TEXT_TRUE = new Set(['true', 'yes', 'y', '1'])
const TEXT_FALSE = new Set(['false', 'no', 'no', '0'])

export const boolean: BooleanDecoder<unknown> = Decoder.fromGuard(
  (input: unknown): input is boolean => typeof input === 'boolean',
  `value is not a boolean`
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
  })
)

export const fromNumber = pipe(
  IntegerDecoder.int,
  Decoder.parse((nb) =>
    nb === 1
      ? Result.ok(true)
      : nb === 0
      ? Result.ok(false)
      : Result.ko(DecodeError.value(nb, `number is not a boolean`))
  )
)

export const equals = <T extends boolean>(bool: T) =>
  pipe(
    boolean,
    Decoder.filter((value): value is T => value === bool, `boolean is not ${bool}`)
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
