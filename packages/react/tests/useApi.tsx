import { render, screen, waitFor } from '@testing-library/react'
import axios from 'axios'
import React from 'react'

import { useAPI } from '../src/api/useApi'

// Setup
beforeEach(() => {
  jest.restoreAllMocks()
})

// Test suites
describe('useApi.get', () => {
  // Tests
  it('should print test', async () => {
    // Mocks
    jest.spyOn(axios, 'get').mockResolvedValue({ data: 'test' })

    // Component
    const Test = () => {
      // API
      const { data } = useAPI.get<string>('/api/test')

      return <p>{data}</p>
    }

    // Render
    render(<Test />)

    await waitFor(() => {
      screen.getByText('test')
    })

    // Checks
    expect(screen.getByText('test')).toBeInTheDocument()

    expect(axios.get).toBeCalledTimes(1)
    expect(axios.get).toHaveBeenCalledWith('/api/test', {
      cancelToken: expect.any(axios.CancelToken)
    })
  })
})
