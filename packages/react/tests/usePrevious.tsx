import React, { FC, useState } from 'react'
import { render, screen } from '@testing-library/react'

import { usePrevious } from '../src'

// Tests
describe('usePrevious', () => {
  it('should return previous value', () => {
    const Test: FC = () => {
      const [count, setCount] = useState(1)
      const previous = usePrevious(count)

      return (
        <>
          <button onClick={() => setCount((old) => old + 1)}>increment</button>
          <p>
            &quot;{previous}&quot; &quot;{count}&quot;
          </p>
        </>
      )
    }

    // Render
    render(<Test />)

    const btn = screen.getByText('increment')

    // Checks
    expect(screen.getByText('"" "1"')).toBeInTheDocument()

    // Increment
    btn.click()
    expect(screen.getByText('"1" "2"')).toBeInTheDocument()

    btn.click()
    expect(screen.getByText('"2" "3"')).toBeInTheDocument()
  })
})
