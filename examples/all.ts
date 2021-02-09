import {
  Arr,
  DecodeError,
  Decoder,
  Dict,
  IO,
  Key,
  NonEmptyArray,
  Ord,
  pipe,
  Prom,
  Result,
  Task,
  TaskDecoder,
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

  const TodoDecoder = Decoder.struct({
    id: Decoder.uuid,
    title: Decoder.string,
    text: Decoder.string,
    done: Decoder.boolean,
    created_at: Decoder.datetime,
    finished_at: Decoder.datetime
  })

  interface Todo extends Decoder.TypeOf<typeof TodoDecoder> {}

  const Todo = Decoder.ref<Todo>(TodoDecoder)

  const result = pipe({}, Decoder.validate(Todo))
  console.log('Decode result', result)

  // TaskDecoder Demo - Asynchroneous validation

  const checkCountryCode = (input: string) => async () => {
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
  const checkBrand = (input: string) => async () => {
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

  const EntryDecoder = TaskDecoder.struct({
    name: Decoder.string,
    u2: pipe(Decoder.union(Decoder.string, Decoder.number), Decoder.option),
    country_code: pipe(Decoder.string, TaskDecoder.parse(checkCountryCode)),
    brand: pipe(Decoder.string, TaskDecoder.parse(checkBrand))
  })

  interface Entry extends TaskDecoder.TypeOf<typeof EntryDecoder> {}

  const entryResult = await pipe(
    {
      country_code: '??',
      brand: 'Brand1'
    } as Entry,
    TaskDecoder.validate<Entry>(EntryDecoder),
    Task.run
  )
  console.log('TaskDecode result', entryResult)

  const EntryList = TaskDecoder.array<Entry>(EntryDecoder)

  const arrayResult = await pipe([], TaskDecoder.validate(EntryList), Task.run)
  console.log('TaskDecode array result', arrayResult)
}

testUtils()