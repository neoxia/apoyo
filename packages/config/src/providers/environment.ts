import dotenvExpand from 'dotenv-expand'
import dotenv from 'dotenv-flow'
import fs from 'fs'

import { Dict, Exception } from '@apoyo/std'

import { AppEnvironment } from '../app-env'
import { ParametersProvider } from '../provider'
import { AppParameters } from '../app-parameters'

export class EnvironmentParseException extends Exception {
  public readonly code = 'E_ENV_PARSE'
  constructor(cause?: Error) {
    super(`Could not parse environment files`, cause)
  }
}

export interface EnvironmentProviderOptions {
  appEnv: AppEnvironment
  path: string
}

export class EnvironmentProvider implements ParametersProvider {
  constructor(private readonly config: EnvironmentProviderOptions) {}

  public async load(): Promise<AppParameters> {
    const nodeEnv = this.config.appEnv.name
    const envPath = this.config.path
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
}
