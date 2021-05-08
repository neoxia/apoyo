import { CsvError } from '../src'

describe('CsvError.leaf', () => {
  it('should return expected structure', () => {
    const error = CsvError.leaf('Validation', 'email', 'Invalid email')
    expect(error).toEqual({
      type: 'Validation',
      code: 'email',
      message: 'Invalid email'
    })
  })
})

describe('CsvError.writeHeader', () => {
  const options: CsvError.WriteOptions = {
    delimiter: ','
  }

  it('should write correct error header', () => {
    const header = CsvError.writeHeader(options)
    expect(header).toBe('row,type,code,message\n')
  })
})

describe('CsvError.writeLine', () => {
  const options: CsvError.WriteOptions = {
    delimiter: ','
  }

  const error: CsvError = {
    row: 1,
    type: 'InvalidHeader',
    code: 'MissingColumn',
    message: 'Column "mycolumn" is missing'
  }

  it('should write correctly one error line', () => {
    const content = CsvError.writeLine(error, options)
    expect(content).toBe('1,InvalidHeader,MissingColumn,"Column ""mycolumn"" is missing"\n')
  })

  it('should write correct multiple error lines', () => {
    const content = CsvError.writeLines([error], options)
    expect(content).toBe('1,InvalidHeader,MissingColumn,"Column ""mycolumn"" is missing"\n')
  })
})
