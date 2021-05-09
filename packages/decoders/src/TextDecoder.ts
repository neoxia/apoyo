import { flow, pipe, Str } from '@apoyo/std'
import { Decoder } from './Decoder'
import { Email, UUID } from './types'

const REGEXP_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const REGEXP_EMAIL = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/

export type TextDecoder<I> = Decoder<I, string>

export const string: TextDecoder<unknown> = Decoder.fromGuard(
  (input: unknown): input is string => typeof input === 'string',
  `value is not a string`
)

export const min = (minLength: number) =>
  Decoder.filter(
    (input: string) => input.length >= minLength,
    `string should contain at least ${minLength} characters`,
    {
      minLength
    }
  )

export const max = (maxLength: number) =>
  Decoder.filter(
    (input: string) => input.length <= maxLength,
    `string should contain at most ${maxLength} characters`,
    {
      maxLength
    }
  )

export const between = (minLength: number, maxLength: number) => flow(min(minLength), max(maxLength))

export const varchar = (minLength: number, maxLength: number) => pipe(string, between(minLength, maxLength))

export const nullable = flow(
  Decoder.map((str: string) => (str.length === 0 ? null : str)),
  Decoder.nullable
)

export const optional = flow(
  Decoder.map((str: string) => (str.length === 0 ? undefined : str)),
  Decoder.optional
)

export const trim = Decoder.map(Str.trim)

export const email = pipe(
  string,
  Decoder.filter((str): str is Email => REGEXP_EMAIL.test(str), `string is not an email`)
)

export const uuid = pipe(
  string,
  Decoder.filter((str): str is UUID => REGEXP_UUID.test(str), `string is not an uuid`)
)

export const TextDecoder = {
  string,
  min,
  max,
  between,
  trim,
  email,
  uuid,
  varchar,
  nullable,
  optional
}
