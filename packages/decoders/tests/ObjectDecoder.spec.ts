import { pipe, Result } from '@apoyo/std'
import { BooleanDecoder, DecodeError, Decoder, NumberDecoder, ObjectDecoder, TextDecoder } from '../src'

describe('ObjectDecoder.dict', () => {
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

const TodoDto = ObjectDecoder.struct({
  id: NumberDecoder.number,
  title: TextDecoder.varchar(1, 100),
  done: BooleanDecoder.boolean,
  description: pipe(TextDecoder.varchar(0, 1000), TextDecoder.nullable, Decoder.optional)
})

interface TodoDto extends Decoder.TypeOf<typeof TodoDto> {}

describe('ObjectDecoder.struct', () => {
  it('should succeed', () => {
    const todos: TodoDto[] = [
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

    expect(pipe(todos[0], TodoDto, Result.isOk)).toBe(true)
    expect(pipe(todos[1], TodoDto, Result.isOk)).toBe(true)
  })

  it('should strip additional fields', () => {
    const base: TodoDto = {
      id: 2,
      title: 'Eat breakfast',
      done: false,
      description: 'A delicious bread with Nutella'
    }
    const todo: TodoDto = {
      ...base,
      // @ts-expect-error Todo doesn't have a created_at prop
      created_at: new Date()
    }

    expect(pipe(todo, TodoDto, Result.get)).toEqual(base)
  })

  it('should fail with string', () => {
    const res = pipe(TodoDto('Hello'), Result.isKo)
    expect(res).toBe(true)
  })

  it('should fail with empty struct', () => {
    const res = pipe(TodoDto({}), Result.isKo)
    expect(res).toBe(true)
  })

  it('should fail with missing field', () => {
    // @ts-expect-error Todo is missing fields
    const todo: TodoDto = {
      title: 'Wake up',
      done: true
    }
    expect(pipe(TodoDto(todo), Result.isKo)).toBe(true)
  })

  it('should fail with invalid field', () => {
    const todo: TodoDto = {
      // @ts-expect-error Todo.id is not a number
      id: 'not a number',
      title: 'Wake up',
      done: true
    }
    expect(pipe(TodoDto(todo), Result.isKo)).toBe(true)
  })
})

describe('ObjectDecoder.omit', () => {
  const TodoPostDto = pipe(TodoDto, ObjectDecoder.omit(['id', 'done']))
  interface TodoPostDto extends Decoder.TypeOf<typeof TodoPostDto> {}

  it('should succeed without id', () => {
    const todo: TodoPostDto = {
      title: 'Wake up'
    }
    expect(pipe(todo, TodoPostDto, Result.isOk)).toBe(true)
  })

  it('should skip id and done properties', () => {
    const todo: TodoDto = {
      id: 1,
      done: false,
      title: 'Wake up'
    }
    expect(pipe(todo, TodoPostDto, Result.get)).toEqual({
      title: 'Wake up'
    })
  })
})

describe('ObjectDecoder.pick', () => {
  const TodoPostDto = pipe(TodoDto, ObjectDecoder.pick(['title', 'description']))
  interface TodoPostDto extends Decoder.TypeOf<typeof TodoPostDto> {}

  it('should succeed without id', () => {
    const todo: TodoPostDto = {
      title: 'Wake up'
    }
    expect(pipe(todo, TodoPostDto, Result.isOk)).toBe(true)
  })

  it('should skip id and done properties', () => {
    const todo: TodoDto = {
      id: 1,
      done: false,
      title: 'Wake up'
    }
    expect(pipe(todo, TodoPostDto, Result.get)).toEqual({
      title: 'Wake up'
    })
  })
})

describe('ObjectDecoder.partial', () => {
  const TodoPutDto = pipe(TodoDto, ObjectDecoder.partial, ObjectDecoder.omit(['id']))
  interface TodoPutDto extends Decoder.TypeOf<typeof TodoPutDto> {}

  it('should succeed without any properties', () => {
    const todo: TodoPutDto = {}
    expect(pipe(todo, TodoPutDto, Result.isOk)).toBe(true)
  })

  it('should succeed with properties', () => {
    const todo: TodoDto = {
      id: 1,
      done: false,
      title: 'Wake up'
    }
    expect(pipe(todo, TodoPutDto, Result.get)).toEqual({
      title: 'Wake up',
      done: false
    })
  })
})

describe('ObjectDecoder.guard', () => {
  const SignupDto = pipe(
    ObjectDecoder.struct({
      email: TextDecoder.email,
      password: TextDecoder.varchar(5, 50),
      passwordRepeat: TextDecoder.varchar(5, 50)
    }),
    ObjectDecoder.guard((dto) =>
      dto.password === dto.passwordRepeat
        ? undefined
        : DecodeError.object([
            DecodeError.key('passwordRepeat', DecodeError.value(dto.passwordRepeat, 'The passwords do not match'))
          ])
    )
  )
  interface SignupDto extends Decoder.TypeOf<typeof SignupDto> {}

  it('should succeed', () => {
    const dto = {
      email: 'test@example.com',
      password: 'mypassword',
      passwordRepeat: 'mypassword'
    }
    const result = pipe(dto, SignupDto)
    expect(pipe(result, Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    const dto = {
      email: 'test@example.com',
      password: 'mypassword',
      passwordRepeat: 'mypassword12345'
    }
    const result = pipe(dto, SignupDto)
    expect(pipe(result, Result.isKo)).toBe(true)
  })
})

// describe('ObjectDecoder.reject', () => {
//   const SignupDto = pipe(
//     ObjectDecoder.struct({
//       email: TextDecoder.email,
//       password: TextDecoder.varchar(5, 50),
//       passwordRepeat: TextDecoder.varchar(5, 50)
//     }),
//     ObjectDecoder.reject((user) => user.password !== user.passwordRepeat, 'The passwords do not match')
//   )
//   interface SignupDto extends Decoder.TypeOf<typeof SignupDto> {}

//   it('should succeed', () => {
//     const dto = {
//       email: 'test@example.com',
//       password: 'mypassword',
//       passwordRepeat: 'mypassword'
//     }
//     const result = pipe(dto, SignupDto)
//     expect(pipe(result, Result.isOk)).toBe(true)
//   })

//   it('should fail', () => {
//     const dto = {
//       email: 'test@example.com',
//       password: 'mypassword',
//       passwordRepeat: 'mypassword12345'
//     }
//     const result = pipe(dto, SignupDto)
//     expect(pipe(result, Result.isKo)).toBe(true)
//   })
// })
