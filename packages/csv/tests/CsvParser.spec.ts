import { Readable } from 'stream'
import { IO, pipe, Prom, Result, Task, throwError } from '@apoyo/std'
import { CsvParser } from '../src'

describe('Csv.streamAsync', () => {
  const options: CsvParser.ReadOptions = {
    header: true,
    delimiter: ','
  }

  it('should stream all the lines', async () => {
    const content = `id,name\n1,John\n2,Doe\n3,Smith`
    const seq = CsvParser.streamAsync(content, 1000, options)

    let total = 0
    for await (const rows of seq) {
      total += rows.length
    }

    expect(total).toBe(3)
  })

  it('should not do anything when no lines are available', async () => {
    const content = `id,name\n\n\n`
    const seq = CsvParser.streamAsync(content, 1000, options)

    let total = 0
    for await (const rows of seq) {
      if (rows.length === 0) {
        throw new Error('rows should never be empty')
      }
      total += rows.length
    }

    expect(total).toBe(0)
  })

  it('should throw on empty chunk size', async () => {
    const content = `id,name\n1,John\n2,Doe\n3,Smith`
    expect(() => CsvParser.streamAsync(content, 0, options)).toThrow()
  })

  it('should be split into chunks', async () => {
    const content = `id,name\n1,John\n2,Doe\n3,Smith`
    const seq = CsvParser.streamAsync(content, 1, options)

    let total = 0
    for await (const rows of seq) {
      if (rows.length > 1) {
        throw new Error('rows should never have more than <chunkSize> elements')
      }
      total += rows.length
    }

    expect(total).toBe(3)
  })

  it('should be able to return to abort early', async () => {
    const content = `id,name\n1,John\n2,Doe\n3,Smith`
    const seq = CsvParser.streamAsync(content, 1, options)

    const row = await IO.run(async () => {
      for await (const rows of seq) {
        return rows[0]
      }
      return undefined
    })

    expect(row).not.toBeUndefined()
    expect(row?.data).toEqual({
      id: '1',
      name: 'John'
    })
  })

  it('should be able to break to abort early', async () => {
    const content = `id,name\n1,John\n2,Doe\n3,Smith`
    const seq = CsvParser.streamAsync(content, 1, options)

    let total = 0
    for await (const rows of seq) {
      total += rows.length
      break
    }

    expect(total).toBe(1)
  })

  it('should be able to throw to abort early', async () => {
    const content = `id,name\n1,John\n2,Doe\n3,Smith`

    const parseCsv = async (content: string) => {
      const seq = CsvParser.streamAsync(content, 1, options)
      let total = 0
      for await (const rows of seq) {
        total += rows.length
        throw new Error('Abort')
      }
      return total
    }

    expect(parseCsv(content)).rejects.toThrow('Abort')
  })

  it('should be able to throw to abort early', async () => {
    const content = `id,name\n1,John\n2,Doe\n3,Smith`
    const seq = CsvParser.streamAsync(content, 1, options)

    let total = 0
    const result = await pipe(
      Task.thunk(async () => {
        for await (const rows of seq) {
          total += rows.length
          throw new Error('Abort')
        }
        return total
      }),
      Task.tryCatch
    )

    const error = Result.isKo(result) ? result.ko : undefined

    expect(Result.isKo(result)).toBe(true)
    expect(() => throwError(error)).toThrow('Abort')
    expect(total).toBe(1)
  })

  it('should throw on stream abort', async () => {
    const generate = async function* () {
      yield `id,name\n1,John\n2,Doe\n`
      yield `3,Smith\n`
      await Prom.sleep(100)
      yield `4,Smith\n`
      yield `5,Smith\n`
      await Prom.sleep(200)
      throw new Error('Abort')
    }
    const input = Readable.from(generate())
    const seq = CsvParser.streamAsync(input, 1, options)

    let total = 0

    const result = await pipe(
      Task.thunk(async () => {
        for await (const rows of seq) {
          total += rows.length
        }
      }),
      Task.tryCatch
    )
    const error = Result.isKo(result) ? result.ko : undefined

    expect(Result.isKo(result)).toBe(true)
    expect(() => throwError(error)).toThrow('Abort')
    expect(total).toBe(5)
  })

  it('should throw on invalid input', async () => {
    const input: any = undefined
    const seq = CsvParser.streamAsync(input, 1, options)

    let total = 0

    const result = await pipe(
      Task.thunk(async () => {
        for await (const rows of seq) {
          total += rows.length
        }
      }),
      Task.tryCatch
    )
    const error = Result.isKo(result) ? result.ko : undefined

    expect(Result.isKo(result)).toBe(true)
    expect(error).toBeInstanceOf(Error)
    expect(total).toBe(0)
  })

  it('should throw on iterator.throw', async () => {
    const content = `id,name\n1,John\n2,Doe\n3,Smith`
    const seq = CsvParser.streamAsync(content, 1000, options)

    const it = seq[Symbol.asyncIterator]()

    const result = await pipe(
      Task.thunk(() => it.throw && it.throw(new Error('Abort'))),
      Task.tryCatch,
      Task.run
    )

    const error = Result.isKo(result) ? result.ko : undefined

    expect(Result.isKo(result)).toBe(true)
    expect(error).toBeInstanceOf(Error)
  })

  it('should work without header', async () => {
    const content = `id,name\n1,John\n2,Doe\n3,Smith`
    const seq = CsvParser.streamAsync(content)

    let total = 0
    for await (const rows of seq) {
      total += rows.length
    }

    expect(total).toBe(4)
  })
})
