import { BooleanDecoder, Decoder, IntegerDecoder, ObjectDecoder, TextDecoder } from '@apoyo/decoders'
import { pipe } from '@apoyo/std'

export const createTodoSchema = ObjectDecoder.struct({
  title: TextDecoder.varchar(1, 200),
  done: BooleanDecoder.boolean
})

export const updateTodoSchema = pipe(createTodoSchema, ObjectDecoder.partial)

export const paginateTodoSchema = ObjectDecoder.struct({
  page: pipe(IntegerDecoder.range(1, 200), Decoder.default(1)),
  perPage: pipe(IntegerDecoder.range(1, 100), Decoder.default(10))
})
