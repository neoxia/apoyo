import { Arr, Err, pipe, Prom, Result, Task, throwError } from '@apoyo/std'

export const main = async () => {
  const someTask: Task<number> = Task.thunk(async () => {
    await Prom.sleep(1000)
    return 42
  })

  const tasks = [someTask, Task.reject(new Error('some error')), Task.of(1), Task.of(1)]

  const [ok, errors] = await pipe(
    tasks,
    Arr.map(Task.mapError(Err.chain('Task failed'))),
    Arr.map(Task.tryCatch),
    Task.concurrent(4),
    Task.map(Arr.separate)
  )

  console.log('Task results', { ok, errors })

  const resultA: Result<number, Error> = pipe(
    Result.ko(new Error('some error')),
    Result.catchError((err) => (pipe(err, Err.hasName('SomeError')) ? Result.ok(1) : Result.ko(err)))
  )

  const fn = Result.tryCatchFn((a: number, b: number) =>
    b === 0 ? throwError(Err.of('cannot divide by zero')) : a / b
  )

  const resultB = fn(3, 0)

  return {
    resultA,
    resultB
  }
}

main()
