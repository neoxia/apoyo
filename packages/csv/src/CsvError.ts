import Papa from 'papaparse'

export type CsvError = {
  type: string
  code: string
  message: string
  row: number
}

export namespace CsvError {
  export type WriteOptions = {
    delimiter: string
    quoteChar?: string
    escapeChar?: string
  }

  export interface Leaf extends Omit<CsvError, 'row'> {}
}

const ErrorRows: Array<keyof CsvError> = ['row', 'type', 'code', 'message']
const NewLine = '\n'

export const leaf = (type: string, code: string, message: string): CsvError.Leaf => ({
  type,
  code,
  message
})

export function fromLeaf(row: number) {
  return (leaf: CsvError.Leaf): CsvError => ({ ...leaf, row })
}

export const writeHeader = (options: CsvError.WriteOptions) => {
  return Papa.unparse([ErrorRows], { delimiter: options.delimiter }) + NewLine
}

export const writeLines = (errors: CsvError[], options: CsvError.WriteOptions) => {
  const dataList = errors.map((error) => ErrorRows.map((key) => error[key]))
  return Papa.unparse(dataList, { delimiter: options.delimiter, newline: NewLine }) + NewLine
}

export const writeLine = (error: CsvError, options: CsvError.WriteOptions) => {
  const errors = [error]
  const dataList = errors.map((error) => ErrorRows.map((key) => error[key]))
  return Papa.unparse(dataList, { delimiter: options.delimiter, newline: NewLine }) + NewLine
}

export const CsvError = {
  leaf,
  fromLeaf,
  writeHeader,
  writeLine,
  writeLines
}
