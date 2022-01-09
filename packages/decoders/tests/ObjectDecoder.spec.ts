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
      Decoder.validate(decodeStringDict),
      Result.isOk
    )
    expect(res).toBe(true)
  })

  it('should fail with string', () => {
    const res = pipe('Hello', Decoder.validate(decodeStringDict), Result.isKo)
    expect(res).toBe(true)
  })

  it('should fail with dict of bad type', () => {
    const res = pipe({ foo: 42 }, Decoder.validate(decodeStringDict), Result.isKo)
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

    const out1 = pipe(todos[0], Decoder.validate(TodoDto), Result.get)
    const out2 = pipe(todos[1], Decoder.validate(TodoDto), Result.get)

    expect(out1).toEqual({
      id: 2,
      title: 'Eat breakfast',
      done: false,
      description: 'A delicious bread with Nutella'
    })
    expect(out2).toEqual({
      id: 1,
      title: 'Wake up',
      done: true
    })
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

    expect(pipe(todo, Decoder.validate(TodoDto), Result.get)).toEqual(base)
  })

  it('should fail with string', () => {
    const res = pipe('Hello', Decoder.validate(TodoDto), Result.isKo)
    expect(res).toBe(true)
  })

  it('should fail with empty struct', () => {
    const res = pipe({}, Decoder.validate(TodoDto), Result.isKo)
    expect(res).toBe(true)
  })

  it('should fail with missing field', () => {
    // @ts-expect-error Todo is missing fields
    const todo: TodoDto = {
      title: 'Wake up',
      done: true
    }
    expect(pipe(todo, Decoder.validate(TodoDto), Result.isKo)).toBe(true)
  })

  it('should fail with invalid field', () => {
    const todo: TodoDto = {
      // @ts-expect-error Todo.id is not a number
      id: 'not a number',
      title: 'Wake up',
      done: true
    }
    expect(pipe(todo, Decoder.validate(TodoDto), Result.isKo)).toBe(true)
  })

  it('should remove field with undefined value', () => {
    const todo: TodoDto = {
      id: 1,
      title: 'Wake up',
      done: true,
      description: undefined
    }

    const out = pipe(todo, Decoder.validate(TodoDto), Result.get)

    expect(out).toEqual({
      id: 1,
      title: 'Wake up',
      done: true
    })
  })
})

describe('ObjectDecoder.omit', () => {
  const TodoPostDto = pipe(TodoDto, ObjectDecoder.omit(['id', 'done']))
  interface TodoPostDto extends Decoder.TypeOf<typeof TodoPostDto> {}

  it('should succeed without id', () => {
    const todo: TodoPostDto = {
      title: 'Wake up'
    }
    expect(pipe(todo, Decoder.validate(TodoPostDto), Result.isOk)).toBe(true)
  })

  it('should skip id and done properties', () => {
    const todo: TodoDto = {
      id: 1,
      done: false,
      title: 'Wake up'
    }
    expect(pipe(todo, Decoder.validate(TodoPostDto), Result.get)).toEqual({
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
    expect(pipe(todo, Decoder.validate(TodoPostDto), Result.isOk)).toBe(true)
  })

  it('should skip id and done properties', () => {
    const todo: TodoDto = {
      id: 1,
      done: false,
      title: 'Wake up'
    }
    expect(pipe(todo, Decoder.validate(TodoPostDto), Result.get)).toEqual({
      title: 'Wake up'
    })
  })
})

describe('ObjectDecoder.partial', () => {
  const TodoPutDto = pipe(TodoDto, ObjectDecoder.partial, ObjectDecoder.omit(['id']))
  interface TodoPutDto extends Decoder.TypeOf<typeof TodoPutDto> {}

  it('should succeed without any properties', () => {
    const todo: TodoPutDto = {}
    expect(pipe(todo, Decoder.validate(TodoPutDto), Result.get)).toEqual({})
  })

  it('should succeed with properties', () => {
    const todo: TodoDto = {
      id: 1,
      done: false,
      title: 'Wake up'
    }
    expect(pipe(todo, Decoder.validate(TodoPutDto), Result.get)).toEqual({
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
    const result = pipe(dto, Decoder.validate(SignupDto))
    expect(pipe(result, Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    const dto = {
      email: 'test@example.com',
      password: 'mypassword',
      passwordRepeat: 'mypassword12345'
    }
    const result = pipe(dto, Decoder.validate(SignupDto))
    expect(pipe(result, Result.isKo)).toBe(true)
  })
})

describe('ObjectDecoder.merge', () => {
  const A = ObjectDecoder.struct({
    a: TextDecoder.string,
    ab: TextDecoder.string
  })

  const B = ObjectDecoder.struct({
    ab: NumberDecoder.number,
    b: NumberDecoder.number
  })

  const C = ObjectDecoder.merge(A, B)

  interface C extends Decoder.TypeOf<typeof C> {}

  it('should succeed without id', () => {
    const valid: C = {
      a: 'Hello',
      ab: 13,
      b: 10
    }
    expect(pipe(valid, Decoder.validate(C), Result.isOk)).toBe(true)
  })

  it('should fail with invalid properties', () => {
    const invalid: C = {
      a: 'Hello',
      // @ts-expect-error Should be a number
      ab: 'World',
      b: 10
    }

    expect(pipe(invalid, Decoder.validate(C), Result.isKo)).toBe(true)
  })
})

describe('ObjectDecoder.additionalProperties', () => {
  const Response = pipe(
    ObjectDecoder.struct({
      status: TextDecoder.oneOf(['OK', 'KO']),
      message: TextDecoder.string
    }),
    ObjectDecoder.additionalProperties
  )

  it('should keep extra properties', () => {
    const valid = {
      status: 'OK',
      message: 'All is fine',
      data: {
        id: 'xxxx-xxxx-xxxx-xxxx'
      }
    }
    expect(pipe(valid, Decoder.validate(Response), Result.get)).toEqual(valid)
  })

  it('should fail with invalid properties', () => {
    const invalid = {
      status: 'Something',
      message: 'All is fine',
      data: {
        id: 'xxxx-xxxx-xxxx-xxxx'
      }
    }
    expect(pipe(invalid, Decoder.validate(Response), Result.isKo)).toBe(true)
  })
})

describe('ObjectDecoder.sum', () => {
  const Geom = ObjectDecoder.sum('type', {
    Circle: ObjectDecoder.struct({
      radius: NumberDecoder.number
    }),
    Rectangle: ObjectDecoder.struct({
      width: NumberDecoder.number,
      height: NumberDecoder.number
    })
  })

  type Geom = Decoder.TypeOf<typeof Geom>

  it('should succeed when valid', () => {
    const validCircle: Geom = {
      type: 'Circle',
      radius: 13.37
    }
    const validRect: Geom = {
      type: 'Rectangle',
      height: 12,
      width: 25
    }
    expect(pipe(validCircle, Decoder.validate(Geom), Result.get)).toEqual(validCircle)
    expect(pipe(validRect, Decoder.validate(Geom), Result.get)).toEqual(validRect)
  })

  it('should fail on invalid "type" property', () => {
    expect(
      pipe(
        {
          type: 'Something'
        },
        Decoder.validate(Geom),
        Result.isKo
      )
    ).toEqual(true)
  })

  it('should fail without "type" property', () => {
    expect(
      pipe(
        {
          radius: 13.37
        },
        Decoder.validate(Geom),
        Result.isKo
      )
    ).toEqual(true)
  })

  it('should fail on invalid object', () => {
    const circle: Geom = {
      type: 'Circle',
      // @ts-expect-error Should not exist on circle
      width: 13.37
    }
    expect(pipe(circle, Decoder.validate(Geom), Result.isKo)).toEqual(true)
  })
})
