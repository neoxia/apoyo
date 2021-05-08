import { Decode, pipe, Result } from '@apoyo/std'
import { CsvResult } from '../src'

describe('CsvResult.fromRow', () => {
  it('should return Ok if no errors have been found', () => {
    const result = CsvResult.fromRow({
      data: {
        id: '1',
        name: 'John'
      },
      errors: [],
      row: 2
    } as any)

    expect(Result.isOk(result)).toBe(true)
  })
  it('should return Ko if at least 1 error has been found', () => {
    const result = CsvResult.fromRow({
      data: {
        id: '1',
        name: 'John',
        email: 'xxxx'
      },
      errors: [
        {
          row: 2,
          type: 'Validation',
          code: 'email',
          message: 'Invalid email'
        }
      ],
      row: 2
    } as any)

    expect(Result.isKo(result)).toBe(true)
  })
})

describe('CsvResult.decode', () => {
  const schema = Decode.struct({
    id: pipe(
      Decode.string,
      Decode.filter((str) => str.length > 0, 'Id is required')
    ),
    name: pipe(
      Decode.string,
      Decode.filter((str) => str.length > 0, 'Name is required')
    )
  })

  it('should return no errors on success', () => {
    const result = pipe(
      {
        row: 2,
        data: {
          id: '1',
          name: 'John'
        }
      },
      CsvResult.decode(schema)
    )

    expect(result).toEqual(
      Result.ok({
        row: 2,
        data: {
          id: '1',
          name: 'John'
        }
      })
    )
  })

  it('should return all csv errors on error', () => {
    const result = pipe(
      {
        row: 2,
        data: {
          id: '',
          name: ''
        }
      },
      CsvResult.decode(schema)
    )

    expect(result).toEqual(
      Result.ko({
        row: 2,
        errors: [
          {
            row: 2,
            type: 'Validation',
            code: 'id',
            message: 'Id is required'
          },
          {
            row: 2,
            type: 'Validation',
            code: 'name',
            message: 'Name is required'
          }
        ]
      })
    )
  })
})
