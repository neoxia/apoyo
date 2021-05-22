import React, { FC } from 'react'
import { render, screen } from '@testing-library/react'

import { usePrevious } from '../src'

// Tests
describe('usePrevious', () => {
  it('should return null', () => {
    const Test: FC = () => {
      const previous = usePrevious('test')

      return <p>previous: "{previous}"</p>
    }

    // Render
    render(<Test />)

    // Checks
    expect(screen.getByText('previous: ""')).toBeInTheDocument()
  })
})
