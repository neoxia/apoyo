import { Arr, flow, pipe, Result } from '@apoyo/std'

import { DecodeError } from './DecodeError'
import { Decoder } from './Decoder'
import { ErrorCode } from './Errors'

export type ArrayDecoder<I, O extends any[]> = Decoder<I, O>

export const unknownArray = Decoder.fromGuard(Arr.isArray, `value is not an array`, {
  code: ErrorCode.ARRAY
})

export const array = <A>(decoder: Decoder<unknown, A>): ArrayDecoder<unknown, A[]> =>
  pipe(
    unknownArray,
    Decoder.parse((input) =>
      pipe(
        input,
        Arr.mapIndexed((value, index) =>
          pipe(
            value,
            Decoder.validate(decoder),
            Result.mapError((err) => DecodeError.index(index, err))
          )
        ),
        Arr.separate,
        ([success, errors]) => (errors.length > 0 ? Result.ko(DecodeError.array(errors)) : Result.ok(success))
      )
    )
  )

export const nonEmptyArray = <O>(decoder: Decoder<unknown, O>) =>
  pipe(
    array(decoder),
    Decoder.filter(Arr.isNonEmpty, `array should not be empty`, {
      code: ErrorCode.ARRAY_NON_EMPTY
    })
  )

export const length = (len: number) =>
  Decoder.filter((arr: unknown[]) => arr.length === len, `array should contain exactly ${len} elements`, {
    code: ErrorCode.ARRAY_LENGTH,
    length: len
  }) as {
    <D extends ArrayDecoder<any, any>>(value: D): D
  }

export const min = (minLength: number) =>
  Decoder.filter((arr: unknown[]) => arr.length >= minLength, `array should contain at least ${minLength} elements`, {
    code: ErrorCode.ARRAY_MIN,
    minLength
  }) as {
    <D extends ArrayDecoder<any, any>>(value: D): D
  }

export const max = (maxLength: number) =>
  Decoder.filter((arr: unknown[]) => arr.length <= maxLength, `array should contain at most ${maxLength} elements`, {
    code: ErrorCode.ARRAY_MAX,
    maxLength
  }) as {
    <D extends ArrayDecoder<any, any>>(value: D): D
  }

export const between = (minLength: number, maxLength: number) => flow(min(minLength), max(maxLength))

/**
 * @namespace ArrayDecoder
 *
 * @description
 * This namespace contains array decoders and additional utilities for array validations.
 */
export const ArrayDecoder = {
  /**
   * @description
   * Check if the input is an array.
   */
  unknownArray,

  /**
   * @description
   * Check if the input is an array of a given type.
   */
  array,

  /**
   * @description
   * Check if the input is a non empty array of a given type.
   */
  nonEmptyArray,

  /**
   * @description
   * Check the length of the string
   */
  length,

  /**
   * @description
   * Check the minimum length of the array
   *
   * @example
   * ```ts
   * const decoder = pipe(
   *   ArrayDecoder.array(NumberDecoder.number),
   *   ArrayDecoder.min(1)
   * )
   *
   * expect(pipe([1], Decoder.validate(decoder), Result.isOk)).toBe(true)
   * expect(pipe([], Decoder.validate(decoder), Result.isKo)).toBe(true)
   * ```
   */
  min,

  /**
   * @description
   * Check the maximum length of the array
   *
   * @example
   * ```ts
   * const decoder = pipe(
   *   ArrayDecoder.array(NumberDecoder.number),
   *   ArrayDecoder.max(5)
   * )
   *
   * expect(pipe([1,2,3,4,5], Decoder.validate(decoder), Result.isOk)).toBe(true)
   * expect(pipe([1,2,3,4,5,6], Decoder.validate(decoder), Result.isKo)).toBe(true)
   * ```
   */
  max,

  /**
   * @description
   * Check both the minimum and maximum length of the array
   *
   * @example
   * ```ts
   * const decoder = pipe(
   *   ArrayDecoder.array(NumberDecoder.number),
   *   ArrayDecoder.between(1, 5)
   * )
   *
   * expect(pipe([], Decoder.validate(decoder), Result.isKo)).toBe(true)
   * ```
   */
  between
}
