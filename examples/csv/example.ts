import { Arr, Decode, flow, once, pipe } from '@apoyo/std'
import { CsvParser, CsvHeader, CsvResult } from '@apoyo/csv'

export async function main() {
  const content = `id,name\n1,John\n2,Doe\n3,Smith`
  const seq = CsvParser.streamAsync(content, 1000, {
    header: true,
    delimiter: ','
  })

  const validateHeader = CsvHeader.sequence(
    CsvHeader.checkDelimiter,
    CsvHeader.checkValidColumns(['id', 'name', 'email']),
    CsvHeader.checkRequiredColumns(['id'])
  )

  const RowDecoder = Decode.struct({
    id: Decode.string,
    name: Decode.string,
    email: Decode.email
  })

  const stats = {
    total: 0,
    ok: 0,
    ko: 0
  }
  for await (const rows of seq) {
    const errors = pipe(rows[0].meta, once(flow(CsvHeader.fromMeta, validateHeader)))
    if (errors.length > 0) {
      throw new Error('Invalid header')
    }

    const [ok, ko] = pipe(rows, Arr.map(CsvResult.fromRow), Arr.separate)
    const [valid, invalid] = pipe(ok, Arr.map(CsvResult.decode(RowDecoder)), Arr.separate)

    stats.total += rows.length
    stats.ok += valid.length
    stats.ko += ko.length + invalid.length
  }
  return stats
}
