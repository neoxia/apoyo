import { Arr, Ord, Ordering, pipe } from '../src'

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
