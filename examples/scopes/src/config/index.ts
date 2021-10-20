import { Var } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'
import { Env } from '../env'

const API = pipe(
  Env,
  Var.map((env) => ({
    port: env.PORT
  }))
)

export const Config = {
  API
}
