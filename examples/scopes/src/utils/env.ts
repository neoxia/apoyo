import dotenvExpand from 'dotenv-expand'
import dotenv from 'dotenv-flow'
import fs from 'fs'

import { DecodeError, Decoder, ObjectDecoder, TextDecoder } from '@apoyo/decoders'
import { Injectable } from '@apoyo/scopes'
import { Err, pipe, Result } from '@apoyo/std'

export const loadEnv = (options: dotenv.DotenvConfigOptions = {}) => {
  // Load env files and expand variables
  // The process.env variable will not be changed!
  const nodeEnv = options.node_env || process.env.NODE_ENV || options.default_node_env

  const path = options.path || process.cwd()

  const files = dotenv.listDotenvFiles(path, { node_env: nodeEnv }).filter((filename) => fs.existsSync(filename))
  const parsed = dotenv.parse(files)
  const env = dotenvExpand({
    parsed
  })

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

export const $env = Injectable.define(() => loadEnv())
