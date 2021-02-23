import { Enum } from '../src'

enum TestEnum1 {
  a,
  b
}
enum TestEnum2 {
  a = 'a',
  b = 1,
  c = 1,
  d = 'e'
}
enum TestEnum3 {
  a = 'b',
  c = 1,
  '1a',
  '1b' = 'd'
}

describe('Enum.keys', () => {
  it('should return enum keys', () => {
    expect(Enum.keys(TestEnum1).sort()).toEqual(['a', 'b'].sort())
    expect(Enum.keys(TestEnum2).sort()).toEqual(['a', 'b', 'c', 'd'].sort())
    expect(Enum.keys(TestEnum3).sort()).toEqual(['a', 'c', '1a', '1b'].sort())
  })
})

describe('Enum.values', () => {
  it('should return enum values', () => {
    expect(Enum.values(TestEnum1).sort()).toEqual([0, 1].sort())
    expect(Enum.values(TestEnum2).sort()).toEqual(['a', 1, 1, 'e'].sort())
    expect(Enum.values(TestEnum3).sort()).toEqual(['b', 1, 2, 'd'].sort())
  })
})

describe('Enum.toPairs', () => {
  it('should return enum keys and values in pairs', () => {
    expect(Enum.toPairs(TestEnum1).sort()).toEqual(
      [
        ['a', 0],
        ['b', 1]
      ].sort()
    )
    expect(Enum.toPairs(TestEnum2).sort()).toEqual(
      [
        ['a', 'a'],
        ['b', 1],
        ['c', 1],
        ['d', 'e']
      ].sort()
    )
    expect(Enum.toPairs(TestEnum3).sort()).toEqual(
      [
        ['a', 'b'],
        ['c', 1],
        ['1a', 2],
        ['1b', 'd']
      ].sort()
    )
  })
})
