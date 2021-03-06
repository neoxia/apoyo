import { flow, pipe } from '@apoyo/std'
import { Decoder } from './Decoder'
import { ErrorCode } from './Errors'
import { TextDecoder } from './TextDecoder'

export type NumberDecoder<I> = Decoder<I, number>

export const strict: NumberDecoder<unknown> = Decoder.fromGuard(
  (input: unknown): input is number => typeof input === 'number' && !Number.isNaN(input),
  `value is not a number`,
  {
    code: ErrorCode.NUMBER_STRICT
  }
)

export const fromString = pipe(
  TextDecoder.string,
  Decoder.map(parseFloat),
  Decoder.chain(() => strict),
  Decoder.withMessage(`could not parse input string into a number`, {
    code: ErrorCode.NUMBER_FROM_STRING
  })
)

export const number: NumberDecoder<unknown> = pipe(
  Decoder.union(strict, fromString),
  Decoder.withMessage(`value is not a number`, {
    code: ErrorCode.NUMBER
  })
)

export const min = (minimum: number) =>
  Decoder.filter((input: number) => input >= minimum, `number should be greater or equal than ${minimum}`, {
    code: ErrorCode.NUMBER_MIN,
    minimum
  })

export const max = (maximum: number) =>
  Decoder.filter((input: number) => input <= maximum, `number should be lower or equal than ${maximum}`, {
    code: ErrorCode.NUMBER_MAX,
    maximum
  })

export const between = (minimum: number, maximum: number) => flow(min(minimum), max(maximum))
export const range = (minimum: number, maximum: number) => pipe(number, between(minimum, maximum))

/**
 * @namespace NumberDecoder
 *
 * @description
 * This namespace contains number decoders and additional utilities for number validations.
 */
export const NumberDecoder = {
  /**
   * @description
   * Check if the input is a number.
   * If the number is NaN, the number will fail validation.
   *
   * This function is strict and does not autocast the input into a number.
   */
  strict,

  /**
   * @description
   * Check if the input is a number.
   * If the number is NaN, the number will fail validation.
   *
   * This function will autocast the input into a number if possible.
   */
  number,

  /**
   * @description
   * Check if the number is equal or greater to the given minimum
   *
   * @example
   * ```ts
   * const decoder = pipe(
   *   NumberDecoder.number,
   *   NumberDecoder.min(1)
   * )
   *
   * expect(pipe(1, Decoder.validate(decoder), Result.isOk)).toBe(true)
   * expect(pipe(0, Decoder.validate(decoder), Result.isKo)).toBe(true)
   * ```
   */
  min,

  /**
   * @description
   * Check if the number is equal or greater to the given minimum
   *
   * @example
   * ```ts
   * const decoder = pipe(
   *   NumberDecoder.number,
   *   NumberDecoder.max(100)
   * )
   *
   * expect(pipe(100, Decoder.validate(decoder), Result.isOk)).toBe(true)
   * expect(pipe(101, Decoder.validate(decoder), Result.isKo)).toBe(true)
   * ```
   */
  max,

  /**
   * @description
   * Check if the number is between to the given minimum and maximum
   *
   * @example
   * ```ts
   * const decoder = pipe(
   *   NumberDecoder.number,
   *   NumberDecoder.between(1, 100)
   * )
   *
   * expect(pipe(1, Decoder.validate(decoder), Result.isOk)).toBe(true)
   * expect(pipe(100, Decoder.validate(decoder), Result.isOk)).toBe(true)
   * expect(pipe(0, Decoder.validate(decoder), Result.isKo)).toBe(true)
   * expect(pipe(101, Decoder.validate(decoder), Result.isKo)).toBe(true)
   * ```
   */
  between,

  /**
   * @description
   * Check if the input is a number between the given minimum and maximum.
   *
   * @example
   * ```ts
   * // The following:
   * const decoder = NumberDecoder.range(1, 100)
   * // is the same as:
   * const decoder = pipe(NumberDecoder.number, NumberDecoder.between(1, 100))
   * ```
   */
  range,

  /**
   * @description
   * Decodes an input from a string into a number.
   *
   * @example
   * ```
   * expect(pipe('10.13', Decoder.validate(NumberDecoder.fromString), Result.get)).toBe(10.13)
   * expect(pipe('Hello', Decoder.validate(NumberDecoder.fromString), Result.isKo)).toBe(true)
   * ```
   */
  fromString
}
