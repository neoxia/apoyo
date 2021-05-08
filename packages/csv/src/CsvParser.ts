import Papa from 'papaparse'
import { Dict, NonEmptyArray, Str } from '@apoyo/std'
import { CsvError } from './CsvError'

export type CsvParser = {}
export namespace CsvParser {
  export type Meta = {
    delimiter: string
    fields?: string[]
  }

  export interface Row {
    /**
     * Number of the row in the CSV
     */
    row: number
    /**
     * This property can be either:
     * - An `Array<string>` if the header is deactivated.
     * - A `Dict<string>` if the header is activated.
     *
     * We recommend the usage of a type decoder or validator, to ensure the correctness of the data.
     *
     * @see `@apoyo/decoders`
     */
    data: unknown
    /**
     * List of errors
     */
    errors: Array<CsvError>
    /**
     * Metadata about the file (header fields, delimiter, etc...)
     */
    meta: CsvParser.Meta
  }

  export type ReadOptions = {
    /**
     * If true, the first row of parsed data will be interpreted as field names.
     * An array of field names will be returned in meta, and each row of data will be an object of values keyed by field name instead of a simple array.
     * Rows with a different number of fields from the header row will produce an error. Warning: Duplicate field names will overwrite values in previous fields having the same name.
     *
     * @default false
     */
    header?: boolean

    /**
     * The delimiting character. It must be one of length 1.
     *
     * @default ','
     */
    delimiter?: string

    /**
     * The character used to quote fields.
     * The quoting of all fields is not mandatory.
     * Any field which is not quoted will correctly read.
     */
    quoteChar?: string

    /**
     * The character used to escape the quote character within a field.
     * If not set, this option will default to the value of quoteChar, meaning that the default escaping of quote character within a quoted field is using the quote character two times. (e.g. "column with ""quotes"" in text")
     */
    escapeChar?: string

    /**
     * A string that indicates a comment (for example, "#" or "//"). When Papa encounters a line starting with this string, it will skip the line.
     *
     * @default false
     */
    comments?: string | false

    /**
     * The encoding to use when opening local files.
     * If specified, it must be a value supported by the FileReader API.
     */
    encoding?: string
  }
}

const DefaultConfiguration: Omit<Papa.ParseConfig, 'step' | 'chunk' | 'complete' | 'error'> = {
  header: false,
  delimiter: ',',
  newline: '\n',
  comments: false,
  skipEmptyLines: true,
  dynamicTyping: false,
  transformHeader: Str.trim,
  transform: Str.trim
}

export const streamAsync = (
  input: string | NodeJS.ReadableStream,
  chunkSize = 1000,
  config: CsvParser.ReadOptions = {}
): AsyncIterable<NonEmptyArray<CsvParser.Row>> => {
  const configFull = {
    ...DefaultConfiguration,
    ...Dict.compact(config as Dict)
  }

  if (chunkSize <= 0) {
    throw new Error('Invalid chunkSize: number needs to be above 0')
  }

  return {
    [Symbol.asyncIterator]: () => {
      let chunk: CsvParser.Row[] = []
      let rows = configFull.header ? 1 : 0

      let parser: Papa.Parser | null = null
      let done = false
      let error: unknown = null
      let resolve: (r: IteratorResult<NonEmptyArray<CsvParser.Row>>) => void = () => undefined
      let reject: (err: any) => void = () => undefined
      return {
        return: () => {
          done = true
          if (parser) parser.abort()
          return Promise.resolve({
            done,
            value: (undefined as any) as NonEmptyArray<CsvParser.Row>
          })
        },
        throw: (err) => {
          done = true
          error = err
          if (parser) parser.abort()
          return Promise.reject(err)
        },
        next: () =>
          error
            ? Promise.reject(error)
            : done
            ? Promise.resolve({
                done: true,
                value: (undefined as any) as NonEmptyArray<CsvParser.Row>
              })
            : new Promise<IteratorResult<NonEmptyArray<CsvParser.Row>>>((res, rej) => {
                try {
                  resolve = res
                  reject = rej
                  if (parser === null) {
                    Papa.parse(input, {
                      ...configFull,
                      error: (ioError: unknown) => {
                        done = true
                        error = ioError
                        return reject(ioError)
                      },
                      step: (result: any, p: Papa.Parser) => {
                        ++rows
                        parser = p
                        chunk.push({
                          ...result,
                          row: rows
                        })
                        if (chunk.length < chunkSize) {
                          return
                        }
                        parser.pause()
                        const results = chunk
                        chunk = []
                        return resolve({
                          done: false,
                          value: results as NonEmptyArray<CsvParser.Row>
                        })
                      },
                      complete: () => {
                        done = true
                        if (error) {
                          return reject(error)
                        }
                        if (chunk.length === 0) {
                          return resolve({
                            done: true,
                            value: (undefined as any) as NonEmptyArray<CsvParser.Row>
                          })
                        }
                        const results = chunk
                        chunk = []
                        return resolve({
                          done: false,
                          value: results as NonEmptyArray<CsvParser.Row>
                        })
                      }
                    })
                  } else {
                    parser.resume()
                  }
                } catch (err) {
                  error = err
                  return reject(err)
                }
              })
      }
    }
  }
}

/**
 * @namespace CsvParser
 *
 * @description
 *
 * This namespace contains utilities for CSV parsing.
 *
 * @example
 * ```ts
 * const inputStream = fs.createReadStream(...)
 * const csvSeq = CsvParser.streamAsync(inputStream, 1000, {
 *   header: true,
 *   delimiter: ','
 * })
 *
 * for (const rows of csvSeq) {
 *   ...
 * }
 * ```
 */
export const CsvParser = {
  streamAsync
}
