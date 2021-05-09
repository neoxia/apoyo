import { pipe } from '@apoyo/std'
import { DecodeError } from '../src'

describe('DecodeError.toTree', () => {
  it('should exec Value case', () => {
    const tree = pipe(DecodeError.value(42, 'value is not a string'), DecodeError.toTree)
    expect(tree.value).toBe('cannot decode 42: value is not a string')
    expect(tree.forest.length).toEqual(0)
  })
  it('should exec Value case with info', () => {
    const tree = pipe(DecodeError.value(42, 'value is not a string', {}), DecodeError.toTree)
    expect(tree.value).toBe('cannot decode 42: value is not a string')
    expect(tree.forest.length).toEqual(0)
  })

  it('should exec Key case', () => {
    const err = DecodeError.value(42, 'value is not a string')
    const tree = pipe(DecodeError.key('name', err), DecodeError.toTree)
    expect(tree.value).toBe('property "name"')
    expect(tree.forest.length).toEqual(1)
  })

  it('should exec Index case', () => {
    const err = DecodeError.value(42, 'value is not a string')
    const tree = pipe(DecodeError.index(0, err), DecodeError.toTree)
    expect(tree.value).toBe('index 0')
    expect(tree.forest.length).toEqual(1)
  })

  it('should exec Member case', () => {
    const err = DecodeError.value(42, 'value is not a string')
    const tree = pipe(DecodeError.member(0, err), DecodeError.toTree)
    expect(tree.value).toBe('member 0')
    expect(tree.forest.length).toEqual(1)
  })

  it('should exec Wrap case', () => {
    const err = DecodeError.value(42, 'value is not a string')
    const member1 = DecodeError.member(0, err)
    const member2 = DecodeError.member(1, err)
    const tree = pipe(DecodeError.union([member1, member2]), DecodeError.toTree)
    expect(tree.value).toBe('union')
    expect(tree.forest.length).toEqual(2)
  })

  it('should exec Wrap case with name', () => {
    const err = DecodeError.value(42, 'value is not a string')
    const member1 = DecodeError.member(0, err)
    const member2 = DecodeError.member(1, err)
    const tree = pipe(DecodeError.union([member1, member2], 'MyUnion'), DecodeError.toTree)
    expect(tree.value).toBe('union MyUnion')
    expect(tree.forest.length).toEqual(2)
  })
})

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
