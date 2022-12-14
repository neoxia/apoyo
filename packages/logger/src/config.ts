import { Bindings, ChildLoggerOptions as PinoChildOptions, LoggerOptions as PinoOptions } from 'pino'
import { PrettyOptions } from 'pino-pretty'
import { Writable } from 'stream'

export enum LogLevel {
  FATAL = 'fatal',
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
  SILENT = 'silent'
}

export interface LoggerOptions extends Omit<PinoOptions, 'transport'> {
  enabled?: boolean
  level?: LogLevel
  prettyPrint?: Omit<PrettyOptions, 'destination'> | boolean
  destination?: Writable
}

export interface LoggerChildOptions extends PinoChildOptions {
  name?: string
  level?: LogLevel
  bindings?: Bindings
}
