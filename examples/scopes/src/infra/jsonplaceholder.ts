import axios from 'axios'

import { Injectable } from '@apoyo/scopes'
import { Config } from '@/utils/config'

const $config = Config.fromEnv({
  baseURL: Config.prop('JSON_PLACEHOLDER_URL')
})

const $axios = Injectable.define($config, (config) => {
  return axios.create({
    baseURL: config.baseURL
  })
})

export const JsonPlaceholder = {
  $config,
  $axios
}
