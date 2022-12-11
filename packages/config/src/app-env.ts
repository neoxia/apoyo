import { Exception } from '@apoyo/std'

export class AppEnvironment {
  public static DEV = new AppEnvironment('development', ['dev', 'development'])
  public static STAGING = new AppEnvironment('staging', ['staging'])
  public static PROD = new AppEnvironment('production', ['prod', 'production'])
  public static TEST = new AppEnvironment('test', ['test', 'testing'])

  constructor(public readonly name: string, public readonly aliases: string[]) {}
}

export class UnsupportedAppEnvironment extends Exception {
  public readonly code = 'E_UNSUPPORTED_APP_ENV'
  constructor(public readonly received: string, public readonly supported: AppEnvironment[]) {
    const expected = supported.map((env) => env.name)
    const msg = `Unsupported NODE_ENV environment variables. Received value ${JSON.stringify(
      received
    )}, expected one of ${expected.join(', ')}`

    super(msg)
  }
}

/**
 * Get all app environments available by default in this package.
 *
 * @example
 * ```ts
 * const supportedEnvs = getDefaultAppEnvironments()
 * const appEnv = getCurrentAppEnvironment(process.env.NODE_ENV, supportedEnvs)
 * ```
 */
export const getDefaultAppEnvironments = () => [
  AppEnvironment.DEV,
  AppEnvironment.STAGING,
  AppEnvironment.PROD,
  AppEnvironment.TEST
]

/**
 * Throws an `UnsupportedAppEnvironment` if the current NODE_ENV does not match at least one supported environment
 *
 * @example
 * ```ts
 * const supportedEnvs = getDefaultAppEnvironments()
 * const appEnv = getCurrentAppEnvironment(process.env.NODE_ENV, supportedEnvs)
 * ```
 */
export const getCurrentAppEnvironment = (nodeEnv: string, supportedEnvs: AppEnvironment[]): AppEnvironment => {
  if (!nodeEnv) {
    return AppEnvironment.PROD
  }
  for (const env of supportedEnvs) {
    if (env.aliases.includes(nodeEnv)) {
      return env
    }
  }
  throw new UnsupportedAppEnvironment(nodeEnv, supportedEnvs)
}
