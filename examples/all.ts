import {
  Arr,
  DecodeError,
  Decode,
  Dict,
  IO,
  Key,
  NonEmptyArray,
  Ord,
  pipe,
  Prom,
  Result,
  Task,
  TaskDecode,
  TaskResult
} from '../src'

export const testUtils = async () => {
  console.log('testUtils')

  // Array & Dict Demo

  const groups = pipe(
    [1, 2, 3, 1, 2, 3, 1, 4, 11, 23, 12, 13, 10],
    Arr.uniq(Key.number),
    Arr.filter((a) => a > 2),
    Arr.groupBy((value) => Math.floor(value / 10)),
    Dict.collect(NonEmptyArray.min(Ord.number))
  )

  // Task Demo - task utilities, aka lazy promises

  const someTask: Task<number> = async () =>
    pipe(
      Prom.sleep(1000),
      Prom.map(() => 42)
    )

  const tasks = [someTask, Task.reject(new Error('some error')), Task.of(1), Task.of(1)]

  const [ok, errors] = await pipe(
    tasks,
    Arr.map(Task.tryCatch),
    Arr.map(TaskResult.map((a) => `Success: ${a}`)),
    Task.concurrent(4),
    Task.map(Arr.separate),
    Task.run
  )

  // Promise Demo - promises utilities

  const findUser = (id: string) => Prom.reject(new Error(`Could not find User ${id}`))

  const prom = await pipe(
    findUser('my_user_id'),
    Prom.mapError((err) => new Error(`Wrapped: ${err.message}`)),
    Prom.tryCatch
  )

  // IO.run Demo - IIFE (Immediately Invoked Function Expression)

  IO.run(() => {
    console.log('TaskResult tests', { ok, errors })
    console.log('groups tests', { groups })
    console.log('prom tests', { prom })
  })

  // Decoder Demo - Lightweight and customisable synchroneous validation

  const TodoDecoder = Decode.struct({
    id: Decode.uuid,
    title: Decode.string,
    text: Decode.string,
    done: Decode.boolean,
    created_at: Decode.datetime,
    finished_at: Decode.datetime
  })

  interface Todo extends Decode.TypeOf<typeof TodoDecoder> {}

  const Todo = Decode.ref<Todo>(TodoDecoder)

  const result = pipe({}, Decode.validate(Todo))
  console.log('Decode result', result)

  // TaskDecoder Demo - Asynchroneous validation

  const checkCountryCode = async (input: string) => {
    await Prom.sleep(2000)
    const codes = ['DE', 'FR']
    return codes.includes(input)
      ? Result.ok(input)
      : Result.ko(
          DecodeError.value(input, `Invalid country code`, {
            lov: codes
          })
        )
  }
  const checkBrand = async (input: string) => {
    await Prom.sleep(5000)
    const codes = ['Brand1', 'Brand2']
    return codes.includes(input)
      ? Result.ok(input)
      : Result.ko(
          DecodeError.value(input, `Invalid brand`, {
            lov: codes
          })
        )
  }

  const EntryDecoder = TaskDecode.struct({
    name: Decode.string,
    u2: pipe(Decode.union(Decode.string, Decode.number), Decode.option),
    country_code: pipe(Decode.string, TaskDecode.chainAsync(checkCountryCode)),
    brand: pipe(Decode.string, TaskDecode.chainAsync(checkBrand))
  })

  interface Entry extends TaskDecode.TypeOf<typeof EntryDecoder> {}

  const entryResult = await pipe(
    {
      country_code: '??',
      brand: 'Brand1'
    } as Entry,
    TaskDecode.validate<Entry>(EntryDecoder),
    Task.run
  )
  console.log('TaskDecode result', entryResult)

  const EntryList = TaskDecode.array<Entry>(EntryDecoder)

  const arrayResult = await pipe([], TaskDecode.validate(EntryList), Task.run)
  console.log('TaskDecode array result', arrayResult)
}

testUtils()
