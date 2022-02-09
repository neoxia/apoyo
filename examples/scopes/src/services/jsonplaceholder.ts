import axios from 'axios'

import { Config } from '@/config'
import { Injectable } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'

export const JsonPlaceholderAPI = pipe(
  Config.JsonPlaceholderAPI,
  Injectable.map((config) =>
    axios.create({
      baseURL: config.baseURL
    })
  )
)
