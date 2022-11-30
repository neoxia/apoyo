import pino, { Logger, LoggerOptions as PinoOptions } from 'pino'
import pinoPretty from 'pino-pretty'

import { BooleanDecoder, Decoder, EnumDecoder } from '@apoyo/decoders'
import { Provider } from '@apoyo/ioc'
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

export const $options = Provider.fromConst<LoggerOptions>({})

export const $out = Provider.fromConst<Writable>(process.stdout)

export const $logger = Provider.fromFactory(
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
  },
  [$env, $options, $als, $out]
)

export const child = (options: LoggerChildOptions | Provider<LoggerChildOptions>): Provider<Logger> => {
  const $options = options instanceof Provider ? options : Provider.fromConst(options)
  return Provider.fromFactory(
    (logger, options): Logger => {
      return logger.child(
        {
          name: options.name,
          ...options.bindings
        },
        options
      )
    },
    [$logger, $options]
  )
}

export const forContext = (name: string) => child({ name })
