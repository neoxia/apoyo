import dotenvExpand from 'dotenv-expand'
import dotenv from 'dotenv-flow'
import fs from 'fs'

import { Provider } from '@apoyo/ioc'
import { Dict, Err, pipe } from '@apoyo/std'

import { $appEnv, AppEnvironment } from './app-env'
import { $rootDir } from '../root'

export interface EnvironmentParameters {
  [key: string]: string
}

export interface LoadEnvironmentOptions {
  appEnv: AppEnvironment
  path: string
}

export const load = (options: LoadEnvironmentOptions): EnvironmentParameters => {
  const nodeEnv = options.appEnv.name

  const path = options.path || process.cwd()

  const files = dotenv.listDotenvFiles(path, { node_env: nodeEnv }).filter((filename) => fs.existsSync(filename))
  const parsed = Dict.compact({
    ...dotenv.parse(files),
    ...process.env
  })

  const env = dotenvExpand.expand({
    ignoreProcessEnv: true,
    parsed
  })

  if (env.error || !env.parsed) {
    throw pipe(env.error, Err.chain('Could not parse environment files'))
  }
  return env.parsed
}

export const $envDir = Provider.fromConst($rootDir)

export const $envOptions = Provider.fromObject<LoadEnvironmentOptions>({
  appEnv: $appEnv,
  path: $envDir
})

export const $env = Provider.fromFactory(load, [$envOptions])
