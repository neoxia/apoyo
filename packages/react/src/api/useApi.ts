import axios, { CancelTokenSource } from 'axios'
import { useCallback, useDebugValue } from 'react'

import { APIParams } from './types'
import { APIDeleteReturn, useDeleteRequest } from './useDeleteRequest'
import { APIGetRequestConfig, APIGetReturn, useGetRequest } from './useGetRequest'
import { APIPostRequestConfig, APIPostReturn, usePostRequest } from './usePostRequest'
import { useDeepMemo } from '../useDeepMemo'

// API Hooks
export function useAPIGet<R, P extends APIParams = APIParams>(
  url: string,
  params?: P,
  config: APIGetRequestConfig = {}
): APIGetReturn<R> {
  useDebugValue(url)
  const { load, ...rconfig } = config

  // Callbacks
  const generator = useCallback(
    (source: CancelTokenSource) => axios.get<R>(url, { ...rconfig, params, cancelToken: source.token }),
    [url, useDeepMemo(params), useDeepMemo(rconfig)] // eslint-disable-line react-hooks/exhaustive-deps
  )

  return useGetRequest(generator, `api-get:${url}`, load)
}

export function useAPIHead<R, P extends APIParams = APIParams>(
  url: string,
  params?: P,
  config: APIGetRequestConfig = {}
): APIGetReturn<R> {
  useDebugValue(url)
  const { load, ...rconfig } = config

  // Callbacks
  const generator = useCallback(
    (source: CancelTokenSource) => axios.head<R>(url, { ...rconfig, params, cancelToken: source.token }),
    [url, useDeepMemo(params), useDeepMemo(rconfig)] // eslint-disable-line react-hooks/exhaustive-deps
  )

  return useGetRequest(generator, `api-head:${url}`, load)
}

export function useAPIOptions<R, P extends APIParams = APIParams>(
  url: string,
  params?: P,
  config: APIGetRequestConfig = {}
): APIGetReturn<R> {
  useDebugValue(url)
  const { load, ...rconfig } = config

  // Callbacks
  const generator = useCallback(
    (source: CancelTokenSource) => axios.options<R>(url, { ...rconfig, params, cancelToken: source.token }),
    [url, useDeepMemo(params), useDeepMemo(rconfig)] // eslint-disable-line react-hooks/exhaustive-deps
  )

  return useGetRequest(generator, `api-options:${url}`, load)
}

export function useAPIDelete<R = unknown, P extends APIParams = APIParams>(
  url: string,
  params?: P,
  config?: APIPostRequestConfig
): APIDeleteReturn<P, R> {
  useDebugValue(url)

  // Callbacks
  const generator = useCallback(
    (source: CancelTokenSource, _params?: P) =>
      axios.delete<R>(url, { ...config, params: { ...params, ..._params }, cancelToken: source.token }),
    [url, useDeepMemo(params), useDeepMemo(config)] // eslint-disable-line react-hooks/exhaustive-deps
  )

  return useDeleteRequest(generator)
}

export function useAPIPost<B, R = unknown, P extends APIParams = APIParams>(
  url: string,
  params?: P,
  config?: APIPostRequestConfig
): APIPostReturn<B, P, R> {
  useDebugValue(url)

  // Callbacks
  const generator = useCallback(
    (body: B, source: CancelTokenSource, _params?: P) =>
      axios.post<R>(url, body, { ...config, params: { ...params, ..._params }, cancelToken: source.token }),
    [url, useDeepMemo(params), useDeepMemo(config)] // eslint-disable-line react-hooks/exhaustive-deps
  )

  return usePostRequest(generator)
}

export function useAPIPut<B, R = unknown, P extends APIParams = APIParams>(
  url: string,
  params?: P,
  config?: APIPostRequestConfig
): APIPostReturn<B, P, R> {
  useDebugValue(url)

  // Callbacks
  const generator = useCallback(
    (body: B, source: CancelTokenSource, _params?: P) =>
      axios.put<R>(url, body, { ...config, params: { ...params, ..._params }, cancelToken: source.token }),
    [url, useDeepMemo(params), useDeepMemo(config)] // eslint-disable-line react-hooks/exhaustive-deps
  )

  return usePostRequest(generator)
}

export function useAPIPatch<B, R = unknown, P extends APIParams = APIParams>(
  url: string,
  params?: P,
  config?: APIPostRequestConfig
): APIPostReturn<B, P, R> {
  useDebugValue(url)

  // Callbacks
  const generator = useCallback(
    (body: B, source: CancelTokenSource, _params?: P) =>
      axios.patch<R>(url, body, { ...config, params: { ...params, ..._params }, cancelToken: source.token }),
    [url, useDeepMemo(params), useDeepMemo(config)] // eslint-disable-line react-hooks/exhaustive-deps
  )

  return usePostRequest(generator)
}

// Namespaces
export const useAPI = {
  get: useAPIGet,
  delete: useAPIDelete,
  head: useAPIHead,
  options: useAPIOptions,
  post: useAPIPost,
  put: useAPIPut,
  patch: useAPIPatch
}
