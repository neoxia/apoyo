import { useEffect, useState } from 'react'

/**
 * useInterval hook
 * Force the component to render regularly
 *
 * @param ms: milliseconds to wait before re-rendering the component
 * @returns: count of render since the component is mounted
 */
export function useInterval(ms: number): number {
  // State
  const [count, setCount] = useState(0)

  // Effects
  useEffect(() => {
    const interval = setInterval(() => setCount((old) => old + 1), ms)

    return () => {
      clearInterval(interval)
    }
  }, [ms])

  return count
}
