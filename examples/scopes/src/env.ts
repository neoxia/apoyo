import { Injectable } from '@apoyo/scopes'
import { loadEnv } from './utils/env'

export const $env = Injectable.define(async () =>
  loadEnv({
    path: process.cwd()
  })
)
