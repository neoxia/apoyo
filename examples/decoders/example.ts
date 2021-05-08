import { pipe } from '@apoyo/std'
import { DecodeError } from '@apoyo/decoders'

export const main = async () => {
  type ObjectDecode = any
  const ObjectDecode: any = {}

  type NumberDecode = any
  const NumberDecode: any = {}

  type IntegerDecode = any
  const IntegerDecode: any = {}

  type TextDecode = any
  const TextDecode: any = {}

  type BooleanDecode = any
  const BooleanDecode: any = {}

  const validateAge = (dob: string) => {
    const now = new Date()
    const date = new Date(dob)

    if (date.getFullYear() < now.getFullYear() - 100) {
      return DecodeError.value(dob, 'Date of birth is more than 100 years ago')
    }
    if (date.getFullYear() < now.getFullYear() - 18) {
      return DecodeError.value(dob, 'Date of birth is more than 18 years ago')
    }
    return undefined
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const TodoDto = ObjectDecode.struct({
    id: TextDecode.any,
    email: TextDecode.email,
    name: pipe(TextDecode.varchar(1, 100), Decode.nullable),
    dob: pipe(TextDecode.date, TextDecode.guard(validateAge), Decode.nullable),
    age: IntegerDecode.min(0),
    title: TextDecode.varchar(1, 100),
    done: pipe(BooleanDecode.true, BooleanDecode.default(false)),
    description: pipe(TextDecode.varchar(0, 2000), TextDecode.nullable),
    createdAt: TextDecode.datetime,
    updatedAt: TextDecode.datetime
  })

  interface TodoDto extends Decode.TypeOf<typeof TodoDto> {}

  // type TodoDto = {
  //   id: number,
  //   email: email,
  //   name: string|null
  //   dob: date|null
  // }

  const TodoPostDto = pipe(TodoDto, ObjectDecode.omit(['id', 'createdAt', 'updatedAt']))
  const TodoPutDto = pipe(TodoDto, ObjectDecode.partial, ObjectDecode.omit(['id', 'createdAt', 'updatedAt']))
}
