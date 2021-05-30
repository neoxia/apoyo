import axios, { AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios'
import { useCallback, useState } from 'react'

import { APIParams, APIPromise, APIState } from './types'

// Types
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
export function usePostRequest<B, R, P extends APIParams>(
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
