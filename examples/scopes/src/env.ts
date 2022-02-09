import dotenvExpand from 'dotenv-expand'
import dotenv from 'dotenv-flow'

import { DecodeError, Decoder, IntegerDecoder, ObjectDecoder, TextDecoder } from '@apoyo/decoders'
import { Injectable } from '@apoyo/scopes'
import { Err, pipe, Result } from '@apoyo/std'

export const EnvSchema = ObjectDecoder.struct({
  PORT: IntegerDecoder.int,

  JSON_PLACEHOLDER_URL: pipe(TextDecoder.string, TextDecoder.trim, TextDecoder.min(1))
})

export const Env = Injectable.thunk(async () => {
  // Load env files and expand variables
  const env = pipe(
    dotenv.config({
      path: process.cwd()
    }),
    dotenvExpand
  )
  if (env.error) {
    throw pipe(env.error, Err.chain('Could not parse env files'))
  }
  // Validate env variables
  return pipe(
    env.parsed,
    Decoder.validate(EnvSchema),
    Result.mapError(DecodeError.draw),
    Result.mapError(Err.of),
    Result.mapError(Err.chain(`Could not validate env`)),
    Result.get
  )
})
