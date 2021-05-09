import { pipe } from '@apoyo/std'
import { Decoder } from './Decoder'
import { NumberDecoder } from './NumberDecoder'
import { Int } from './types'

export type IntegerDecoder<I> = Decoder<I, Int>

export const int: IntegerDecoder<unknown> = pipe(
  NumberDecoder.number,
  Decoder.filter((nb): nb is Int => nb % 1 === 0, `number is not a integer`)
)

export const fromString = pipe(NumberDecoder.fromString, Decoder.parse(int))

export const min = NumberDecoder.min as (minimum: number) => <I>(decoder: IntegerDecoder<I>) => IntegerDecoder<I>
export const max = NumberDecoder.max as (maximum: number) => <I>(decoder: IntegerDecoder<I>) => IntegerDecoder<I>

export const between = NumberDecoder.between as (
  minimum: number,
  maximum: number
) => <I>(decoder: IntegerDecoder<I>) => IntegerDecoder<I>

export const positive = pipe(int, min(0))

export const range = (minimum: number, maximum: number) => pipe(int, between(minimum, maximum))

export const IntegerDecoder = {
  int,
  min,
  max,
  between,
  range,
  positive,
  fromString
}
