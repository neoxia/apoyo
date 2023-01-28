import { Dict, Obj, pipe } from '@apoyo/std'
import pino, { Bindings, Logger, LoggerOptions as PinoOptions } from 'pino'
import pinoPretty from 'pino-pretty'

import { LoggerOptions } from './config'
import { LoggerContext } from './context'

export function createLogger(config: LoggerOptions, context?: LoggerContext) {
  const prettyEnabled = config.prettyPrint === false ? false : config.prettyPrint

  const prettyConfig = typeof config.prettyPrint === 'boolean' ? {} : config.prettyPrint

  const out = config.destination ?? process.stdout
  const stream = prettyEnabled
    ? pinoPretty({
        colorize: true,
        translateTime: true,
        ignore: 'pid,hostname',
        ...prettyConfig,
        destination: out
      })
    : out

  const configWithoutPretty = pipe(config, Obj.omit(['prettyPrint', 'destination']))

  const createLogWithContext = (
    loggerBindings: () => Bindings,
    superLog?: (obj: Record<string, unknown>) => Record<string, unknown>
  ) => (object: Record<string, unknown>) => {
    const ctxBindings = context?.bindings() ?? {}
    const props = pipe(ctxBindings, Dict.difference(loggerBindings()))
    return {
      ...props,
      ...(superLog ? superLog(object) : object)
    }
  }

  const formatters = context
    ? {
        ...configWithoutPretty.formatters,
        log: createLogWithContext(() => logger.bindings(), configWithoutPretty.formatters?.log)
      }
    : configWithoutPretty.formatters

  const options: PinoOptions = {
    ...configWithoutPretty,
    enabled: config.enabled ?? true,
    level: config.level ?? 'info',
    formatters
  }

  const logger = pino(options, stream)

  if (context) {
    const child = logger.child.bind(logger)
    logger.child = (bindings, options): any => {
      const childFormatters = options?.formatters as LoggerOptions['formatters']
      const childLogger: Logger = child(bindings, {
        ...options,
        formatters: {
          ...childFormatters,
          log: createLogWithContext(() => childLogger.bindings(), childFormatters?.log)
        }
      })
      return childLogger
    }
  }

  return logger
}
