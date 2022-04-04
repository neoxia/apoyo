import { Injectable } from '@apoyo/scopes'

export interface Logger {
  info(msg: string, data?: any): void
  warn(msg: string, data?: any): void
  error(msg: string, data?: any): void
}

export const $consoleLogger = Injectable.of<Logger>(console)

export const $logger = Injectable.abstract<Logger>('Logger', $consoleLogger)
