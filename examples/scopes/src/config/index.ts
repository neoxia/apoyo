import { Env } from '@/env'
import { Var } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'

const API = pipe(
  Env,
  Var.map((env) => ({
    port: env.PORT
  }))
)

const JsonPlaceholderAPI = pipe(
  Env,
  Var.map((env) => ({
    baseURL: env.JSON_PLACEHOLDER_URL
  }))
)

export const Config = {
  API,
  JsonPlaceholderAPI
}
