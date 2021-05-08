import { pipe } from '@apoyo/std'
import { CsvHeader, CsvParser } from '../src'

describe('CsvError.leaf', () => {
  const meta: CsvParser.Meta = {
    delimiter: ',',
    fields: ['id', 'name']
  }

  it('should return expected structure', () => {
    const header = CsvHeader.fromMeta(meta)
    expect(header).toEqual(meta)
  })

  it('should throw on missing fields', () => {
    const io = () =>
      CsvHeader.fromMeta({
        delimiter: ','
      })
    expect(io).toThrow()
  })
})

describe('CsvHeader.checkDelimiter', () => {
  it('should return no errors on correct headers', () => {
    const errors = pipe(
      {
        delimiter: ',',
        fields: ['id', 'name']
      },
      CsvHeader.checkDelimiter
    )

    expect(errors).toEqual([])
  })

  it('should check if header used bad delimiter', () => {
    const errors = pipe(
      {
        delimiter: ',',
        fields: ['id;name']
      },
      CsvHeader.checkDelimiter
    )

    expect(errors).toEqual([
      {
        row: 1,
        type: 'Header',
        code: 'InvalidSeparator',
        message: `Wrong csv separator used. Use "," instead.`
      }
    ])
  })
})

describe('CsvHeader.checkValidColumns', () => {
  const header: CsvHeader = {
    delimiter: ',',
    fields: ['id', 'name']
  }

  it('should return no errors when everything is ok', () => {
    const errors = pipe(header, CsvHeader.checkValidColumns(['id', 'name']))
    expect(errors).toEqual([])
  })

  it('should return no errors on missing column', () => {
    const errors = pipe(header, CsvHeader.checkValidColumns(['id', 'name', 'email']))
    expect(errors).toEqual([])
  })

  it('should return an error on invalid column', () => {
    const errors = pipe(header, CsvHeader.checkValidColumns(['id', 'email']))
    expect(errors).toEqual([
      {
        row: 1,
        type: 'Header',
        code: 'InvalidColumn',
        message: `Header contains invalid column "name".`
      }
    ])
  })
})

describe('CsvHeader.checkRequiredColumns', () => {
  const header: CsvHeader = {
    delimiter: ',',
    fields: ['id', 'name']
  }

  it('should return no errors when everything is ok', () => {
    const errors = pipe(header, CsvHeader.checkRequiredColumns(['id', 'name']))
    expect(errors).toEqual([])
  })

  it('should return no errors on extra columns', () => {
    const errors = pipe(header, CsvHeader.checkRequiredColumns(['id']))
    expect(errors).toEqual([])
  })

  it('should return an error on missing column', () => {
    const errors = pipe(header, CsvHeader.checkRequiredColumns(['id', 'email']))
    expect(errors).toEqual([
      {
        row: 1,
        type: 'Header',
        code: 'MissingColumn',
        message: `Header is missing required column "email".`
      }
    ])
  })
})

describe('CsvHeader.sequence', () => {
  it('should combine multiple header validator', () => {
    const errors = pipe(
      {
        delimiter: ',',
        fields: ['id', 'name']
      },
      CsvHeader.sequence(
        CsvHeader.checkDelimiter,
        CsvHeader.checkValidColumns(['id', 'name', 'email']),
        CsvHeader.checkRequiredColumns(['id'])
      )
    )

    expect(errors).toEqual([])
  })

  it('should return on first error', () => {
    const errors = pipe(
      {
        delimiter: ',',
        fields: ['id', 'name']
      },
      CsvHeader.sequence(
        CsvHeader.checkDelimiter,
        CsvHeader.checkValidColumns(['id', 'email']),
        CsvHeader.checkRequiredColumns(['id'])
      )
    )

    expect(errors).toEqual([
      {
        row: 1,
        type: 'Header',
        code: 'InvalidColumn',
        message: `Header contains invalid column "name".`
      }
    ])
  })
})
