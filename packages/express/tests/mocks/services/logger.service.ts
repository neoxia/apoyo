import { Injectable, Abstract } from '@apoyo/ioc'

export interface Logger {
  info(msg: string, data?: any): void
  warn(msg: string, data?: any): void
  error(msg: string, data?: any): void
}

export const $consoleLogger = Injectable.of<Logger>(console)

export const $logger = Abstract.create('Logger', $consoleLogger)
