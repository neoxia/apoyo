import { Decode, DecodeError, isNull, pipe, Result } from '../src'

describe('Decode.string', () => {
  it('should succeed', () => {
    const res = Decode.string('some input')
    expect(Result.isOk(res)).toBe(true)
  })

  it('should fail', () => {
    const res = Decode.string(42)
    expect(Result.isKo(res)).toBe(true)
  })
})

describe('Decode.number', () => {
  it('should succeed', () => {
    const res = Decode.number(42)
    expect(Result.isOk(res)).toBe(true)
  })

  it('should fail', () => {
    const res = Decode.number('42')
    expect(Result.isOk(res)).toBe(false)
  })
})

describe('Decode.option', () => {
  it('should succeed', () => {
    expect(pipe(42, Decode.number, Result.isOk)).toBe(true)
    expect(pipe(undefined, Decode.number, Result.isKo)).toBe(true)
    expect(pipe(undefined, Decode.option(Decode.number), Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe(null, Decode.option(Decode.number), Result.isKo)).toBe(true)
  })
})

describe('Decode.nullable', () => {
  it('should succeed', () => {
    expect(pipe(42, Decode.number, Result.isOk)).toBe(true)
    expect(pipe(null, Decode.number, Result.isKo)).toBe(true)
    expect(pipe(null, Decode.nullable(Decode.number), Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe(undefined, Decode.nullable(Decode.number), Result.isKo)).toBe(true)
  })
})

describe('Decode.uuid', () => {
  it('should succeed', () => {
    const res = Decode.uuid('393963d6-ec11-42df-a33f-dd027afe8f74')
    expect(Result.isOk(res)).toBe(true)
  })

  it('should fail', () => {
    const res = Decode.uuid('xxxx-xxxx-xxxx-xxxx-xxxx')
    expect(Result.isOk(res)).toBe(false)
  })
})

describe('Decode.email', () => {
  it('should succeed', () => {
    expect(pipe('john.doe@gmail.com', Decode.email, Result.isOk)).toBe(true)
    expect(pipe('john@gmail.com', Decode.email, Result.isOk)).toBe(true)
    expect(pipe('john@test.example.com', Decode.email, Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe('john.doe', Decode.email, Result.isKo)).toBe(true)
    expect(pipe('john.doe@gmail', Decode.email, Result.isKo)).toBe(true)
    expect(pipe('@gmail.com', Decode.email, Result.isKo)).toBe(true)
    expect(pipe('john.doe@.com', Decode.email, Result.isKo)).toBe(true)
  })
})

describe('Decode.int', () => {
  it('should succeed', () => {
    expect(pipe(42, Decode.int, Result.isOk)).toBe(true)
    expect(pipe(-42, Decode.int, Result.isOk)).toBe(true)
    expect(pipe(0, Decode.int, Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe(42.24, Decode.int, Result.isKo)).toBe(true)
    expect(pipe(-42.12, Decode.int, Result.isKo)).toBe(true)
  })
})

describe('Decode.uint', () => {
  it('should succeed', () => {
    expect(pipe(42, Decode.uint, Result.isOk)).toBe(true)
    expect(pipe(0, Decode.uint, Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe(-42, Decode.uint, Result.isKo)).toBe(true)
    expect(pipe(42.24, Decode.uint, Result.isKo)).toBe(true)
    expect(pipe(-42.12, Decode.uint, Result.isKo)).toBe(true)
  })
})

describe('Decode.date', () => {
  it('should succeed', () => {
    expect(pipe('2020-01-01', Decode.date, Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe('2020-01-01 10:00', Decode.date, Result.isKo)).toBe(true)
    expect(pipe('2020-13-01', Decode.date, Result.isKo)).toBe(true)
    expect(pipe('2020-12-36', Decode.date, Result.isKo)).toBe(true)
    expect(pipe(42, Decode.date, Result.isKo)).toBe(true)
  })
})

describe('Decode.datetime', () => {
  it('should succeed', () => {
    expect(pipe('2020-01-01T10:00:00', Decode.datetime, Result.isOk)).toBe(true)
    expect(pipe('2020-01-01 10:00:00', Decode.datetime, Result.isOk)).toBe(true)
    expect(pipe('2020-01-01 10:00:00Z', Decode.datetime, Result.isOk)).toBe(true)
  })

  it('should succeed without minutes', () => {
    expect(pipe('2020-01-01T10:00', Decode.datetime, Result.isOk)).toBe(true)
    expect(pipe('2020-01-01 10:00', Decode.datetime, Result.isOk)).toBe(true)
    expect(pipe('2020-01-01 10:00Z', Decode.datetime, Result.isOk)).toBe(true)
  })

  it('should succeed with Date.toISOString', () => {
    expect(pipe(new Date().toISOString(), Decode.datetime, Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe('2020-01-01', Decode.datetime, Result.isKo)).toBe(true)
    expect(pipe('2020-13-01 10:00', Decode.datetime, Result.isKo)).toBe(true)
    expect(pipe('2020-12-36 10:00', Decode.datetime, Result.isKo)).toBe(true)
    expect(pipe('2020-12-01 30:00', Decode.datetime, Result.isKo)).toBe(true)
    expect(pipe('2020-12-01 10:70', Decode.datetime, Result.isKo)).toBe(true)
    expect(pipe(42, Decode.datetime, Result.isKo)).toBe(true)
  })
})

describe('Decode.map', () => {
  const flooredNumber = pipe(
    Decode.number,
    Decode.map((x) => Math.floor(x))
  )

  it('should succeed', () => {
    const res = pipe(flooredNumber(42.2531726), Result.get)
    expect(res).toBe(42)
  })
})

describe('Decode.chain', () => {
  const stringToNumber = pipe(
    Decode.string,
    Decode.chain((x) => {
      const nb = parseFloat(x)
      return Number.isNaN(nb) ? Result.ko(DecodeError.value(x, `Could not parse string to number`)) : Result.ok(nb)
    })
  )

  it('should succeed', () => {
    const res = pipe(stringToNumber('42'), Result.get)
    expect(res).toBe(42)
  })
})

describe('Decode.filter', () => {
  const decoder = pipe(
    Decode.string,
    Decode.filter((x) => x.length > 0, `string should have 1 or more characters`, { minLength: 1 })
  )

  it('should succeed', () => {
    expect(pipe(decoder('42'), Result.isOk)).toBe(true)
  })
  it('should fail', () => {
    expect(pipe(decoder(''), Result.isKo)).toBe(true)
  })
})

describe('Decode.reject', () => {
  const decoder = pipe(
    Decode.string,
    Decode.reject((x) => x.length === 0, `string should have 1 or more characters`)
  )

  it('should succeed', () => {
    expect(pipe(decoder('42'), Result.isOk)).toBe(true)
  })
  it('should fail', () => {
    expect(pipe(decoder(''), Result.isKo)).toBe(true)
  })

  it('should exclude type on true', () => {
    const decoderRefine = pipe(
      Decode.string,
      Decode.nullable,
      Decode.reject(isNull, `value should not be null`, {
        nullable: false
      })
    )

    expect(pipe(decoderRefine('42'), Result.isOk)).toBe(true)
    expect(pipe(decoderRefine(null), Result.isOk)).toBe(false)
  })
})

describe('Decode.array', () => {
  const decodeStringArray = Decode.array(Decode.string)

  it('should succeed', () => {
    const res = pipe(decodeStringArray(['Hello', 'World']), Result.isOk)
    expect(res).toBe(true)
  })

  it('should fail with string', () => {
    const res = pipe(decodeStringArray('Hello'), Result.isKo)
    expect(res).toBe(true)
  })

  it('should fail with array of bad type', () => {
    const res = pipe(decodeStringArray([42]), Result.isKo)
    expect(res).toBe(true)
  })
})

describe('Decode.nonEmptyArray', () => {
  const decodeArr = Decode.nonEmptyArray(Decode.string)

  it('should succeed', () => {
    expect(pipe(['Hello', 'World'], decodeArr, Result.isOk)).toBe(true)
    expect(pipe(['Hello'], decodeArr, Result.isOk)).toBe(true)
  })

  it('should fail with empty string', () => {
    expect(pipe([], decodeArr, Result.isKo)).toBe(true)
  })
})

describe('Decode.dict', () => {
  const decodeStringDict = Decode.dict(Decode.string)

  it('should succeed', () => {
    const res = pipe(
      {
        foo: 'bar',
        hello: 'world'
      },
      decodeStringDict,
      Result.isOk
    )
    expect(res).toBe(true)
  })

  it('should fail with string', () => {
    const res = pipe(decodeStringDict('Hello'), Result.isKo)
    expect(res).toBe(true)
  })

  it('should fail with dict of bad type', () => {
    const res = pipe(decodeStringDict({ foo: 42 }), Result.isKo)
    expect(res).toBe(true)
  })
})

describe('Decode.struct', () => {
  const decodeTodo = Decode.struct({
    id: Decode.number,
    title: Decode.string,
    done: Decode.boolean,
    description: pipe(Decode.string, Decode.option)
  })

  interface Todo extends Decode.TypeOf<typeof decodeTodo> {}

  it('should succeed', () => {
    const todos: Todo[] = [
      {
        id: 2,
        title: 'Eat breakfast',
        done: false,
        description: 'A delicious bread with Nutella'
      },
      {
        id: 1,
        title: 'Wake up',
        done: true
      }
    ]

    expect(pipe(todos[0], decodeTodo, Result.isOk)).toBe(true)
    expect(pipe(todos[1], decodeTodo, Result.isOk)).toBe(true)
  })

  it('should strip additional fields', () => {
    const base: Todo = {
      id: 2,
      title: 'Eat breakfast',
      done: false,
      description: 'A delicious bread with Nutella'
    }
    const todo: Todo = {
      ...base,
      // @ts-expect-error Todo doesn't have a created_at prop
      created_at: new Date()
    }

    expect(pipe(todo, decodeTodo, Result.get)).toEqual(base)
  })

  it('should fail with string', () => {
    const res = pipe(decodeTodo('Hello'), Result.isKo)
    expect(res).toBe(true)
  })

  it('should fail with empty struct', () => {
    const res = pipe(decodeTodo({}), Result.isKo)
    expect(res).toBe(true)
  })

  it('should fail with missing field', () => {
    // @ts-expect-error Todo is missing fields
    const todo: Todo = {
      title: 'Wake up',
      done: true
    }
    expect(pipe(decodeTodo(todo), Result.isKo)).toBe(true)
  })

  it('should fail with invalid field', () => {
    const todo: Todo = {
      // @ts-expect-error Todo.id is not a number
      id: 'not a number',
      title: 'Wake up',
      done: true
    }
    expect(pipe(decodeTodo(todo), Result.isKo)).toBe(true)
  })
})

describe('Decode.type', () => {
  const decodeTodo = Decode.type({
    id: Decode.number,
    title: Decode.string,
    done: Decode.boolean,
    description: pipe(Decode.string, Decode.option)
  })

  interface Todo extends Decode.TypeOf<typeof decodeTodo> {}

  it('should succeed', () => {
    const todos: Todo[] = [
      {
        id: 2,
        title: 'Eat breakfast',
        done: false,
        description: 'A delicious bread with Nutella'
      },
      {
        id: 1,
        title: 'Wake up',
        done: true
      }
    ]

    expect(pipe(todos[0], decodeTodo, Result.isOk)).toBe(true)
    expect(pipe(todos[1], decodeTodo, Result.isOk)).toBe(true)
  })

  it('should not strip additional fields', () => {
    const base: Todo = {
      id: 2,
      title: 'Eat breakfast',
      done: false,
      description: 'A delicious bread with Nutella'
    }
    const todo: Todo = {
      ...base,
      // @ts-expect-error Todo does not have a created_at field
      created_at: new Date()
    }

    expect(pipe(todo, decodeTodo, Result.get)).toEqual(todo)
  })

  it('should fail with string', () => {
    const res = pipe(decodeTodo('Hello'), Result.isKo)
    expect(res).toBe(true)
  })

  it('should fail with empty struct', () => {
    const res = pipe(decodeTodo({}), Result.isKo)
    expect(res).toBe(true)
  })

  it('should fail with missing field', () => {
    const todo = {
      title: 'Wake up',
      done: true
    }
    expect(pipe(decodeTodo(todo), Result.isKo)).toBe(true)
  })

  it('should fail with invalid field', () => {
    const todo = {
      id: 'not a number',
      title: 'Wake up',
      done: true
    }
    expect(pipe(decodeTodo(todo), Result.isKo)).toBe(true)
  })
})

describe('Decode.union', () => {
  const stringOrNumber = Decode.union(Decode.string, Decode.number)

  it('should succeed', () => {
    expect(pipe(stringOrNumber('string'), Result.isOk)).toBe(true)
    expect(pipe(stringOrNumber(42), Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    const res = pipe(stringOrNumber(false), Result.isKo)
    expect(res).toBe(true)
  })
})

describe('Decode.merge', () => {
  const a = Decode.struct({
    foo: Decode.string
  })
  const b = Decode.struct({
    bar: Decode.string
  })
  const merged = Decode.merge(a, b)

  it('should succeed', () => {
    expect(
      pipe(
        {
          foo: 'a',
          bar: 'b'
        },
        merged,
        Result.isOk
      )
    ).toBe(true)
  })

  it('should fail with empty struct', () => {
    const res = pipe({}, merged, Result.isKo)
    expect(res).toBe(true)
  })

  it('should fail with missing member', () => {
    const res = pipe({ foo: 'a' }, merged, Result.isKo)
    expect(res).toBe(true)
  })

  // TODO: test merge multiple "Decode.type"
})

describe('Decode.lazy', () => {
  interface Tree<T> {
    value: T
    forest: Tree<T>[]
  }

  // recursives types require manual typing
  const decodeStrTree: Decode<unknown, Tree<string>> = Decode.struct({
    value: Decode.string,
    forest: Decode.lazy(() => Decode.array(decodeStrTree))
  })

  // recursives types require manual typing
  const decodeStringTree: Decode<unknown, Tree<string>> = Decode.lazy(() =>
    Decode.struct({
      value: Decode.string,
      forest: Decode.array(decodeStringTree)
    })
  )

  const decodeGenericTree = <O>(decoder: Decode<unknown, O>): Decode<unknown, Tree<O>> =>
    Decode.lazy(() =>
      Decode.struct({
        value: decoder,
        forest: Decode.array(decodeGenericTree(decoder))
      })
    )

  const t: Tree<string> = {
    value: 'test',
    forest: [
      { value: 'foo', forest: [] },
      { value: 'bar', forest: [{ value: 'bar.foo', forest: [] }] }
    ]
  }

  it('should work', () => {
    expect(pipe(t, decodeStrTree, Result.isOk)).toBe(true)
    expect(pipe(t, decodeStringTree, Result.isOk)).toBe(true)
  })

  it('should work with generic types', () => {
    expect(pipe(t, decodeGenericTree(Decode.string), Result.isOk)).toBe(true)
  })
})
