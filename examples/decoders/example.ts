import { pipe, Result } from '@apoyo/std'
import {
  BooleanDecoder,
  DateDecoder,
  DecodeError,
  Decoder,
  IntegerDecoder,
  ObjectDecoder,
  TextDecoder
} from '@apoyo/decoders'

export const main = async () => {
  const validateAge = (dob: string) => {
    const now = new Date()
    const date = new Date(dob)

    if (date.getFullYear() < now.getFullYear() - 100) {
      return Result.ko(DecodeError.value(dob, 'Date of birth is more than 100 years ago'))
    }
    if (date.getFullYear() > now.getFullYear() - 18) {
      return Result.ko(DecodeError.value(dob, 'Date of birth is less than 18 years ago'))
    }
    return Result.ok(dob)
  }

  const TodoDto = ObjectDecoder.struct({
    id: TextDecoder.string,
    email: TextDecoder.email,
    name: pipe(TextDecoder.varchar(1, 100), Decoder.nullable),
    dob: pipe(DateDecoder.date, Decoder.parse(validateAge), Decoder.nullable),
    age: IntegerDecoder.range(0, 120),
    title: TextDecoder.varchar(1, 100),
    done: pipe(BooleanDecoder.boolean),
    description: pipe(TextDecoder.varchar(0, 2000), TextDecoder.nullable),
    createdAt: DateDecoder.datetime,
    updatedAt: DateDecoder.datetime
  })

  const TodoPostDto = pipe(TodoDto, ObjectDecoder.omit(['id', 'createdAt', 'updatedAt']))
  const TodoPutDto = pipe(TodoDto, ObjectDecoder.partial, ObjectDecoder.omit(['id', 'createdAt', 'updatedAt']))

  interface TodoDto extends Decoder.TypeOf<typeof TodoDto> {}
  interface TodoPostDto extends Decoder.TypeOf<typeof TodoPostDto> {}
  interface TodoPutDto extends Decoder.TypeOf<typeof TodoPutDto> {}

  return {
    TodoDto,
    TodoPostDto,
    TodoPutDto
  }
}
