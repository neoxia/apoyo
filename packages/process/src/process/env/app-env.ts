import { Injectable } from '@apoyo/scopes'
import { Err } from '@apoyo/std'

export class AppEnvironment {
  public static DEV = new AppEnvironment(['dev', 'develop', 'development'], 'development', 'dev')
  public static STAGING = new AppEnvironment(['staging'], 'staging', 'staging')
  public static PROD = new AppEnvironment(['prod', 'production'], 'production', 'prod')
  public static TEST = new AppEnvironment(['test', 'testing'], 'test', 'test')

  constructor(
    public readonly validNames: string[],
    public readonly name: string,
    public readonly envFileName: string
  ) {}
}

export const findCurrentEnv = (nodeEnv: string, supportedEnvs: AppEnvironment[]) => {
  for (const env of supportedEnvs) {
    if (env.validNames.includes(nodeEnv)) {
      return env
    }
  }
  return undefined
}

export const $supportedEnvs = Injectable.of([
  AppEnvironment.DEV,
  AppEnvironment.STAGING,
  AppEnvironment.PROD,
  AppEnvironment.TEST
])

export const $appEnv = Injectable.define(
  [$supportedEnvs],
  (supportedEnvs): AppEnvironment => {
    const nodeEnv = process.env.NODE_ENV
    if (!nodeEnv) {
      return AppEnvironment.PROD
    }
    const appEnv = findCurrentEnv(nodeEnv, supportedEnvs)
    if (appEnv) {
      return appEnv
    }
    const expected = supportedEnvs.map((env) => env.name)
    const msg = `Unsupported NODE_ENV environment variables. Received value ${JSON.stringify(
      nodeEnv
    )}, expected one of ${expected.join(', ')}`

    throw Err.of(msg, {
      received: nodeEnv,
      expected
    })
  }
)
