import { $context } from './context'
import { $config, $logger, child, forContext } from './logger'

export const Logger = {
  /**
   * This uses `async_hooks`, and more precisely `AsyncLocalStorage` under the hood, to allow adding additional logger information for a given scope.
   *
   * Example: adding request information to all your logs.
   */
  $context,

  $config,

  /**
   * The root logger instance.
   *
   * This uses the `pino` library logger under the hood.
   */
  $logger,

  /**
   * Create child logger injectable
   *
   * @see `Logger.forContext` if you only want to set the context name of the child logger
   *
   * @example
   * ```ts
   * const $myFeatureLogger = Logger.child({
   *   name: 'myFeature'
   * })
   *
   * const $myFeature = Injectable.define([$myFeatureLogger], (logger) => {
   *   return () => {
   *     logger.info('execute my feature')
   *   }
   * })
   * ```
   */
  child,

  /**
   * Create child logger injectable with a given context name
   *
   * @see `Logger.child` if you want to configure your child logger in more details
   *
   * @example
   * ```ts
   * const $myFeatureLogger = Logger.forContext('myFeature')
   *
   * const $myFeature = Injectable.define([$myFeatureLogger], (logger) => {
   *   return () => {
   *     logger.info('execute my feature')
   *   }
   * })
   * ```
   */
  forContext
}
