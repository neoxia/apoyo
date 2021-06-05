import React, { FC } from 'react'
import { render, screen, act } from '@testing-library/react'

import { useInterval } from '../src'

// Test suite
describe('useInterval', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // Tests
  it('should return previous value', () => {
    const Test: FC = () => {
      const count = useInterval(1000)

      return <p>{count}</p>
    }

    // Render
    render(<Test />)

    // Checks
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000)

    // Advance by 1 second
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
