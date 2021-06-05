import { Arr, pipe, Tree } from '../src'

describe('Tree.of', () => {
  it('should return new leaf', () => {
    const item = Tree.of('a', [Tree.of('b'), Tree.of('c')])
    expect(item).toEqual({
      value: 'a',
      forest: [
        {
          value: 'b',
          forest: []
        },
        {
          value: 'c',
          forest: []
        }
      ]
    })
  })
})

describe('Tree.draw', () => {
  it('should return drawed string', () => {
    const item = Tree.of('<root>', [
      Tree.of('Api', [Tree.of('Config'), Tree.of('Database'), Tree.of('Routes')]),
      Tree.of('Database', [Tree.of('Config')]),
      Tree.of('Config', [Tree.of('Env')]),
      Tree.of('Env')
    ])
    const expected = pipe(
      [
        `<root>`,
        `├─ Api`,
        `│  ├─ Config`,
        `│  ├─ Database`,
        `│  └─ Routes`,
        `├─ Database`,
        `│  └─ Config`,
        `├─ Config`,
        `│  └─ Env`,
        `└─ Env`
      ],
      Arr.join('\n')
    )
    expect(pipe(item, Tree.draw)).toBe(expected)
  })
})
