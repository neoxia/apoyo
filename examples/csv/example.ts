import { Arr, flow, once, pipe } from '@apoyo/std'
import { CsvParser, CsvHeader, CsvResult } from '@apoyo/csv'
import { BooleanDecoder, IntegerDecoder, ObjectDecoder, TextDecoder } from '@apoyo/decoders'

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

  const RowDecoder = ObjectDecoder.struct({
    id: TextDecoder.string,
    name: TextDecoder.string,
    age: pipe(IntegerDecoder.int, IntegerDecoder.between(0, 120)),
    isActive: BooleanDecoder.boolean,
    email: TextDecoder.email
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
