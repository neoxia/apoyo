import { Decoder, DecodeError, ArrayDecoder } from '@apoyo/decoders'
import { pipe, Arr, Result, NonEmptyArray } from '@apoyo/std'

export function tuple<T1>(a: Decoder<unknown, T1>): Decoder<unknown, [T1]>
export function tuple<T1, T2>(a: Decoder<unknown, T1>, b: Decoder<unknown, T2>): Decoder<unknown, [T1, T2]>
export function tuple(...members: NonEmptyArray<Decoder<unknown, unknown>>): Decoder<unknown, unknown[]> {
  return Decoder.create((input: unknown) => {
    if (!Array.isArray(input)) {
      return Result.ko(
        DecodeError.value(input, `input is not a tuple`, {
          code: `invalid_type`
        })
      )
    }
    if (input.length !== members.length) {
      return Result.ko(
        DecodeError.value(input, `tuple has invalid length`, {
          code: `invalid_length`
        })
      )
    }
    const [ok, errors] = pipe(
      members,
      Arr.mapIndexed((decoder, index) => {
        return pipe(
          decoder.decode(input[index]),
          Result.mapError((err) => DecodeError.index(index, err))
        )
      }),
      Arr.separate
    )
    return errors.length > 0 ? Result.ko(DecodeError.array(errors)) : Result.ok(ok)
  })
}

export function tupleV2<T1>(a: Decoder<unknown, T1>): Decoder<unknown, [T1]>
export function tupleV2<T1, T2>(a: Decoder<unknown, T1>, b: Decoder<unknown, T2>): Decoder<unknown, [T1, T2]>
export function tupleV2(...members: NonEmptyArray<Decoder<unknown, unknown>>): Decoder<unknown, unknown[]> {
  return pipe(
    ArrayDecoder.unknownArray,
    ArrayDecoder.length(members.length),
    Decoder.parse((input) => {
      const [ok, errors] = pipe(
        members,
        Arr.mapIndexed((decoder, index) =>
          pipe(
            input[index],
            Decoder.validate(decoder),
            Result.mapError((err) => DecodeError.index(index, err))
          )
        ),
        Arr.separate
      )
      return errors.length > 0 ? Result.ko(DecodeError.array(errors)) : Result.ok(ok)
    })
  )
}
