import { DecodeError, Decoder, ObjectDecoder } from '@apoyo/decoders'
import { Provider } from '@apoyo/ioc'
import { Dict, Err, pipe, Result } from '@apoyo/std'

import { $env } from './env'

export type Schema<A extends Dict<unknown>> = {
  [P in keyof A]-?: Decoder<unknown, A[P]>
}

export const validate = <T extends Dict>(env: Dict<unknown>, schema: Schema<T>) => {
  const decoder = ObjectDecoder.struct(schema)

  return pipe(
    env,
    Decoder.validate(decoder),
    Result.mapError((err) =>
      Err.of(`Environment variables could not be validated`, {
        errors: DecodeError.format(err)
      })
    ),
    Result.get
  )
}

export const define = <T extends Dict>(schema: Schema<T>) => {
  return Provider.fromFactory((env) => validate(env, schema), [$env])
}
