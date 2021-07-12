import { Arr, Err, pipe, Result, run, Task } from '@apoyo/std'

const handleBatch = async (rows: any[], index: number): Promise<any> => {
  if (Math.random() > 0.5) {
    throw new Error('An error occured')
  }
  console.log(`handle batch #${index} for ${rows.length} rows`)
}

// Before - sequence

run(async () => {
  const CHUNK_SIZE = 50

  const rows: any[] = []
  const ok: any[] = []
  const ko: any[] = []

  let i = 0
  while (i < rows.length) {
    const chunk = rows.slice(i, i * CHUNK_SIZE + CHUNK_SIZE)

    await handleBatch(chunk, i)
      .then((value) => {
        ok.push(value)
      })
      .catch((err) => {
        ko.push({
          batch: i + 1,
          error: err
        })
      })

    i += CHUNK_SIZE
  }

  return {
    ok,
    ko
  }
})

// After - sequence

const tryHandleBatch = (rows: any[], index: number) =>
  pipe(
    Task.thunk(() => handleBatch(rows, index)),
    Task.tryCatch,
    Task.map(
      Result.mapError(
        Err.chain('batch #{index} failed', {
          batch: index + 1
        })
      )
    )
  )

run(async () => {
  const CHUNK_SIZE = 50
  const rows: any[] = []

  const [ok, ko] = await pipe(
    rows,
    Arr.chunksOf(CHUNK_SIZE),
    Arr.mapIndexed(tryHandleBatch),
    Task.sequence,
    Task.map(Arr.separate)
  )

  return {
    ok,
    ko
  }
})

// After - multiple batches in concurrence

run(async () => {
  const CHUNK_SIZE = 50
  const rows: any[] = []

  const [ok, ko] = await pipe(
    rows,
    Arr.chunksOf(CHUNK_SIZE),
    Arr.mapIndexed(tryHandleBatch),
    Task.concurrent(4),
    Task.map(Arr.separate)
  )

  return {
    ok,
    ko
  }
})
