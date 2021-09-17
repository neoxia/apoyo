import { Err, isNumber, pipe, Prom, Result, Task } from '../src'

describe('Task.of', () => {
  it('should return expected value', async () => {
    const result = Task.of(10)
    expect(pipe(result, Task.run)).resolves.toBe(10)
  })
})

describe('Task.resolve', () => {
  it('should return expected value', async () => {
    const result = Task.resolve(10)
    expect(pipe(result, Task.run)).resolves.toBe(10)
  })
})

describe('Task.reject', () => {
  it('should throw expected error', async () => {
    const result = Task.reject(10)
    expect(pipe(result, Task.run)).rejects.toBe(10)
  })
})

describe('Task.map', () => {
  it('should return expected value', async () => {
    const result = pipe(
      Task.of(10),
      Task.map((a) => a + 1)
    )
    expect(pipe(result, Task.run)).resolves.toBe(11)
  })

  it('should not call map if rejected', async () => {
    const result = pipe(
      Task.reject(10),
      Task.map((a) => a + 1)
    )
    expect(pipe(result, Task.run)).rejects.toBe(10)
  })
})

describe('Task.mapError', () => {
  it('should return expected value', async () => {
    const result = pipe(
      Task.reject(10),
      Task.mapError((a: any) => a + 1)
    )
    expect(pipe(result, Task.run)).rejects.toBe(11)
  })

  it('should not call mapError if resolved', async () => {
    const result = pipe(
      Task.resolve(10),
      Task.mapError((a: any) => a + 1)
    )
    expect(pipe(result, Task.run)).resolves.toBe(10)
  })
})

describe('Task.chain', () => {
  it('should return expected value', async () => {
    const result = pipe(
      Task.of(10),
      Task.chain((a) => Task.of(a + 1))
    )
    expect(pipe(result, Task.run)).resolves.toBe(11)
  })
})

describe('Task.catchError', () => {
  it('should resolve value', async () => {
    const result = pipe(
      Task.reject(10),
      Task.catchError((a: any) => (isNumber(a) ? Task.of(a + 1) : Task.of(1)))
    )
    expect(pipe(result, Task.run)).resolves.toBe(11)
  })

  it('should re-reject value', async () => {
    const result = pipe(
      Task.reject(10),
      Task.catchError((a: any) => Task.reject(a + 1))
    )
    expect(pipe(result, Task.run)).rejects.toBe(11)
  })
})

describe('Task.thunk', () => {
  it('should be able to return a normal value', async () => {
    const result = Task.thunk(() => 10)
    expect(pipe(result, Task.run)).resolves.toBe(10)
  })

  it('should be able to return a promise', async () => {
    const result = Task.thunk(() => Prom.of(10))
    expect(pipe(result, Task.run)).resolves.toBe(10)
  })
})

describe('Task.all', () => {
  it('should await all tasks', async () => {
    const result = pipe([Task.of(10), Task.of(12), Task.of(5)], Task.all)
    expect(pipe(result, Task.run)).resolves.toEqual([10, 12, 5])
  })

  it('should reject on first error', async () => {
    const result = pipe([Task.of(10), Task.reject(12), Task.of(5), Task.reject(7)], Task.all)
    expect(pipe(result, Task.run)).rejects.toBe(12)
  })

  it('should execute tasks in parallel', async () => {
    const mock = jest.fn((x: number) => x)

    const a = pipe(
      Task.sleep(20),
      Task.map(() => mock(1))
    )
    const b = pipe(
      Task.sleep(40),
      Task.map(() => mock(2))
    )
    const c = pipe(
      Task.sleep(5),
      Task.map(() => mock(3))
    )

    const results = await pipe([a, b, c], Task.all, Task.run)
    expect(results).toEqual([1, 2, 3])
    expect(mock.mock.calls.length).toBe(3)

    expect(mock.mock.calls[0][0]).toBe(3)
    expect(mock.mock.calls[1][0]).toBe(1)
    expect(mock.mock.calls[2][0]).toBe(2)
  })
})

describe('Task.sequence', () => {
  it('should await all tasks', async () => {
    const result = pipe([Task.of(10), Task.of(12), Task.of(5)], Task.sequence)
    expect(pipe(result, Task.run)).resolves.toEqual([10, 12, 5])
  })

  it('should reject on first error', async () => {
    const result = pipe([Task.of(10), Task.reject(12), Task.of(5), Task.reject(7)], Task.sequence)
    expect(pipe(result, Task.run)).rejects.toBe(12)
  })

  it('should execute tasks in sequence', async () => {
    const mock = jest.fn((x: number) => x)

    const a = pipe(
      Task.sleep(20),
      Task.map(() => mock(1))
    )
    const b = pipe(
      Task.sleep(100),
      Task.map(() => mock(2))
    )
    const c = pipe(
      Task.sleep(10),
      Task.map(() => mock(3))
    )

    const results = await pipe([a, b, c], Task.sequence, Task.run)
    expect(results).toEqual([1, 2, 3])
    expect(mock.mock.calls.length).toBe(3)

    expect(mock.mock.calls[0][0]).toBe(1)
    expect(mock.mock.calls[1][0]).toBe(2)
    expect(mock.mock.calls[2][0]).toBe(3)
  })
})

describe('Task.concurrent', () => {
  it('should work with empty tasks', async () => {
    const result = pipe([], Task.concurrent(2))
    expect(pipe(result, Task.run)).resolves.toEqual([])
  })

  it('should await all tasks', async () => {
    const result = pipe([Task.of(10), Task.of(12), Task.of(5)], Task.concurrent(2))
    expect(pipe(result, Task.run)).resolves.toEqual([10, 12, 5])
  })

  it('should reject on first error', async () => {
    const result = pipe([Task.of(10), Task.reject(12), Task.of(5), Task.reject(7)], Task.concurrent(2))
    expect(pipe(result, Task.run)).rejects.toBe(12)
  })

  it('should throw if concurrency is not above zero', async () => {
    const result = pipe([Task.of(10), Task.of(12), Task.of(5), Task.of(7)], Task.concurrent(0))
    expect(pipe(result, Task.run)).rejects.toThrow()
  })

  it('should throw if concurrency is negative', async () => {
    const result = pipe([Task.of(10), Task.of(12), Task.of(5), Task.of(7)], Task.concurrent(-Infinity))
    expect(pipe(result, Task.run)).rejects.toThrow()
  })

  it('should set max concurrency', async () => {
    const result = pipe([Task.of(10), Task.of(12), Task.of(5), Task.of(7)], Task.concurrent(100))
    expect(pipe(result, Task.run)).resolves.toEqual([10, 12, 5, 7])
  })

  it('should set max concurrency when infinity is used', async () => {
    const result = pipe([Task.of(10), Task.of(12), Task.of(5), Task.of(7)], Task.concurrent(Infinity))
    expect(pipe(result, Task.run)).resolves.toEqual([10, 12, 5, 7])
  })

  it('should execute tasks in concurrency', async () => {
    const mock = jest.fn((x: number) => x)

    const a = pipe(
      Task.sleep(20),
      Task.map(() => mock(1))
    )
    const b = pipe(
      Task.sleep(100),
      Task.map(() => mock(2))
    )
    const c = pipe(
      Task.sleep(20),
      Task.map(() => mock(3))
    )
    const d = pipe(
      Task.sleep(10),
      Task.map(() => mock(4))
    )

    const results = await pipe([a, b, c, d], Task.concurrent(2), Task.run)
    expect(results).toEqual([1, 2, 3, 4])
    expect(mock.mock.calls.length).toBe(4)

    expect(mock.mock.calls[0][0]).toBe(1)
    expect(mock.mock.calls[1][0]).toBe(3)
    expect(mock.mock.calls[2][0]).toBe(4)
    expect(mock.mock.calls[3][0]).toBe(2)
  })
})

describe('Task.tryCatch', () => {
  it('should return ok', async () => {
    const result = await pipe(Task.of(10), Task.tryCatch, Task.run)
    expect(result).toEqual(Result.ok(10))
  })

  it('should return ko', async () => {
    const result = await pipe(Task.reject(10), Task.tryCatch, Task.run)
    expect(result).toEqual(Result.ko(10))
  })
})

describe('Task.struct', () => {
  it('should merge struct into a single task', async () => {
    const result = await pipe(
      {
        name: Task.of('John'),
        age: Task.of(30),
        profiles: pipe(Task.of([{ name: 'developer' }]), Task.delay(100))
      },
      Task.struct(Task.sequence),
      Task.run
    )

    expect(result).toEqual({
      name: 'John',
      age: 30,
      profiles: [
        {
          name: 'developer'
        }
      ]
    })
  })
})

describe('Task.timeout', () => {
  it('should not timeout', async () => {
    const result = await pipe(
      Task.of(10),
      Task.timeout(100, () => 0),
      Task.run
    )
    expect(result).toEqual(10)
  })

  it('should timeout', async () => {
    const original = pipe(Task.of(10), Task.delay(200))
    const result = await pipe(
      original,
      Task.timeout(100, () => Task.of(0)),
      Task.run
    )
    expect(result).toEqual(0)
  })
})

describe('Task.tap', () => {
  it('should work', async () => {
    const mock = jest.fn()
    const result = await pipe(
      Task.of(42),
      Task.tap((value) => mock('received value', value)),
      Task.map((a) => a + 1)
    )
    expect(result).toBe(43)
    expect(mock.mock.calls.length).toBe(1)
    expect(mock.mock.calls[0][1]).toBe(42)
  })

  it('should work with async', async () => {
    const mock = jest.fn()
    const result = await pipe(
      Task.of(42),
      Task.tap(async (value) => mock('received value', value)),
      Task.map((a) => a + 1)
    )
    expect(result).toBe(43)
    expect(mock.mock.calls.length).toBe(1)
    expect(mock.mock.calls[0][1]).toBe(42)
  })
})

describe('Task.tapError', () => {
  it('should work', async () => {
    const mock = jest.fn()
    const [, error] = await pipe(
      Task.reject(new Error('Internal error')),
      Task.tapError((err) => mock('An error occured', err)),
      Task.tryCatch,
      Task.map(Result.mapError(Err.toError)),
      Task.map(Result.tuple)
    )
    expect(error?.message).toBe('Internal error')
    expect(mock.mock.calls.length).toBe(1)
    expect(mock.mock.calls[0][1]?.message).toBe('Internal error')
  })

  it('should work with async', async () => {
    const mock = jest.fn()
    const [, error] = await pipe(
      Task.reject(new Error('Internal error')),
      Task.tapError(async (err) => mock('An error occured', err)),
      Task.tryCatch,
      Task.map(Result.mapError(Err.toError)),
      Task.map(Result.tuple)
    )
    expect(error?.message).toBe('Internal error')
    expect(mock.mock.calls.length).toBe(1)
    expect(mock.mock.calls[0][1]?.message).toBe('Internal error')
  })
})

describe('Task.taskify', () => {
  it('should work', async () => {
    const increment = (x: number) => Promise.resolve(x + 1)
    const task = pipe(42, Task.taskify(increment))
    expect(await task).toBe(43)
  })
})

describe('Task.retry', () => {
  it('should work', async () => {
    const mock = jest.fn()
    const result = await pipe(
      Task.reject(Err.of('test')),
      Task.retry((err, attempt) => {
        mock(`attempt ${attempt} failed`, attempt)
        if (attempt >= 3) {
          throw err
        }
        return
      }),
      Task.tryCatch
    )
    expect(pipe(result, Result.isKo)).toBe(true)
    expect(
      pipe(
        result,
        Result.mapError((e: any) => e.message),
        Result.swap,
        Result.get
      )
    ).toBe('test')

    expect(mock.mock.calls.length).toBe(3)
    expect(mock.mock.calls[0][1]).toBe(1)
    expect(mock.mock.calls[1][1]).toBe(2)
    expect(mock.mock.calls[2][1]).toBe(3)
  })

  it('should not retry when task resolves', async () => {
    const mock = jest.fn()
    const result = await pipe(
      Task.resolve(42),
      Task.retry((err, attempt) => {
        mock(`attempt ${attempt} failed`, attempt)
        if (attempt >= 3) {
          throw err
        }
        return
      }),
      Task.tryCatch
    )
    expect(pipe(result, Result.isOk)).toBe(true)
    expect(pipe(result, Result.get)).toBe(42)

    expect(mock.mock.calls.length).toBe(0)
  })
})

describe('Task.retryBy', () => {
  it('should attempt N times', async () => {
    const mock = jest.fn()
    const result = await pipe(
      Task.reject(Err.of('test')),
      Task.tapError(() => mock()),
      Task.retryBy({
        attempts: 3
      }),
      Task.tryCatch
    )
    expect(pipe(result, Result.isKo)).toBe(true)
    expect(
      pipe(
        result,
        Result.mapError((e: any) => e.message),
        Result.swap,
        Result.get
      )
    ).toBe('test')

    expect(mock.mock.calls.length).toBe(3)
  })

  it('should only retry when condition is fullfilled', async () => {
    const mock = jest.fn()
    const result = await pipe(
      Task.reject(Err.of('test', { code: 'test' })),
      Task.tapError(() => mock()),
      Task.retryBy({
        attempts: 3,
        delay: 0,
        when: (err) => err.code === 'test'
      }),
      Task.tryCatch
    )
    expect(pipe(result, Result.isKo)).toBe(true)
    expect(
      pipe(
        result,
        Result.mapError((e: any) => e.message),
        Result.swap,
        Result.get
      )
    ).toBe('test')

    expect(mock.mock.calls.length).toBe(3)
  })

  it('should not retry when condition is not fullfilled', async () => {
    const mock = jest.fn()
    const result = await pipe(
      Task.reject(Err.of('test')),
      Task.tapError(() => mock()),
      Task.retryBy({
        attempts: 3,
        delay: 0,
        when: (err) => err.code === 'test'
      }),
      Task.tryCatch
    )
    expect(pipe(result, Result.isKo)).toBe(true)
    expect(
      pipe(
        result,
        Result.mapError((e: any) => e.message),
        Result.swap,
        Result.get
      )
    ).toBe('test')

    expect(mock.mock.calls.length).toBe(1)
  })

  it('should not retry when task resolves', async () => {
    const mock = jest.fn()
    const result = await pipe(
      Task.resolve(42),
      Task.tap(() => mock()),
      Task.tapError(() => mock()),
      Task.retryBy({
        attempts: 3,
        delay: 0,
        when: (err) => err.code === 'test'
      }),
      Task.tryCatch
    )
    expect(pipe(result, Result.isOk)).toBe(true)
    expect(pipe(result, Result.get)).toBe(42)

    expect(mock.mock.calls.length).toBe(1)
  })
})
