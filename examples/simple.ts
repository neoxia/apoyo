import { Arr, pipe, Prom, Task, TaskResult } from '../src'

export const testUtils = async () => {
  console.log('testUtils')

  const someTask: Task<number> = async () =>
    pipe(
      Prom.sleep(1000),
      Prom.map(() => 42)
    )

  const tasks = [someTask, Task.reject(new Error('some error')), Task.of(1), Task.of(1)]

  const [ok, errors] = await pipe(
    tasks,
    Arr.map(Task.tryCatch),
    Arr.map(TaskResult.mapError((err) => `Wrap Error: ${err}`)),
    Task.concurrent(4),
    Task.map(Arr.separate),
    Task.run
  )

  console.log('Task results', { ok, errors })
}
