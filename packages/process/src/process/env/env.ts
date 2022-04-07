import dotenvExpand from 'dotenv-expand'
import dotenv from 'dotenv-flow'
import fs from 'fs'

import { Injectable } from '@apoyo/scopes'
import { Dict, Err, pipe } from '@apoyo/std'

import { $nodeEnv } from './node-env'
import { $rootDir } from '../root'

export const load = (options: dotenv.DotenvConfigOptions = {}): Dict<string> => {
  const nodeEnv = options.node_env || process.env.NODE_ENV || options.default_node_env

  const path = options.path || process.cwd()

  const files = dotenv.listDotenvFiles(path, { node_env: nodeEnv }).filter((filename) => fs.existsSync(filename))
  const parsed = dotenv.parse(files)
  const env = dotenvExpand.expand({
    parsed
  })

  if (env.error) {
    throw pipe(env.error, Err.chain('Could not parse environment files'))
  }

  return Dict.compact({
    ...env.parsed,
    ...process.env
  })
}

export const $env = Injectable.define($nodeEnv, $rootDir, (nodeEnv, rootDir) =>
  load({
    node_env: nodeEnv,
    path: rootDir
  })
)
