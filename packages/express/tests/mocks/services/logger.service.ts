import { Injectable } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'

export interface Logger {
  info(msg: string, data?: any): void
  warn(msg: string, data?: any): void
  error(msg: string, data?: any): void
}

export const $logger = pipe(Injectable.abstract<Logger>('Logger'), Injectable.default(Injectable.of(console)))
