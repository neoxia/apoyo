import axios, { AxiosResponse, CancelTokenSource } from 'axios'
import { useCallback, useState } from 'react'

import { APIParams, APIPromise, APIState } from './types'

// Types
export type APIDeleteRequestGenerator<P extends APIParams, R> = (
  source: CancelTokenSource,
  params?: P
) => Promise<AxiosResponse<R>>

export type APIDeleteReturn<P extends APIParams, R> = APIState<R> & {
  send: (params?: P) => APIPromise<R>
}

// Base hooks
export function useDeleteRequest<R, P extends APIParams>(
  generator: APIDeleteRequestGenerator<P, R>
): APIDeleteReturn<P, R> {
  // State
  const [state, setState] = useState<APIState<R>>({ loading: false })

  // Callback
  const send = useCallback(
    (params?: P) => {
      setState((old) => ({ ...old, loading: true }))

      // Create cancel token
      const source = axios.CancelToken.source()

      // Make request
      const promise = generator(source, params).then(
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
