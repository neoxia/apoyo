import { useEffect, useRef } from 'react'

/**
 * usePrevious hook
 * Returns the previous value of its value parameter
 *
 * @param value: value to save
 * @returns: the previous given value (or null for the 1st render)
 */
export function usePrevious<T>(value: T): T | null {
  // Ref
  const previous = useRef<T | null>(null)

  // Effect
  useEffect(() => {
    previous.current = value
  }, [value])

  return previous.current
}
