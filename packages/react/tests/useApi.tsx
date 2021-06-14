import { render, screen, waitFor } from '@testing-library/react'
import axios from 'axios'
import React from 'react'

import { useAPI } from '../src/api/useApi'
import { ApiCache } from '../src'

// Setup
beforeEach(() => {
  jest.restoreAllMocks()
  jest.useFakeTimers()
})

// Test suites
for (const op of ['get', 'head', 'options'] as Array<'get' | 'head' | 'options'>) {
  describe(`useApi.${op}`, () => {
    // Tests
    it('should print test', async () => {
      // Mocks
      jest.spyOn(axios, op).mockResolvedValue({ data: 'test' })

      // Component
      const Test = () => {
        // API
        const { loading, data } = useAPI[op]<string>('/api/test', { q: 'test' })

        return <p>{loading ? 'loading ...' : data}</p>
      }

      // Render
      render(<Test />)

      // Checks
      expect(screen.getByText('loading ...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('test')).toBeInTheDocument()
      })

      expect(axios[op]).toBeCalledTimes(1)
      expect(axios[op]).toHaveBeenCalledWith('/api/test', {
        cancelToken: expect.any(axios.CancelToken),
        params: {
          q: 'test'
        }
      })
    })

    it('should not load resource', async () => {
      // Mocks
      jest.spyOn(axios, op).mockResolvedValue({ data: 'test' })

      // Component
      const Test = () => {
        // API
        const { loading, data } = useAPI[op]<string>('/api/test', {}, { load: false })

        return (
          <>
            <p>{loading ? 'loading ...' : data}</p>
          </>
        )
      }

      // Render
      render(<Test />)

      // Checks
      expect(screen.getByText('loading ...')).toBeInTheDocument()
      expect(axios[op]).not.toBeCalled()
    })

    it('should reload resource on click on button', async () => {
      // Mocks
      jest.spyOn(axios, op).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return { data: 'test' }
      })

      // Component
      const Test = () => {
        // API
        const { loading, data, reload } = useAPI[op]<string>('/api/test')

        return (
          <>
            <button onClick={reload}>load</button>
            <p>{loading ? 'loading ...' : data}</p>
          </>
        )
      }

      // Render
      render(<Test />)

      // Checks
      expect(screen.getByText('loading ...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('test')).toBeInTheDocument()
      })

      expect(axios[op]).toBeCalledTimes(1)
      expect(axios[op]).toHaveBeenCalledWith('/api/test', {
        cancelToken: expect.any(axios.CancelToken)
      })

      // Reload
      const btn = screen.getByText('load')
      btn.click()

      await waitFor(() => {
        expect(screen.getByText('loading ...')).toBeInTheDocument()
      })

      jest.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(screen.getByText('test')).toBeInTheDocument()
      })

      expect(axios[op]).toBeCalledTimes(2)
      expect(axios[op]).toHaveBeenCalledWith('/api/test', {
        cancelToken: expect.any(axios.CancelToken)
      })
    })

    it('should cache resource for future use (if cache is present)', async () => {
      // Mocks
      jest.spyOn(axios, op).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return { data: 'test' }
      })

      // Component
      const TestCall = () => {
        // API
        const { data } = useAPI[op]<string>('/api/test', {})

        return <p>{data || 'null'}</p>
      }

      const TestCache = () => {
        // API
        const { data } = useAPI[op]<string>('/api/test', {}, { load: false })

        return <p>{data}</p>
      }

      // Render call component
      render(
        <ApiCache>
          <TestCall />
        </ApiCache>
      )

      // Checks
      await waitFor(() => {
        expect(screen.getByText('null')).toBeInTheDocument()
      })

      jest.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(screen.getByText('test')).toBeInTheDocument()
      })

      expect(axios[op]).toBeCalledTimes(1)
      expect(axios[op]).toHaveBeenCalledWith('/api/test', {
        cancelToken: expect.any(axios.CancelToken),
        params: {}
      })

      // Render cache component
      render(
        <ApiCache>
          <TestCache />
        </ApiCache>
      )

      expect(screen.getByText('test')).toBeInTheDocument()

      expect(axios[op]).toBeCalledTimes(1)
    })

    it('should manually update state', async () => {
      // Mocks
      jest.spyOn(axios, op).mockResolvedValue({ data: 'test' })

      // Component
      const Test = () => {
        // API
        const { data, update } = useAPI[op]<string>('/api/test', { q: 'test' })

        return (
          <>
            <button onClick={() => update('updated')}>update</button>
            <p>{data}</p>
          </>
        )
      }

      // Render
      render(<Test />)

      // Checks
      await waitFor(() => {
        expect(screen.getByText('test')).toBeInTheDocument()
      })

      expect(axios[op]).toBeCalledTimes(1)
      expect(axios[op]).toHaveBeenCalledWith('/api/test', {
        cancelToken: expect.any(axios.CancelToken),
        params: {
          q: 'test'
        }
      })

      // Update state
      const btn = screen.getByText('update')
      btn.click()

      expect(axios[op]).toBeCalledTimes(1)
      expect(screen.getByText('updated')).toBeInTheDocument()
    })
  })
}
