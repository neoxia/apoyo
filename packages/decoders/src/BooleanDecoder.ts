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

export const BooleanDecoder = {
  boolean,
  fromString,
  fromNumber
}