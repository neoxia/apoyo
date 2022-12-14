import { Obj, pipe } from '@apoyo/std'
import pino, { LoggerOptions as PinoOptions } from 'pino'
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

  const mixin: PinoOptions['mixin'] = () => {
    const bindings = context?.bindings()
    return {
      ...bindings
    }
  }

  const configWithoutPretty = pipe(config, Obj.omit(['prettyPrint']))

  const options: PinoOptions = {
    ...configWithoutPretty,
    enabled: config.enabled ?? true,
    level: config.level ?? 'info',
    mixin
  }

  return pino(options, stream)
}
