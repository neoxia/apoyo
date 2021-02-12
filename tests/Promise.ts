import { pipe, Prom, Result } from '../src'

describe('Promise.of', () => {
  it('should return expected value', async () => {
    const result = Prom.of(10)
    expect(result).resolves.toBe(10)
  })
})

describe('Promise.resolve', () => {
  it('should return expected value', async () => {
    const result = Prom.resolve(10)
    expect(result).resolves.toBe(10)
  })
})

describe('Promise.reject', () => {
  it('should throw expected error', async () => {
    const result = Prom.reject(10)
    expect(result).rejects.toBe(10)
  })
})

describe('Promise.map', () => {
  it('should return expected value', async () => {
    const result = pipe(
      Prom.of(10),
      Prom.map((a) => a + 1)
    )
    expect(result).resolves.toBe(11)
  })

  it('should not call map if rejected', async () => {
    const result = pipe(
      Prom.reject(10),
      Prom.map((a) => a + 1)
    )
    expect(result).rejects.toBe(10)
  })

  it('should not return another promise', async () => {
    // FIXME: add type tests via dts-jest or tsd
    // @ts-expect-error Prom.map should not be able to return promise
    Prom.map((a: number) => Prom.of(a + 1))

    Prom.map((a: number) => a + 1)

    expect(true).toBe(true)
  })
})

describe('Promise.mapError', () => {
  it('should return expected value', async () => {
    const result = pipe(
      Prom.reject(10),
      Prom.mapError((a) => a + 1)
    )
    expect(result).rejects.toBe(11)
  })

  it('should not call mapError if resolved', async () => {
    const result = pipe(
      Prom.resolve(10),
      Prom.mapError((a) => a + 1)
    )
    expect(result).resolves.toBe(10)
  })
})

describe('Promise.chain', () => {
  it('should return expected value', async () => {
    const result = pipe(
      Prom.of(10),
      Prom.chain((a) => Prom.of(a + 1))
    )
    expect(result).resolves.toBe(11)
  })
})

describe('Promise.chainError', () => {
  it('should resolve value', async () => {
    const result = pipe(
      Prom.reject(10),
      Prom.chainError((a: number) => Prom.of(a + 1))
    )
    expect(result).resolves.toBe(11)
  })

  it('should re-reject value', async () => {
    const result = pipe(
      Prom.reject(10),
      Prom.chainError((a: number) => Prom.reject(a + 1))
    )
    expect(result).rejects.toBe(11)
  })
})

describe('Promise.fromIO', () => {
  it('should be able to return a normal value', async () => {
    const result = Prom.fromIO(() => 10)
    expect(result).resolves.toBe(10)
  })

  it('should be able to return a promise', async () => {
    const result = Prom.fromIO(() => Prom.of(10))
    expect(result).resolves.toBe(10)
  })
})

describe('Promise.all', () => {
  it('should await all promises', async () => {
    const result = pipe([Prom.of(10), Prom.of(12), Prom.of(5)], Prom.all)
    expect(result).resolves.toEqual([10, 12, 5])
  })

  it('should reject on first error', async () => {
    const result = pipe([Prom.of(10), Prom.reject(12), Prom.of(5), Prom.reject(7)], Prom.all)
    expect(result).rejects.toBe(12)
  })

  it('should execute promises in parallel', async () => {
    const mock = jest.fn((x: number) => x)

    const a = pipe(
      Prom.sleep(10),
      Prom.map(() => mock(1))
    )
    const b = pipe(
      Prom.sleep(20),
      Prom.map(() => mock(2))
    )
    const c = pipe(
      Prom.sleep(5),
      Prom.map(() => mock(3))
    )

    const results = await pipe([a, b, c], Prom.all)
    expect(results).toEqual([1, 2, 3])
    expect(mock.mock.calls.length).toBe(3)

    expect(mock.mock.calls[0][0]).toBe(3)
    expect(mock.mock.calls[1][0]).toBe(1)
    expect(mock.mock.calls[2][0]).toBe(2)
  })
})

describe('Promise.tryCatch', () => {
  it('should return ok', async () => {
    const result = await pipe(Prom.of(10), Prom.tryCatch)
    expect(result).toEqual(Result.ok(10))
  })

  it('should return ko', async () => {
    const result = await pipe(Prom.reject(10), Prom.tryCatch)
    expect(result).toEqual(Result.ko(10))
  })
})
