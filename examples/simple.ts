import { Arr, Err, pipe, Prom, Task, TaskResult } from '../src'

export const main = async () => {
  const someTask: Task<number> = async () => {
    await Prom.sleep(1000)
    return 42
  }

  const tasks = [someTask, Task.reject(new Error('some error')), Task.of(1), Task.of(1)]

  const [ok, errors] = await pipe(
    tasks,
    Arr.map(Task.tryCatch),
    Arr.map(TaskResult.mapError(Err.chain('Task failed'))),
    Task.concurrent(4),
    Task.map(Arr.separate),
    Task.run
  )

  console.log('Task results', { ok, errors })
}

main()
