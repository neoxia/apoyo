import { add, pipe, Result, Task, TaskResult } from '../src'

describe('TaskResult.ok', () => {
  it('should return ok', async () => {
    expect(await pipe(TaskResult.ok(1), Task.run)).toEqual(Result.ok(1))
  })
})

describe('TaskResult.ko', () => {
  it('should return ko', async () => {
    expect(await pipe(TaskResult.ko(1), Task.run)).toEqual(Result.ko(1))
  })
})

describe('TaskResult.fromResult', () => {
  it('should work with Result', async () => {
    expect(await pipe(TaskResult.from(Result.ok(1)), Task.run)).toEqual(Result.ok(1))
  })

  it('should work with TaskResult', async () => {
    expect(await pipe(TaskResult.from(TaskResult.ok(1)), Task.run)).toEqual(Result.ok(1))
  })
})

describe('TaskResult.run', () => {
  it('should return value when ok', async () => {
    expect(await pipe(TaskResult.ok(1), TaskResult.run)).toEqual(1)
  })
  it('should throw value when ko', async () => {
    try {
      await pipe(TaskResult.ko(1), TaskResult.run)
      throw new Error('should throw')
    } catch (err) {
      expect(err).toBe(1)
    }
  })
})

describe('TaskResult.map', () => {
  it('should map when ok', async () => {
    expect(await pipe(TaskResult.ok(1), TaskResult.map(add(1)), Task.run)).toEqual(Result.ok(2))
  })
  it('should not map when ko', async () => {
    expect(await pipe(TaskResult.ko(1), TaskResult.map(add(1)), Task.run)).toEqual(Result.ko(1))
  })
})

describe('TaskResult.mapError', () => {
  it('should not map when ok', async () => {
    expect(await pipe(TaskResult.ok(1), TaskResult.mapError(add(1)), Task.run)).toEqual(Result.ok(1))
  })
  it('should not map when ko', async () => {
    expect(await pipe(TaskResult.ko(1), TaskResult.mapError(add(1)), Task.run)).toEqual(Result.ko(2))
  })
})

describe('TaskResult.chain', () => {
  it('should chain when ok', async () => {
    expect(
      await pipe(
        TaskResult.ok(1),
        TaskResult.chain((a) => TaskResult.ok(a + 1)),
        Task.run
      )
    ).toEqual(Result.ok(2))
  })

  it('should not chain when ko', async () => {
    expect(
      await pipe(
        TaskResult.ko(1),
        TaskResult.chain((a: number) => TaskResult.ok(a + 1)),
        Task.run
      )
    ).toEqual(Result.ko(1))
  })

  it('should also work with result', async () => {
    expect(
      await pipe(
        TaskResult.ok(1),
        TaskResult.chain((a) => Result.ok(a + 1)),
        Task.run
      )
    ).toEqual(Result.ok(2))
  })
})

describe('TaskResult.catchError', () => {
  it('should not catchError when ok', async () => {
    expect(
      await pipe(
        TaskResult.ok(1),
        TaskResult.catchError((a: number) => TaskResult.ok(a + 1)),
        Task.run
      )
    ).toEqual(Result.ok(1))
  })
  it('should catchError when ko', async () => {
    expect(
      await pipe(
        TaskResult.ko(1),
        TaskResult.catchError((a) => TaskResult.ok(a + 1)),
        Task.run
      )
    ).toEqual(Result.ok(2))
  })

  it('should also work with result', async () => {
    expect(
      await pipe(
        TaskResult.ko(1),
        TaskResult.catchError((a) => Result.ok(a + 1)),
        Task.run
      )
    ).toEqual(Result.ok(2))
  })
})
