import { pipe } from '@apoyo/std'
import { DecodeError, DecodeErrorTag } from '../src'

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
        path: [
          {
            tag: DecodeErrorTag.ARRAY,
            kind: 'array'
          },
          {
            tag: DecodeErrorTag.INDEX,
            index: 0
          }
        ]
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
        path: [
          {
            tag: DecodeErrorTag.OBJECT,
            kind: 'object'
          },
          {
            tag: DecodeErrorTag.KEY,
            key: 'name'
          }
        ]
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
        path: [
          {
            tag: DecodeErrorTag.UNION,
            kind: 'union'
          },
          {
            tag: DecodeErrorTag.MEMBER,
            index: 0
          }
        ]
      },
      {
        value: 42,
        message: 'value is not a string',
        meta: {},
        path: [
          {
            tag: DecodeErrorTag.UNION,
            kind: 'union'
          },
          {
            tag: DecodeErrorTag.MEMBER,
            index: 1
          }
        ]
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
        path: [
          {
            tag: DecodeErrorTag.ARRAY,
            kind: 'array'
          },
          {
            tag: DecodeErrorTag.INDEX,
            index: 0
          },
          {
            tag: DecodeErrorTag.OBJECT,
            kind: 'object'
          },
          {
            tag: DecodeErrorTag.KEY,
            key: 'id'
          },
          {
            tag: DecodeErrorTag.UNION,
            kind: 'union'
          },
          {
            tag: DecodeErrorTag.MEMBER,
            index: 0
          }
        ]
      },
      {
        value: false,
        message: 'value is not a number',
        meta: {},
        path: [
          {
            tag: DecodeErrorTag.ARRAY,
            kind: 'array'
          },
          {
            tag: DecodeErrorTag.INDEX,
            index: 0
          },
          {
            tag: DecodeErrorTag.OBJECT,
            kind: 'object'
          },
          {
            tag: DecodeErrorTag.KEY,
            key: 'id'
          },
          {
            tag: DecodeErrorTag.UNION,
            kind: 'union'
          },
          {
            tag: DecodeErrorTag.MEMBER,
            index: 1
          }
        ]
      },
      {
        value: 42,
        message: 'value is not a string',
        meta: {},
        path: [
          {
            tag: DecodeErrorTag.ARRAY,
            kind: 'array'
          },
          {
            tag: DecodeErrorTag.INDEX,
            index: 0
          },
          {
            tag: DecodeErrorTag.OBJECT,
            kind: 'object'
          },
          {
            tag: DecodeErrorTag.KEY,
            key: 'name'
          }
        ]
      }
    ])
  })
})

describe('DecodeError.format', () => {
  it('should return expected results for arrays', () => {
    const err = DecodeError.value(42, 'value is not a string')
    const errors = pipe(DecodeError.array([DecodeError.index(0, err)]), DecodeError.format)

    expect(errors).toEqual([
      {
        value: err.value,
        message: err.message,
        meta: err.meta,
        description: `cannot decode 42: value is not a string, at array, at index 0`,
        path: '[0]'
      }
    ])
  })

  it('should return expected results for objects', () => {
    const err = DecodeError.value(42, 'value is not a string')
    const errors = pipe(DecodeError.object([DecodeError.key('name', err)]), DecodeError.format)

    expect(errors).toEqual([
      {
        value: err.value,
        message: err.message,
        meta: err.meta,
        description: `cannot decode 42: value is not a string, at object, at property "name"`,
        path: 'name'
      }
    ])
  })

  it('should return expected results for unions', () => {
    const valueErr = DecodeError.value(42, 'value is not a string')
    const unionErr = pipe(DecodeError.union([DecodeError.member(0, valueErr), DecodeError.member(1, valueErr)]))

    const errors = pipe(unionErr, DecodeError.format)

    expect(errors).toEqual([
      {
        value: 42,
        message: 'value is not a string',
        meta: {},
        description: `cannot decode 42: value is not a string, at union, at member 0`,
        path: ''
      },
      {
        value: 42,
        message: 'value is not a string',
        meta: {},
        description: `cannot decode 42: value is not a string, at union, at member 1`,
        path: ''
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
