import { throwError } from '@apoyo/std'
import { CsvParser } from './CsvParser'
import { CsvError } from './CsvError'

export type CsvHeader = {
  delimiter: string
  fields: string[]
}

const Delimiters = [',', ';', '|']

export const fromMeta = (meta: CsvParser.Meta): CsvHeader =>
  meta.fields
    ? {
        delimiter: meta.delimiter,
        fields: meta.fields
      }
    : throwError(new Error('Header is not activated in CSV options'))

export const checkDelimiter = (header: CsvHeader): CsvError[] => {
  const receivedFields = header.fields
  const delim = header.delimiter
  const bad = Delimiters.filter((str) => str !== delim)

  if (receivedFields.length === 1 && bad.some((delimiter) => receivedFields[0].includes(delimiter))) {
    return Array.of({
      row: 1,
      type: 'Header',
      code: 'InvalidSeparator',
      message: `Wrong csv separator used. Use "${delim}" instead.`
    })
  }
  return []
}

export const checkValidColumns = (expectedFields: string[]) => (header: CsvHeader): CsvError[] => {
  const fieldSet = new Set(expectedFields)
  const invalidFields = header.fields.filter((field) => !fieldSet.has(field))

  if (invalidFields.length > 0) {
    return invalidFields.map((field) => ({
      row: 1,
      type: 'Header',
      code: 'InvalidColumn',
      message: `Header contains invalid column ${JSON.stringify(field)}.`
    }))
  }

  return []
}

export const checkRequiredColumns = (expectedFields: string[]) => (header: CsvHeader): CsvError[] => {
  const fieldSet = new Set(header.fields)
  const missingFields = expectedFields.filter((field) => !fieldSet.has(field))

  if (missingFields.length > 0) {
    return missingFields.map((field) => ({
      row: 1,
      type: 'Header',
      code: 'MissingColumn',
      message: `Header is missing required column ${JSON.stringify(field)}.`
    }))
  }

  return []
}

export const sequence = (...fns: Array<(header: CsvHeader) => CsvError[]>) => (header: CsvHeader) => {
  for (const fn of fns) {
    const errs = fn(header)
    if (errs.length > 0) {
      return errs
    }
  }
  return []
}

export const CsvHeader = {
  fromMeta,
  sequence,
  checkDelimiter,
  checkValidColumns,
  checkRequiredColumns
}
