import { Provider } from '@apoyo/ioc'
import { Exception } from '@apoyo/std'

export class AppEnvironment {
  public static DEV = new AppEnvironment(['dev', 'develop', 'development'], 'development')
  public static STAGING = new AppEnvironment(['staging'], 'staging')
  public static PROD = new AppEnvironment(['prod', 'production'], 'production')
  public static TEST = new AppEnvironment(['test', 'testing'], 'test')

  constructor(public readonly validNames: string[], public readonly name: string) {}
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

export const getCurrentAppEnvironment = (supportedEnvs: AppEnvironment[]): AppEnvironment => {
  const nodeEnv = process.env.NODE_ENV
  if (!nodeEnv) {
    return AppEnvironment.PROD
  }
  for (const env of supportedEnvs) {
    if (env.validNames.includes(nodeEnv)) {
      return env
    }
  }
  throw new UnsupportedAppEnvironment(nodeEnv, supportedEnvs)
}

export const $supportedEnvs = Provider.fromConst([
  AppEnvironment.DEV,
  AppEnvironment.STAGING,
  AppEnvironment.PROD,
  AppEnvironment.TEST
])

export const $appEnv = Provider.fromFactory(getCurrentAppEnvironment, [$supportedEnvs])
