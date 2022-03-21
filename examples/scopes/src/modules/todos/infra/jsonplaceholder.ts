import axios, { AxiosRequestConfig } from 'axios'

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

const $http = Injectable.define($axios, (axios) => {
  const get = <T>(url: string, config?: AxiosRequestConfig) => axios.get<T>(url, config).then((res) => res.data)

  const post = <T>(url: string, body: unknown, config?: AxiosRequestConfig) =>
    axios.post<T>(url, body, config).then((res) => res.data)

  const put = <T>(url: string, body: unknown, config?: AxiosRequestConfig) =>
    axios.put<T>(url, body, config).then((res) => res.data)

  const _delete = (url: string, config?: AxiosRequestConfig) => axios.delete<void>(url, config).then((res) => res.data)

  return {
    get,
    post,
    put,
    delete: _delete
  }
})

export const JsonPlaceholder = {
  $config,
  $http
}
