import axios from 'axios'

import { Config } from '@/config'
import { Var } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'

export const JsonPlaceholderAPI = pipe(
  Var.inject(Config.JsonPlaceholderAPI),
  Var.mapWith((config) =>
    axios.create({
      baseURL: config.baseURL
    })
  )
)
