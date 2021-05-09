import { flow, pipe } from '@apoyo/std'
import { Decoder } from './Decoder'
import { TextDecoder } from './TextDecoder'

export type NumberDecoder<I> = Decoder<I, number>

export const number: NumberDecoder<unknown> = Decoder.fromGuard(
  (input: unknown): input is number => typeof input === 'number' && !Number.isNaN(input),
  `value is not a number`
)

export const fromString = pipe(TextDecoder.string, Decoder.map(parseFloat), Decoder.parse(number))

export const min = (minimum: number) =>
  Decoder.filter((input: number) => input >= minimum, `number should be greater or equal than ${minimum}`, {
    minimum
  })

export const max = (maximum: number) =>
  Decoder.filter((input: number) => input <= maximum, `number should be lower or equal than ${maximum}`, {
    maximum
  })

export const between = (minimum: number, maximum: number) => flow(min(minimum), max(maximum))
export const range = (minimum: number, maximum: number) => pipe(number, between(minimum, maximum))

export const NumberDecoder = {
  number,
  min,
  max,
  between,
  range,
  fromString
}
