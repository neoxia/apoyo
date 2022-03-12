import dotenvExpand from 'dotenv-expand'
import dotenv from 'dotenv-flow'

import { DecodeError, Decoder, ObjectDecoder, TextDecoder } from '@apoyo/decoders'
import { Err, pipe, Result } from '@apoyo/std'
import { Injectable } from '@apoyo/scopes'

export const loadEnv = (options?: dotenv.DotenvConfigOptions) => {
  // Load env files and expand variables
  const env = pipe(dotenv.config(options), dotenvExpand)
  if (env.error) {
    throw pipe(env.error, Err.chain('Could not parse env files'))
  }

  // Validate env variables
  return pipe(
    env.parsed,
    Decoder.validate(ObjectDecoder.dict(TextDecoder.string)),
    Result.mapError(DecodeError.draw),
    Result.mapError(Err.of),
    Result.mapError(Err.chain(`Could not validate env`)),
    Result.get
  )
}

export const $env = Injectable.define(async () => {
  return loadEnv({
    path: process.cwd()
  })
})
