import { Injectable } from '@apoyo/scopes'

export interface Logger {
  info(msg: string, data?: any): void
  warn(msg: string, data?: any): void
  error(msg: string, data?: any): void
}

export const $consoleLogger: Injectable<Logger> = Injectable.of(console)

export const $logger: Injectable<Logger> = Injectable.of($consoleLogger)
