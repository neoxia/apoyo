import axios from 'axios'

import { Injectable } from '@apoyo/scopes'
import { $env } from '@/env'
import { Config } from '@/utils/config'

const $config = Config.define($env, {
  baseURL: Config.from('JSON_PLACEHOLDER_URL')
})

const $axios = Injectable.define($config, (config) => {
  return axios.create({
    baseURL: config.baseURL
  })
})

export const JsonPlaceholder = Injectable.struct({
  $config,
  $axios
})
