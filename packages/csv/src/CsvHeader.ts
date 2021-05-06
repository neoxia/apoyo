import { Csv } from './Csv'

export type CsvHeader = {}

export const checkDelimiter = (
  receivedFields: string[],
  badDelimiters: string[],
  goodDelimiter: string
): Csv.Error[] => {
  if (receivedFields.length === 1 && badDelimiters.some((delimiter) => receivedFields[0].includes(delimiter))) {
    return Array.of({
      row: 1,
      type: 'Csv',
      code: 'InvalidSeparator',
      message: `Wrong csv separator used. Use "${goodDelimiter}" instead.`
    })
  }
  return []
}

export const checkValidColumns = (expectedFields: string[], receivedFields: string[]): Csv.Error[] => {
  const fieldSet = new Set(expectedFields)
  const invalidFields = receivedFields.filter((field) => !fieldSet.has(field))

  if (invalidFields.length > 0) {
    return invalidFields.map((field) => ({
      row: 1,
      type: 'Csv',
      code: 'InvalidHeader',
      message: `Header contains invalid column ${field}.`
    }))
  }

  return []
}

export const checkRequiredColumns = (expectedFields: string[], receivedFields: string[]): Csv.Error[] => {
  const fieldSet = new Set(receivedFields)
  const missingFields = expectedFields.filter((field) => !fieldSet.has(field))

  if (missingFields.length > 0) {
    return missingFields.map((field) => ({
      row: 1,
      type: 'Csv',
      code: 'InvalidHeader',
      message: `Header is missing required column ${field}.`
    }))
  }

  return []
}

export const CsvHeader = {
  checkDelimiter,
  checkValidColumns,
  checkRequiredColumns
}
