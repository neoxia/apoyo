import { Bindings, ChildLoggerOptions as PinoChildOptions, LoggerOptions as PinoOptions, PrettyOptions } from 'pino'

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
  level?: LogLevel
  prettyPrint?: Omit<PrettyOptions, 'destination'> | boolean
}

export interface LoggerChildOptions extends PinoChildOptions {
  name?: string
  level?: LogLevel
  bindings?: Bindings
}
