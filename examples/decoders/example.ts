import { pipe, Result } from '@apoyo/std'
import {
  ArrayDecoder,
  BooleanDecoder,
  DateDecoder,
  DecodeError,
  Decoder,
  EnumDecoder,
  ObjectDecoder,
  TextDecoder
} from '@apoyo/decoders'

enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

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

  const UserDto = ObjectDecoder.struct({
    id: TextDecoder.string,
    email: TextDecoder.email,
    status: EnumDecoder.native(UserStatus),
    birthdate: pipe(DateDecoder.date, Decoder.parse(validateAge))
  })

  const TagDto = pipe(TextDecoder.string, TextDecoder.between(1, 32))

  const TodoDto = ObjectDecoder.struct({
    id: TextDecoder.string,
    title: TextDecoder.varchar(1, 100),
    done: pipe(BooleanDecoder.boolean),
    tags: pipe(
      ArrayDecoder.array(TagDto),
      ArrayDecoder.between(0, 5),
      Decoder.optional,
      Decoder.map((input) => (input === undefined ? [] : input))
    ),
    description: pipe(
      TextDecoder.varchar(0, 2000),
      Decoder.nullable,
      Decoder.optional,
      Decoder.map((input) => (input === '' || input === undefined ? null : input))
    ),
    createdAt: DateDecoder.datetime,
    updatedAt: DateDecoder.datetime
  })

  const TodoPostDto = pipe(TodoDto, ObjectDecoder.omit(['id', 'createdAt', 'updatedAt']))
  const TodoPutDto = pipe(TodoDto, ObjectDecoder.partial, ObjectDecoder.omit(['id', 'createdAt', 'updatedAt']))

  interface TodoDto extends Decoder.TypeOf<typeof TodoDto> {}
  interface TodoPostDto extends Decoder.TypeOf<typeof TodoPostDto> {}
  interface TodoPutDto extends Decoder.TypeOf<typeof TodoPutDto> {}

  return {
    UserDto,
    TodoDto,
    TodoPostDto,
    TodoPutDto
  }
}
