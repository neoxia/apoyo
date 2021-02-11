import { Arr, Ord, Ordering, pipe } from '../src'

describe('Ord.string', () => {
  it('should return correct ordering', () => {
    expect(Ord.string('B', 'A')).toBe(Ordering.UP)
    expect(Ord.string('A', 'B')).toBe(Ordering.DOWN)
    expect(Ord.string('A', 'A')).toBe(Ordering.EQ)
  })

  it('should return expected results', () => {
    const sorted = ['Bread', 'Nutella', 'Butter'].sort(Ord.string)
    const expected = ['Bread', 'Butter', 'Nutella']
    expect(sorted).toEqual(expected)
  })
})

describe('Ord.boolean', () => {
  it('should return correct ordering', () => {
    expect(Ord.boolean(true, false)).toBe(Ordering.UP)
    expect(Ord.boolean(false, true)).toBe(Ordering.DOWN)
    expect(Ord.boolean(false, false)).toBe(Ordering.EQ)
    expect(Ord.boolean(true, true)).toBe(Ordering.EQ)
  })

  it('should return expected results', () => {
    const sorted = [true, false, true].sort(Ord.boolean)
    const expected = [false, true, true]
    expect(sorted).toEqual(expected)
  })
})

describe('Ord.date', () => {
  it('should return correct ordering', () => {
    expect(Ord.date(new Date(10), new Date(0))).toBe(Ordering.UP)
    expect(Ord.date(new Date(0), new Date(10))).toBe(Ordering.DOWN)
    expect(Ord.date(new Date(0), new Date(0))).toBe(Ordering.EQ)
  })

  it('should return expected results', () => {
    const sorted = [new Date(10), new Date(4), new Date(15)].sort(Ord.date).map((d) => d.getTime())
    const expected = [new Date(4), new Date(10), new Date(15)].map((d) => d.getTime())
    expect(sorted).toEqual(expected)
  })
})

describe('Ord.inverse', () => {
  const ord = Ord.inverse(Ord.number)

  it('should return inverse ordering', () => {
    expect(ord(10, 0)).toBe(-1)
    expect(ord(0, 10)).toBe(1)
    expect(ord(0, 0)).toBe(0)
  })

  it('should return expected results', () => {
    const sorted = [10, 4, 15, 6].sort(ord)
    const expected = [15, 10, 6, 4]
    expect(sorted).toEqual(expected)
  })

  it('should return expected results with double inverse', () => {
    const ord = pipe(Ord.number, Ord.inverse, Ord.inverse)
    const sorted = [10, 4, 15, 6].sort(ord)
    const expected = [4, 6, 10, 15]
    expect(sorted).toEqual(expected)
  })
})

describe('Ord.option', () => {
  const ord = pipe(Ord.number, Ord.option)

  it('should return correct ordering', () => {
    expect(ord(undefined, undefined)).toBe(Ordering.EQ)
    expect(ord(undefined, 10)).toBe(Ordering.UP)
    expect(ord(undefined, 0)).toBe(Ordering.UP)
    expect(ord(10, undefined)).toBe(Ordering.DOWN)
    expect(ord(0, undefined)).toBe(Ordering.DOWN)
    expect(ord(0, 10)).toBe(Ordering.DOWN)
    expect(ord(10, 0)).toBe(Ordering.UP)
    expect(ord(0, 0)).toBe(Ordering.EQ)
  })

  it('should return expected results', () => {
    const sorted = pipe([10, undefined, 4, 6, undefined], Arr.sort(ord))
    const expected = [4, 6, 10, undefined, undefined]
    expect(sorted).toEqual(expected)
  })
})

describe('Ord.nullable', () => {
  const ord = pipe(Ord.number, Ord.nullable)

  it('should return correct ordering', () => {
    expect(ord(null, null)).toBe(Ordering.EQ)
    expect(ord(null, 10)).toBe(Ordering.UP)
    expect(ord(null, 0)).toBe(Ordering.UP)
    expect(ord(10, null)).toBe(Ordering.DOWN)
    expect(ord(0, null)).toBe(Ordering.DOWN)
    expect(ord(0, 10)).toBe(Ordering.DOWN)
    expect(ord(10, 0)).toBe(Ordering.UP)
    expect(ord(0, 0)).toBe(Ordering.EQ)
  })

  it('should return expected results', () => {
    const sorted = [10, null, 4, 6, null].sort(ord)
    const expected = [4, 6, 10, null, null]
    expect(sorted).toEqual(expected)
  })
})

describe('first Ord.option + then Ord.inverse', () => {
  const ord = pipe(Ord.number, Ord.option, Ord.inverse)

  it('should return correct ordering', () => {
    // All orderings should be inversed

    expect(ord(undefined, undefined)).toBe(Ordering.EQ)
    expect(ord(10, undefined)).toBe(Ordering.UP)
    expect(ord(0, undefined)).toBe(Ordering.UP)
    expect(ord(undefined, 10)).toBe(Ordering.DOWN)
    expect(ord(undefined, 0)).toBe(Ordering.DOWN)

    expect(ord(10, 0)).toBe(Ordering.DOWN)
    expect(ord(0, 10)).toBe(Ordering.UP)
    expect(ord(0, 0)).toBe(Ordering.EQ)
  })

  it('should return expected results', () => {
    // JS sort will not work, as JS always puts undefined values last AFTER sort
    const sorted = pipe([10, undefined, 4, 6, undefined], Arr.sort(ord))
    const expected = [undefined, undefined, 10, 6, 4]
    expect(sorted).toEqual(expected)
  })
})

describe('first Ord.inverse + then Ord.option', () => {
  const ord = pipe(Ord.number, Ord.inverse, Ord.option)

  it('should return correct ordering', () => {
    // Should be the same as option ordering

    expect(ord(undefined, undefined)).toBe(Ordering.EQ)
    expect(ord(10, undefined)).toBe(Ordering.DOWN)
    expect(ord(0, undefined)).toBe(Ordering.DOWN)
    expect(ord(undefined, 10)).toBe(Ordering.UP)
    expect(ord(undefined, 0)).toBe(Ordering.UP)

    // Only number orderings should be inversed
    expect(ord(10, 0)).toBe(Ordering.DOWN)
    expect(ord(0, 10)).toBe(Ordering.UP)
    expect(ord(0, 0)).toBe(Ordering.EQ)
  })

  it('should return expected results', () => {
    const sorted = pipe([10, undefined, 4, 6, undefined], Arr.sort(ord))
    const expected = [10, 6, 4, undefined, undefined]
    expect(sorted).toEqual(expected)
  })
})

describe('first Ord.nullable + then Ord.inverse', () => {
  const ord = pipe(Ord.number, Ord.nullable, Ord.inverse)

  it('should return correct ordering', () => {
    // All orderings should be inversed

    expect(ord(null, null)).toBe(Ordering.EQ)
    expect(ord(null, 10)).toBe(Ordering.DOWN)
    expect(ord(null, 0)).toBe(Ordering.DOWN)
    expect(ord(10, null)).toBe(Ordering.UP)
    expect(ord(0, null)).toBe(Ordering.UP)

    expect(ord(0, 10)).toBe(Ordering.UP)
    expect(ord(10, 0)).toBe(Ordering.DOWN)
    expect(ord(0, 0)).toBe(Ordering.EQ)
  })

  it('should return expected results', () => {
    const sorted = [10, null, 4, 6, null].sort(ord)
    const expected = [null, null, 10, 6, 4]
    expect(sorted).toEqual(expected)
  })
})

interface Todo {
  id: number
  title: string
  done: boolean
  created_at: string
}

const todos: Todo[] = [
  {
    id: 3,
    title: 'Sleep',
    done: false,
    created_at: '2021-02-10 10:00'
  },
  {
    id: 1,
    title: 'Buy cheese',
    done: false,
    created_at: '2021-02-11 10:00'
  },
  {
    id: 4,
    title: 'Work',
    done: true,
    created_at: '2021-02-10 10:00'
  },
  {
    id: 2,
    title: 'Buy bread',
    done: true,
    created_at: '2021-02-11 10:00'
  }
]

describe('Ord.contramap', () => {
  const ordTodo = pipe(
    Ord.string,
    Ord.contramap((todo: Todo) => todo.title)
  )

  it('should return expected results', () => {
    const sorted = pipe(todos, Arr.sort(ordTodo))
    const expected = [todos[3], todos[1], todos[0], todos[2]]
    expect(sorted).toEqual(expected)
  })
})

describe('Ord.concat', () => {
  const ordByTitle = pipe(
    Ord.string,
    Ord.contramap((todo: Todo) => todo.title)
  )
  const ordByDone = pipe(
    Ord.boolean,
    Ord.contramap((todo: Todo) => todo.done)
  )

  const ordTodo = Ord.concat(ordByDone, ordByTitle)

  it('should return expected results', () => {
    const sorted = pipe(todos, Arr.sort(ordTodo))
    const expected = [todos[1], todos[0], todos[3], todos[2]]
    expect(sorted).toEqual(expected)
  })
})

describe('Ord.concat + Ord.option', () => {
  interface Contact {
    interacted_at?: string
    created_at: string
  }

  const contacts: Contact[] = [
    {
      interacted_at: '2020-12-19',
      created_at: '2019-01-01'
    },
    {
      interacted_at: '2020-12-20',
      created_at: '2019-01-02'
    },
    {
      created_at: '2021-01-01'
    },
    {
      created_at: '2021-01-02'
    },
    {
      created_at: '2021-01-02'
    }
  ]

  const ordByInteractedAt = pipe(
    Ord.date,
    Ord.inverse,
    Ord.option,
    Ord.contramap((c: Contact) => (c.interacted_at ? new Date(c.interacted_at) : undefined))
  )
  const ordByCreatedAt = pipe(
    Ord.date,
    Ord.contramap((c: Contact) => new Date(c.created_at))
  )

  const ordContact = Ord.concat(ordByInteractedAt, ordByCreatedAt)

  it('should return expected results', () => {
    const sorted = pipe(contacts, Arr.sort(ordContact))
    const expected = [contacts[1], contacts[0], contacts[2], contacts[3], contacts[4]]
    expect(sorted).toEqual(expected)
  })
})

describe('Ord.eq', () => {
  const eqNumber = pipe(Ord.number, Ord.eq)

  it('should be equal', () => {
    expect(eqNumber(10, 10)).toBe(true)
  })

  it('should be different', () => {
    expect(eqNumber(7, 10)).toBe(false)
  })

  it('should be curriable', () => {
    const res = [1, 2, 3, 4].find(eqNumber(3))
    expect(res).toBe(3)
  })
})

describe('Ord.lt', () => {
  const ltNumber = pipe(Ord.number, Ord.lt)

  it('should be true', () => {
    expect(ltNumber(5, 10)).toBe(true)
  })

  it('should be false', () => {
    expect(ltNumber(15, 10)).toBe(false)
    expect(ltNumber(10, 10)).toBe(false)
  })

  it('should be curriable', () => {
    const res = [1, 2, 3, 4].filter(ltNumber(3))
    expect(res).toEqual([1, 2])
  })
})

describe('Ord.lte', () => {
  const lteNumber = pipe(Ord.number, Ord.lte)

  it('should be true', () => {
    expect(lteNumber(5, 10)).toBe(true)
    expect(lteNumber(10, 10)).toBe(true)
  })

  it('should be false', () => {
    expect(lteNumber(15, 10)).toBe(false)
  })

  it('should be curriable', () => {
    const res = [1, 2, 3, 4].filter(lteNumber(3))
    expect(res).toEqual([1, 2, 3])
  })
})

describe('Ord.gt', () => {
  const gtNumber = pipe(Ord.number, Ord.gt)

  it('should be true', () => {
    expect(gtNumber(15, 10)).toBe(true)
  })

  it('should be false', () => {
    expect(gtNumber(5, 10)).toBe(false)
    expect(gtNumber(10, 10)).toBe(false)
  })

  it('should be curriable', () => {
    const res = [1, 2, 3, 4].filter(gtNumber(3))
    expect(res).toEqual([4])
  })
})

describe('Ord.gte', () => {
  const gteNumber = pipe(Ord.number, Ord.gte)

  it('should be true', () => {
    expect(gteNumber(15, 10)).toBe(true)
    expect(gteNumber(10, 10)).toBe(true)
  })

  it('should be false', () => {
    expect(gteNumber(5, 10)).toBe(false)
  })

  it('should be curriable', () => {
    const res = [1, 2, 3, 4].filter(gteNumber(3))
    expect(res).toEqual([3, 4])
  })
})

describe('Ord.min', () => {
  const minNumber = pipe(Ord.number, Ord.min)

  it('should return expected results', () => {
    expect(minNumber(15, 10)).toBe(10)
    expect(minNumber(5, 10)).toBe(5)
    expect(minNumber(10, 10)).toBe(10)
  })

  it('should be curriable', () => {
    const arr = [1, 2, 3, 4]
    const res = arr.reduce(minNumber, arr[0])
    expect(res).toEqual(1)
  })
})

describe('Ord.max', () => {
  const maxNumber = pipe(Ord.number, Ord.max)

  it('should return expected results', () => {
    expect(maxNumber(15, 10)).toBe(15)
    expect(maxNumber(5, 10)).toBe(10)
    expect(maxNumber(10, 10)).toBe(10)
  })

  it('should be curriable', () => {
    const arr = [1, 2, 3, 4]
    const res = arr.reduce(maxNumber, arr[0])
    expect(res).toEqual(4)
  })
})
