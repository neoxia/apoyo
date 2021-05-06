import Papa from 'papaparse'
import { Csv } from './Csv'

export type CsvError = {}

export namespace CsvError {
  export type WriteOptions = {
    delimiter: string
    newline: string
  }
}

const ErrorRows: Array<keyof Csv.Error> = ['row', 'type', 'code', 'message']

export const writeHeader = (options: CsvError.WriteOptions) => {
  return Papa.unparse([ErrorRows], { delimiter: options.delimiter }) + options.newline
}

export const writeLine = (error: Csv.Error | Csv.Error[], options: CsvError.WriteOptions) => {
  const errors = Array.isArray(error) ? error : [error]
  const dataList = errors.map((error) => ErrorRows.map((key) => error[key]))
  return Papa.unparse(dataList, { delimiter: options.delimiter, newline: options.newline }) + options.newline
}

export const CsvError = {
  writeHeader,
  writeLine
}
