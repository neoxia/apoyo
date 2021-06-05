import isEqual from 'lodash.isequal'
import { useRef } from 'react'

// Hook
export function useDeepMemo<T>(obj: T): T {
  const ref = useRef<T>(obj)

  if (!isEqual(ref.current, obj)) {
    ref.current = obj
  }

  return ref.current
}
