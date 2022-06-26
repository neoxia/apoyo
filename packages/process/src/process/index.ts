import { $env, $envDir, load } from './env/env'
import { $appEnv, $supportedEnvs } from './env/app-env'
import { define, validate } from './env/define'
import { $pkg, $version } from './package'
import { $rootDir } from './root'
import { end } from './signals'

export { AppEnvironment } from './env/app-env'

/**
 * @namespace Process
 * This namespace contains injectables containing information about the current application.
 */
export const Process = {
  /**
   * Returns by default the current working directory
   * You can override this injectable to customize the root directory
   */
  $rootDir,

  /**
   * Returns by default the current working directory
   * You can override this injectable to customize the directory from where to load .env files
   */
  $envDir,

  /**
   * List of all supported application environments.
   * The default environments supported are `development`, `staging`, `production` and `test`
   */
  $supportedEnvs,

  /**
   * The current app environment.
   * Only supported environments defined in `Process.$supportedEnvs`.
   *
   * If no value is NODE_ENV is specified, the `production` environment is used.
   */
  $appEnv,

  /**
   * The environment variables for the given application.
   * The appropriate .env files are loaded automatically.
   */
  $env,

  /**
   * The general informations about this application.
   * This information is read from the package.json.
   */
  $pkg,

  /**
   * The current version of the application.
   */
  $version,

  /**
   * Await the end of the process.
   * The promise will resolve when:
   * - The event loop is empty and no more events need to be processed.
   * - A fatal uncaught error occures.
   * - A SIGINT, SIGTERM, SIUSR1 or SIGUSR2 signals is received.
   */
  end
}

/**
 * @namespace Env
 * This namespace contains utilities to easily load and parse environment variables.
 */
export const Env = {
  /**
   * Load env files and expand variables.
   *
   * @see `Process.$env` if you need a predefined injectable.
   *
   * @see [dotenv-flow](https://www.npmjs.com/package/dotenv-flow)
   * @see [dotenv-expand](https://www.npmjs.com/package/dotenv-expand)
   *
   *
   * The process.env will not be changed!
   */
  load,

  /**
   * Validate the environment variables matching the given validation schema.
   *
   * @param env The variables to validate
   * @param schema The validation schema
   */
  validate,

  /**
   * Validate the environment variables matching the given validation schema.
   *
   * This functions automatically reads the `Process.$env` and returns a new injectable that contains the parsed variables.
   *
   * @param schema The validation schema
   */
  define
}
