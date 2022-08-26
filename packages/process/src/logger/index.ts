import { $als } from './als'
import { $options, $logger, $out, child, forContext, $env } from './logger'

export { LogLevel, LoggerOptions, LoggerChildOptions } from './config'
export { Bindings } from 'pino'

export const Logger = {
  /**
   * Async local storage instane that can be used to add additional bindings / properties to all logger in a given asynchroneous scope.
   *
   * Example: adding http request information to all your logs.
   */
  $als,

  /**
   * Default environment variables used to configure the logger
   */
  $env,

  /**
   * Override this injectable to customize the logger
   */
  $options,

  /**
   * Override this injectable to customize the output stream of the logger.
   *
   * Defaults to process.stdout.
   */
  $out,

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
   * const $myFeature = Implementation.create([$myFeatureLogger], (logger) => {
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
   * const $myFeature = Implementation.create([$myFeatureLogger], (logger) => {
   *   return () => {
   *     logger.info('execute my feature')
   *   }
   * })
   * ```
   */
  forContext
}
