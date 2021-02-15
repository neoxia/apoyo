import { DecodeError } from '../src'

const drawed = `
array
├─ index 0
│  └─ cannot decode "test": value is not a number
└─ index 1
   └─ cannot decode "another": value is not a number
`.trim()

describe('DecodeError.draw', () => {
  const err = DecodeError.array([
    DecodeError.index(0, DecodeError.value('test', 'value is not a number')),
    DecodeError.index(1, DecodeError.value('another', 'value is not a number'))
  ])

  it('should draw the expected result', () => {
    expect(DecodeError.draw(err)).toBe(drawed)
  })
})
