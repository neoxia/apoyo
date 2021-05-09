import { pipe, Result } from '@apoyo/std'
import { BooleanDecoder, Decoder, NumberDecoder, ObjectDecoder, TextDecoder } from '../src'

describe('Decode.dict', () => {
  const decodeStringDict = ObjectDecoder.dict(TextDecoder.string)

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
  const decodeTodo = ObjectDecoder.struct({
    id: NumberDecoder.number,
    title: TextDecoder.varchar(1, 100),
    done: BooleanDecoder.boolean,
    description: pipe(TextDecoder.varchar(0, 1000), TextDecoder.nullable, Decoder.optional)
  })

  interface Todo extends Decoder.TypeOf<typeof decodeTodo> {}

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
