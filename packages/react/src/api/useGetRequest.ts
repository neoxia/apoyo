import axios, { AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios'
import { useCallback, useEffect, useState } from 'react'

import { useCache } from './CacheContext'
import { APIState, Updator } from './types'

// Types
export type APIGetRequestConfig = Omit<AxiosRequestConfig, 'cancelToken'> & { load?: boolean }
export type APIGetRequestGenerator<R> = (source: CancelTokenSource) => Promise<AxiosResponse<R>>
export type APIGetReturn<R> = APIState<R> & {
  update: (data: R | Updator<R>) => void
  reload: () => void
}

// Base hooks
export function useGetRequest<R>(generator: APIGetRequestGenerator<R>, cacheId: string, load = true): APIGetReturn<R> {
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
