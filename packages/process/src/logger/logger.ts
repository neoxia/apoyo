import pino, { Logger, LoggerOptions as PinoOptions } from 'pino'
import pinoPretty from 'pino-pretty'

import { BooleanDecoder, Decoder, EnumDecoder } from '@apoyo/decoders'
import { Injectable, Implementation } from '@apoyo/scopes'
import { pipe, run } from '@apoyo/std'

import { Env } from '../process'
import { $als } from './als'
import { Writable } from 'stream'
import { LoggerChildOptions, LoggerOptions, LogLevel } from './config'

export const $env = Env.define({
  LOG_ENABLED: pipe(BooleanDecoder.boolean, Decoder.default(true)),
  LOG_LEVEL: pipe(EnumDecoder.native(LogLevel), Decoder.default(LogLevel.INFO)),
  LOG_PRETTY: pipe(BooleanDecoder.boolean, Decoder.default(false))
})

export const $options = Injectable.of<LoggerOptions>({})

export const $out = Injectable.of<Writable>(process.stdout)

export const $logger: Injectable<Logger> = Implementation.create(
  [$env, $options, $als, $out],
  (env, config, als, out): Logger => {
    const prettyEnabled = run(() => {
      if (config.prettyPrint === false) {
        return false
      }
      return config.prettyPrint ?? env.LOG_PRETTY
    })

    const prettyConfig = typeof config.prettyPrint === 'boolean' ? {} : config.prettyPrint

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
      const bindings = als.bindings()
      return {
        ...bindings
      }
    }

    const options: PinoOptions = {
      ...config,
      enabled: config.enabled ?? env.LOG_ENABLED,
      level: config.level ?? env.LOG_LEVEL,
      mixin
    }

    return pino(options, stream)
  }
)

export const child = (options: LoggerChildOptions | Injectable<LoggerChildOptions>): Injectable<Logger> => {
  const $options = Injectable.is(options) ? options : Injectable.of(options)
  return Implementation.create([$logger, $options], (logger, options) => {
    return logger.child(
      {
        name: options.name,
        ...options.bindings
      },
      options
    )
  })
}

export const forContext = (name: string) => child({ name })
