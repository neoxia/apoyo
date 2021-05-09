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
    const tree = pipe(DecodeError.object([DecodeError.key('name', err)]), DecodeError.toTree)
    expect(tree).toEqual({
      value: 'object',
      forest: [
        {
          value: 'property "name"',
          forest: [
            {
              value: 'cannot decode 42: value is not a string',
              forest: []
            }
          ]
        }
      ]
    })
  })

  it('should exec Index case', () => {
    const err = DecodeError.value(42, 'value is not a string')
    const tree = pipe(DecodeError.array([DecodeError.index(0, err)]), DecodeError.toTree)

    expect(tree).toEqual({
      value: 'array',
      forest: [
        {
          value: 'index 0',
          forest: [
            {
              value: 'cannot decode 42: value is not a string',
              forest: []
            }
          ]
        }
      ]
    })
  })

  it('should exec Member case', () => {
    const err = DecodeError.value(42, 'value is not a string')
    const tree = pipe(DecodeError.union([DecodeError.member(0, err)]), DecodeError.toTree)
    expect(tree).toEqual({
      value: 'union',
      forest: [
        {
          value: 'member 0',
          forest: [
            {
              value: 'cannot decode 42: value is not a string',
              forest: []
            }
          ]
        }
      ]
    })
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

describe('DecodeError.flatten', () => {
  it('should return expected results for arrays', () => {
    const err = DecodeError.value(42, 'value is not a string')
    const errors = pipe(DecodeError.array([DecodeError.index(0, err)]), DecodeError.flatten)

    expect(errors).toEqual([
      {
        value: err.value,
        message: err.message,
        meta: err.meta,
        path: ['index 0']
      }
    ])
  })

  it('should return expected results for objects', () => {
    const err = DecodeError.value(42, 'value is not a string')
    const errors = pipe(DecodeError.object([DecodeError.key('name', err)]), DecodeError.flatten)

    expect(errors).toEqual([
      {
        value: err.value,
        message: err.message,
        meta: err.meta,
        path: ['property "name"']
      }
    ])
  })

  it('should return expected results for unions', () => {
    const valueErr = DecodeError.value(42, 'value is not a string')
    const unionErr = pipe(DecodeError.union([DecodeError.member(0, valueErr), DecodeError.member(1, valueErr)]))

    const errors = pipe(unionErr, DecodeError.flatten)

    expect(errors).toEqual([
      {
        value: 42,
        message: 'value is not a string',
        meta: {},
        path: ['union (member 0)']
      },
      {
        value: 42,
        message: 'value is not a string',
        meta: {},
        path: ['union (member 1)']
      }
    ])
  })

  it('should return expected results for mixed nested', () => {
    const err = pipe(
      DecodeError.array([
        DecodeError.index(
          0,
          DecodeError.object([
            DecodeError.key(
              'id',
              DecodeError.union([
                DecodeError.member(0, DecodeError.value(false, 'value is not a string')),
                DecodeError.member(1, DecodeError.value(false, 'value is not a number'))
              ])
            ),
            DecodeError.key('name', DecodeError.value(42, 'value is not a string'))
          ])
        )
      ])
    )
    const errors = pipe(err, DecodeError.flatten)

    expect(errors).toEqual([
      {
        value: false,
        message: 'value is not a string',
        meta: {},
        path: ['index 0', 'property "id"', 'union (member 0)']
      },
      {
        value: false,
        message: 'value is not a number',
        meta: {},
        path: ['index 0', 'property "id"', 'union (member 1)']
      },
      {
        value: 42,
        message: 'value is not a string',
        meta: {},
        path: ['index 0', 'property "name"']
      }
    ])
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
