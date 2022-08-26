import dotenvExpand from 'dotenv-expand'
import dotenv from 'dotenv-flow'
import fs from 'fs'

import { Implementation } from '@apoyo/scopes'
import { Dict, Err, pipe } from '@apoyo/std'

import { $appEnv } from './app-env'
import { $rootDir } from '../root'

export const load = (options: dotenv.DotenvConfigOptions = {}): Dict<string> => {
  const nodeEnv = options.node_env || process.env.NODE_ENV || options.default_node_env

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

export const $envDir = Implementation.create([$rootDir], (rootDir) => rootDir)

export const $env = Implementation.create([$appEnv, $envDir], (appEnv, path) =>
  load({
    node_env: appEnv.name,
    path
  })
)
