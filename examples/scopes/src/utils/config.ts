import { DecodeError, Decoder, DecoderResult, ObjectDecoder, TextDecoder } from '@apoyo/decoders'
import { Injectable } from '@apoyo/scopes'
import { Dict, Err, pipe, Result } from '@apoyo/std'

import { $env } from './env'

interface ConfigProperty<T> {
  name: string
  decoder: Decoder<unknown, T>
}

function prop<T>(name: string): ConfigProperty<string>
function prop<T>(name: string, decoder: Decoder<unknown, T>): ConfigProperty<T>
function prop(name: string, decoder: Decoder<unknown, unknown> = TextDecoder.string) {
  return {
    name,
    decoder
  }
}

export type ConfigProps<T extends Dict> = {
  [P in keyof T]: ConfigProperty<T[P]>
}

function parseEnv<T extends Dict>(env: Dict<string>, props: ConfigProps<T>): DecoderResult<T>
function parseEnv(env: Dict<string>, props: Dict<ConfigProperty<any>>): DecoderResult<unknown> {
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

function fromEnv<T extends Dict>(props: ConfigProps<T>): Injectable<T>
function fromEnv(props: Dict<ConfigProperty<any>>): Injectable<unknown> {
  return Injectable.define($env, (env) => {
    return pipe(
      parseEnv(env, props),
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
  parseEnv,
  fromEnv,
  prop
}
