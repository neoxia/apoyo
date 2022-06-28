import pino, { Level, levels, Logger, LoggerOptions } from 'pino'
import { PrettyOptions } from 'pino-pretty'

import { BooleanDecoder, Decoder, EnumDecoder } from '@apoyo/decoders'
import { Injectable } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'

import { AppEnvironment, Env, Process } from '../process'
import { $context } from './context'

export const $env = Env.define({
  LOG_ENABLED: pipe(BooleanDecoder.boolean, Decoder.default(true)),
  LOG_PRETTY: pipe(BooleanDecoder.boolean, Decoder.nullable),
  LOG_LEVEL: pipe(EnumDecoder.isIn<Level>(Object.keys(levels.values) as Level[]), Decoder.default('info'))
})

export const $config = Injectable.of<LoggerOptions>({})

export const $pretty = Injectable.of<PrettyOptions>({})

export const $transport = Injectable.define(
  [$env, $pretty, Process.$appEnv],
  (env, pretty, appEnv): LoggerOptions['transport'] => {
    const prettyEnabled = env.LOG_PRETTY ?? appEnv === AppEnvironment.DEV
    const transport = prettyEnabled
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: true,
            ignore: 'pid,hostname',
            ...pretty
          }
        }
      : undefined

    return transport
  }
)

export const $logger = Injectable.define(
  [$env, $config, $context, $transport],
  (env, config, context, transport): Logger => {
    const options = {
      enabled: env.LOG_ENABLED,
      level: env.LOG_LEVEL,
      ...config,
      transport
    }

    const logger = pino({
      ...options,
      mixin(mergeObject, level) {
        const contextLogger = context.getLogger()
        const configMixin = config.mixin

        return {
          ...(contextLogger ? contextLogger.bindings() : {}),
          ...(configMixin ? configMixin(mergeObject, level) : {})
        }
      }
    })

    return logger
  }
)

export const child = (options: LoggerOptions | Injectable<LoggerOptions>): Injectable<Logger> => {
  const $options = options instanceof Injectable ? options : Injectable.of(options)
  return Injectable.define([$logger, $options], (logger, options) => logger.child({}, options))
}

export const forContext = (name: string) => child({ name })
