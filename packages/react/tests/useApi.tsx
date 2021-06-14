import { render, screen, waitFor } from '@testing-library/react'
import axios from 'axios'
import React, { FC } from 'react'

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
            <button onClick={reload}>reload</button>
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
      screen.getByText('reload').click()

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

describe('useApi.delete', () => {
  // Tests
  it('should send delete request on click (result from hook)', async () => {
    // Mocks
    jest.spyOn(axios, 'delete').mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { data: 'done' }
    })

    // Component
    const Test = () => {
      // API
      const { send, data, loading } = useAPI.delete<string>('/api/test')

      // Callbacks
      return (
        <>
          <p>{loading ? 'loading' : 'loaded'}</p>
          <p>{data || 'null'}</p>
          <button onClick={() => send({ id: 1 })}>delete</button>
        </>
      )
    }

    // Render
    render(<Test />)

    // Check
    expect(screen.getByText('loaded')).toBeInTheDocument()
    expect(screen.getByText('null')).toBeInTheDocument()
    expect(axios.delete).not.toBeCalled()

    // Delete
    screen.getByText('delete').click()

    await waitFor(() => {
      expect(screen.getByText('loading')).toBeInTheDocument()
    })

    expect(axios.delete).toBeCalledTimes(1)
    expect(axios.delete).toBeCalledWith('/api/test', {
      cancelToken: expect.any(axios.CancelToken),
      params: { id: 1 }
    })

    jest.advanceTimersByTime(1000)

    await waitFor(() => {
      expect(screen.getByText('loaded')).toBeInTheDocument()
    })

    expect(screen.getByText('done')).toBeInTheDocument()
  })

  it('should send delete request on click (result from promise)', async () => {
    // Mocks
    jest.spyOn(axios, 'delete').mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { data: 'done' }
    })

    // Component
    const Test: FC<{ onDelete: (res: string) => void }> = ({ onDelete }) => {
      // API
      const { send, loading } = useAPI.delete<string>('/api/test')

      // Callbacks
      return (
        <>
          <p>{loading ? 'loading' : 'loaded'}</p>
          <button onClick={() => send({ id: 1 }).then(onDelete)}>delete</button>
        </>
      )
    }

    // Render
    const handleDelete = jest.fn()
    render(<Test onDelete={handleDelete} />)

    // Check
    expect(screen.getByText('loaded')).toBeInTheDocument()
    expect(axios.delete).not.toBeCalled()
    expect(handleDelete).not.toBeCalled()

    // Delete
    screen.getByText('delete').click()

    await waitFor(() => {
      expect(screen.getByText('loading')).toBeInTheDocument()
    })

    expect(axios.delete).toBeCalledTimes(1)
    expect(axios.delete).toBeCalledWith('/api/test', {
      cancelToken: expect.any(axios.CancelToken),
      params: { id: 1 }
    })

    jest.advanceTimersByTime(1000)

    await waitFor(() => {
      expect(screen.getByText('loaded')).toBeInTheDocument()
    })

    expect(handleDelete).toBeCalledTimes(1)
    expect(handleDelete).toBeCalledWith('done')
  })
})

for (const op of ['post', 'patch', 'put'] as Array<'post' | 'patch' | 'put'>) {
  describe(`useApi.${op}`, () => {
    // Tests
    it('should send request on click (result from hook)', async () => {
      // Mocks
      jest.spyOn(axios, op).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return { data: 'done' }
      })

      // Component
      const Test = () => {
        // API
        const { send, data, loading } = useAPI[op]<{ id: number }, string>('/api/test')

        // Callbacks
        return (
          <>
            <p>{loading ? 'loading' : 'loaded'}</p>
            <p>{data || 'null'}</p>
            <button onClick={() => send({ id: 1 })}>send</button>
          </>
        )
      }

      // Render
      render(<Test />)

      // Check
      expect(screen.getByText('loaded')).toBeInTheDocument()
      expect(screen.getByText('null')).toBeInTheDocument()
      expect(axios[op]).not.toBeCalled()

      // Delete
      screen.getByText('send').click()

      await waitFor(() => {
        expect(screen.getByText('loading')).toBeInTheDocument()
      })

      expect(axios[op]).toBeCalledTimes(1)
      expect(axios[op]).toBeCalledWith(
        '/api/test',
        { id: 1 },
        { cancelToken: expect.any(axios.CancelToken), params: {} }
      )

      jest.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(screen.getByText('loaded')).toBeInTheDocument()
      })

      expect(screen.getByText('done')).toBeInTheDocument()
    })

    it('should send request on click (result from promise)', async () => {
      // Mocks
      jest.spyOn(axios, op).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return { data: 'done' }
      })

      // Component
      const Test: FC<{ onDone: (res: string) => void }> = ({ onDone }) => {
        // API
        const { send, loading } = useAPI[op]<{ id: number }, string>('/api/test')

        // Callbacks
        return (
          <>
            <p>{loading ? 'loading' : 'loaded'}</p>
            <button onClick={() => send({ id: 1 }).then(onDone)}>send</button>
          </>
        )
      }

      // Render
      const handleDone = jest.fn()
      render(<Test onDone={handleDone} />)

      // Check
      expect(screen.getByText('loaded')).toBeInTheDocument()
      expect(axios[op]).not.toBeCalled()
      expect(handleDone).not.toBeCalled()

      // Delete
      screen.getByText('send').click()

      await waitFor(() => {
        expect(screen.getByText('loading')).toBeInTheDocument()
      })

      expect(axios[op]).toBeCalledTimes(1)
      expect(axios[op]).toBeCalledWith(
        '/api/test',
        { id: 1 },
        { cancelToken: expect.any(axios.CancelToken), params: {} }
      )

      jest.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(screen.getByText('loaded')).toBeInTheDocument()
      })

      expect(handleDone).toBeCalledTimes(1)
      expect(handleDone).toBeCalledWith('done')
    })
  })
}
