import { pipe } from '@apoyo/std'
import { Decoder } from './Decoder'
import { NumberDecoder } from './NumberDecoder'
import { Int } from './types'

export type IntegerDecoder<I> = Decoder<I, Int>

export const strict: IntegerDecoder<unknown> = pipe(
  NumberDecoder.strict,
  Decoder.filter((nb): nb is Int => nb % 1 === 0, `number is not a integer`)
)

export const fromString = pipe(
  NumberDecoder.fromString,
  Decoder.chain(() => strict)
)

export const int: IntegerDecoder<unknown> = pipe(
  Decoder.union(strict, fromString),
  Decoder.withMessage(`value is not a integer`)
)

export const min = NumberDecoder.min as (minimum: number) => <I>(decoder: IntegerDecoder<I>) => IntegerDecoder<I>
export const max = NumberDecoder.max as (maximum: number) => <I>(decoder: IntegerDecoder<I>) => IntegerDecoder<I>

export const between = NumberDecoder.between as (
  minimum: number,
  maximum: number
) => <I>(decoder: IntegerDecoder<I>) => IntegerDecoder<I>

export const positive = pipe(int, min(0))

export const range = (minimum: number, maximum: number) => pipe(int, between(minimum, maximum))

/**
 * @namespace IntegerDecoder
 *
 * @description
 * This namespace contains integer decoders and additional utilities for integer validations.
 */
export const IntegerDecoder = {
  /**
   * @description
   * Check if the input is an integer.
   * If the integer is NaN or contains decimals, the number will fail validation.
   *
   * This function is strict and does not autocast the input into a number.
   */
  strict,

  /**
   * @description
   * Check if the input is an integer.
   * If the integer is NaN or contains decimals, the number will fail validation.
   *
   * This function will autocast the input into a number if possible.
   */
  int,

  /**
   * @description
   * Check if the number is equal or greater to the given minimum
   *
   * @example
   * ```ts
   * const decoder = pipe(
   *   IntegerDecoder.number,
   *   IntegerDecoder.min(1)
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
   *   IntegerDecoder.number,
   *   IntegerDecoder.max(100)
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
   *   IntegerDecoder.number,
   *   IntegerDecoder.between(1, 100)
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
   * const decoder = IntegerDecoder.range(1, 100)
   * // is the same as:
   * const decoder = pipe(IntegerDecoder.number, IntegerDecoder.between(1, 100))
   * ```
   */
  range,

  /**
   * @description
   * Check if the input is a positive integer.
   * If the integer is NaN or contains decimals, the number will fail validation.
   */
  positive,

  /**
   * @description
   * Decodes an input from a string into an integer.
   *
   * @example
   * ```
   * expect(pipe('10', Decoder.validate(IntegerDecoder.fromString), Result.get)).toBe(10)
   * expect(pipe('Hello', Decoder.validate(IntegerDecoder.fromString), Result.isKo)).toBe(true)
   * ```
   */
  fromString
}
