import { Arr, pipe, Result } from '@apoyo/std'
import { DecodeError } from './DecodeError'
import { Decoder } from './Decoder'

export type ArrayDecoder<I, O extends any[]> = Decoder<I, O>

export const unknownArray = Decoder.fromGuard(Arr.isArray, `value is not an array`)

export const array = <A>(decoder: Decoder<unknown, A>): ArrayDecoder<unknown, A[]> =>
  pipe(
    unknownArray,
    Decoder.parse((input) =>
      pipe(
        input,
        Arr.mapIndexed((value, index) =>
          pipe(
            value,
            decoder,
            Result.mapError((err) => DecodeError.index(index, err))
          )
        ),
        Arr.separate,
        ([success, errors]) => (errors.length > 0 ? Result.ko(DecodeError.array(errors)) : Result.ok(success))
      )
    )
  )

export const nonEmptyArray = <O>(decoder: Decoder<unknown, O>) =>
  pipe(array(decoder), Decoder.filter(Arr.isNonEmpty, `array should not be empty`))

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
  nonEmptyArray
}
