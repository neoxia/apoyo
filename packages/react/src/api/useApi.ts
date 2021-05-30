import axios, { AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios'
import { useCallback, useDebugValue, useEffect, useState } from 'react'

import { useCache } from './CacheContext'

// Types
export type Updator<R> = (data?: R) => R

export type APIParams = Record<string, unknown>
export type APIState<R> = { data?: R; loading: boolean }
export type APIPromise<R> = Promise<R> & { cancel: () => void }

export type APIGetRequestConfig = Omit<AxiosRequestConfig, 'cancelToken'> & { load?: boolean }
export type APIGetRequestGenerator<R> = (source: CancelTokenSource) => Promise<AxiosResponse<R>>
export type APIGetReturn<R> = APIState<R> & {
  update: (data: R | Updator<R>) => void
  reload: () => void
}

export type APIDeleteRequestGenerator<P extends APIParams, R> = (
  source: CancelTokenSource,
  url?: string,
  params?: P
) => Promise<AxiosResponse<R>>
export type APIDeleteReturn<P extends APIParams, R> = APIState<R> & {
  send: ((params?: P) => APIPromise<R>) & ((url: string, params?: P) => APIPromise<R>)
}

export type APIPostRequestConfig = Omit<AxiosRequestConfig, 'cancelToken'>
export type APIPostRequestGenerator<B, P extends APIParams, R> = (
  body: B,
  source: CancelTokenSource,
  params?: P
) => Promise<AxiosResponse<R>>
export type APIPostReturn<B, P extends APIParams, R> = APIState<R> & {
  send: (data: B, params?: P) => APIPromise<R>
}

// Base hooks
function useGetRequest<R>(generator: APIGetRequestGenerator<R>, cacheId: string, load = true): APIGetReturn<R> {
  // Cache
  const { data, setCache } = useCache<R>(cacheId)

  // State
  const [reload, setReload] = useState(load ? 1 : 0)
  const [state, setState] = useState<APIState<R>>({ data, loading: true })

  // Effect
  useEffect(() => {
    if (reload === 0) return
    setState((old) => ({ ...old, loading: true }))

    // Create cancel token
    const source = axios.CancelToken.source()

    // Make request
    generator(source)
      .then((res) => {
        setState({ data: res.data, loading: false })
      })
      .catch((error) => {
        if (axios.isCancel(error)) return

        setState((old) => ({ ...old, loading: false }))
        throw error
      })

    // Cancel
    return () => {
      source.cancel()
    }
  }, [generator, reload, setCache])

  useEffect(() => {
    if (state.data) setCache(state.data)
  }, [state.data, setCache])

  useEffect(() => {
    setState((old) => ({ ...old, data }))
  }, [cacheId])

  return {
    ...state,
    update: useCallback(
      (data: R | Updator<R>) => {
        const updator: Updator<R> = typeof data === 'function' ? (data as Updator<R>) : () => data

        setState((old) => ({ ...old, data: updator(old.data) }))
      },
      [setState]
    ),
    reload: useCallback(() => setReload((old) => old + 1), [setReload])
  }
}

function useDeleteRequest<R, P extends APIParams>(generator: APIDeleteRequestGenerator<P, R>): APIDeleteReturn<P, R> {
  // State
  const [state, setState] = useState<APIState<R>>({ loading: false })

  // Callback
  const send = useCallback(
    (arg1?: string | P, arg2?: P) => {
      setState((old) => ({ ...old, loading: true }))

      // Arguments
      let url: string | undefined
      let params: P | undefined

      if (typeof arg1 === 'string') {
        url = arg1
        params = arg2
      } else {
        url = undefined
        params = arg1
      }

      // Create cancel token
      const source = axios.CancelToken.source()

      // Make request
      const promise = generator(source, url, params).then(
        (res): R => {
          setState({ data: res.data, loading: false })
          return res.data
        }
      ) as APIPromise<R>

      promise.cancel = () => source.cancel()
      return promise
    },
    [generator]
  )

  return {
    ...state,
    send
  }
}

function usePostRequest<B, R, P extends APIParams>(
  generator: APIPostRequestGenerator<B, P, R>
): APIPostReturn<B, P, R> {
  // State
  const [state, setState] = useState<APIState<R>>({ loading: false })

  // Callback
  const send = useCallback(
    (body: B, params?: P) => {
      setState((old) => ({ ...old, loading: true }))

      // Create cancel token
      const source = axios.CancelToken.source()

      // Make request
      const promise = generator(body, source, params).then(
        (res): R => {
          setState({ data: res.data, loading: false })
          return res.data
        }
      ) as APIPromise<R>

      promise.cancel = () => source.cancel()
      return promise
    },
    [generator]
  )

  return {
    ...state,
    send
  }
}

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
    [url, params, rconfig]
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
    [url, params, rconfig]
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
    [url, params, rconfig]
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
    (source: CancelTokenSource, _url?: string, _params?: P) =>
      axios.delete<R>(_url || url, { ...config, params: { ...params, ..._params }, cancelToken: source.token }),
    [url, params, config]
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
    [url, params, config]
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
    [url, params, config]
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
    [url, params, config]
  )

  return usePostRequest(generator)
}

// Namespaces
const useAPI = {
  get: useAPIGet,
  delete: useAPIDelete,
  head: useAPIHead,
  options: useAPIOptions,
  post: useAPIPost,
  put: useAPIPut,
  patch: useAPIPatch
}

export default useAPI
