import { Env } from '@/env'
import { Injectable } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'

const API = pipe(
  Env,
  Injectable.map((env) => ({
    port: env.PORT
  }))
)

const JsonPlaceholderAPI = pipe(
  Env,
  Injectable.map((env) => ({
    baseURL: env.JSON_PLACEHOLDER_URL
  }))
)

export const Config = Injectable.struct({
  API,
  JsonPlaceholderAPI
})
