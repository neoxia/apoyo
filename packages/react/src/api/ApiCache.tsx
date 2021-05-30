import React, { FC, ReactNode, useCallback, useState } from 'react'

import { CacheContext, CacheState } from './CacheContext'

// Types
interface State {
  [id: string]: CacheState<unknown>
}

export interface ApiCacheProps {
  children?: ReactNode
}

// Component
export const ApiCache: FC<ApiCacheProps> = ({ children }) => {
  // State
  const [cache, setCache] = useState<State>({})

  // Callbacks
  const set = useCallback(
    (id: string, data: unknown) => {
      setCache((old) => ({ ...old, [id]: { data } }))
    },
    [setCache]
  )

  // Render
  return <CacheContext.Provider value={{ cache, setCache: set }}>{children}</CacheContext.Provider>
}

export default ApiCache
