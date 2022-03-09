import { DecodeError, Decoder, DecoderResult, ObjectDecoder, TextDecoder } from '@apoyo/decoders'
import { Injectable } from '@apoyo/scopes'
import { Dict, Err, pipe, Result } from '@apoyo/std'

interface EnvDecoder<T> {
  name: string
  decoder: Decoder<unknown, T>
}

function from<T>(name: string): EnvDecoder<string>
function from<T>(name: string, decoder: Decoder<unknown, T>): EnvDecoder<T>
function from(name: string, decoder: Decoder<unknown, unknown> = TextDecoder.string) {
  return {
    name,
    decoder
  }
}

export type ConfigProps<T extends Dict> = {
  [P in keyof T]: EnvDecoder<T[P]>
}

function parse<T extends Dict>(env: Dict<string>, props: ConfigProps<T>): DecoderResult<T>
function parse(env: Dict<string>, props: Dict<EnvDecoder<any>>): DecoderResult<unknown> {
  const values = pipe(
    props,
    Dict.collect((prop): [string, string] => [prop.name, env[prop.name]]),
    Dict.fromPairs
  )
  const decoder = pipe(
    props,
    Dict.collect((prop): [string, Decoder<unknown, unknown>] => [prop.name, prop.decoder]),
    Dict.fromPairs,
    ObjectDecoder.struct
  )

  const config = pipe(
    values,
    Decoder.validate(decoder),
    Result.map((parsed) => {
      return pipe(
        props,
        Dict.map((prop) => parsed[prop.name])
      )
    })
  )

  return config
}

function define<T extends Dict>($env: Injectable<Dict<string>>, props: ConfigProps<T>): Injectable<T>
function define($env: Injectable<Dict<string>>, props: Dict<EnvDecoder<any>>): Injectable<unknown> {
  return Injectable.define($env, (env) => {
    return pipe(
      parse(env, props),
      Result.mapError((err) =>
        Err.of(`Invalid config`, {
          errors: DecodeError.format(err)
        })
      ),
      Result.get
    )
  })
}

export const Config = {
  parse,
  define,
  from
}
