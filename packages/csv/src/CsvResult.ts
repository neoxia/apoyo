import { Arr, pipe, Result } from '@apoyo/std'
import { DecodeError } from '@apoyo/decoders'
import { CsvParser } from './CsvParser'
import { CsvError } from './CsvError'

export type CsvOk<A> = { row: number; data: A }
export type CsvKo = { row: number; errors: CsvError[] }
export type CsvResult<A> = Result<CsvOk<A>, CsvKo>

export const fromRow = (row: CsvParser.Row): CsvResult<unknown> =>
  row.errors.length === 0
    ? Result.ok({
        row: row.row,
        data: row.data
      })
    : Result.ko({
        row: row.row,
        errors: row.errors
      })

export const decode = <A, B>(decoder: (input: A) => Result<B, DecodeError>) => (row: CsvOk<A>): CsvResult<B> => {
  const result = decoder(row.data)
  if (Result.isOk(result)) {
    return Result.ok({
      row: row.row,
      data: result.ok
    })
  }

  return Result.ko({
    row: row.row,
    errors: pipe(
      result.ko,
      DecodeError.flatten,
      Arr.map((err) => CsvError.leaf('Validation', 'invalidData', DecodeError.formatError(err))),
      Arr.map(CsvError.fromLeaf(row.row))
    )
  })
}

export const CsvResult = {
  fromRow,
  decode
}
