import dotenvExpand from 'dotenv-expand'
import dotenv from 'dotenv-flow'
import fs from 'fs'

import { Dict } from '@apoyo/std'

import { AppParameters } from '../app-parameters'
import { ParameterProviderException } from '../exceptions'

export class EnvironmentParseException extends ParameterProviderException {
  constructor(cause?: Error) {
    super(`Could not parse environment files`, cause, 'E_ENV_PARSE')
  }
}

export interface EnvironmentProviderOptions {
  nodeEnv?: string
  path?: string
}

export async function getParametersFromEnvironment(config: EnvironmentProviderOptions = {}): Promise<AppParameters> {
  const nodeEnv = config.nodeEnv ?? process.env.NODE_ENV
  const envPath = config.path ?? process.cwd()
  const files = dotenv.listDotenvFiles(envPath, { node_env: nodeEnv }).filter((filename) => fs.existsSync(filename))

  const parsed = Dict.compact({
    ...dotenv.parse(files, {
      silent: true
    }),
    ...process.env
  })

  const env = dotenvExpand.expand({
    ignoreProcessEnv: true,
    parsed
  })

  if (env.error || !env.parsed) {
    throw new EnvironmentParseException(env.error)
  }

  return env.parsed
}
