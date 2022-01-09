import { Dict, Obj, Option, pipe, Result } from '@apoyo/std'
import { NonEmptyArray } from '@apoyo/std'
import { DecodeError } from './DecodeError'
import { Decoder } from './Decoder'
import { ErrorCode } from './Errors'
import { TextDecoder } from './TextDecoder'

export type ObjectDecoder<I, O extends Dict> = Decoder<I, O> & {
  props: Dict
}

type Struct<A extends Dict<unknown>> = {
  [P in keyof A]: Decoder<unknown, A[P]>
}

const create = <I, O extends Dict>(props: Dict, decoder: Decoder<I, O>): ObjectDecoder<I, O> => ({
  props,
  ...decoder
})

export const unknownDict: Decoder<unknown, Dict<unknown>> = Decoder.fromGuard(
  (input: unknown): input is Dict<unknown> => typeof input === 'object' && input !== null && !Array.isArray(input),
  `value is not an object`,
  {
    code: ErrorCode.DICT
  }
)

export const dict = <A>(decoder: Decoder<unknown, A>): Decoder<unknown, Dict<A>> => {
  return pipe(
    unknownDict,
    Decoder.parse((input) =>
      pipe(
        input,
        Result.structBy((value, key) =>
          pipe(
            value,
            Decoder.validate(decoder),
            Result.mapError((err) => DecodeError.key(key, err))
          )
        ),
        Result.mapError((errors) => DecodeError.object(errors))
      )
    )
  )
}

export const struct = <A extends Dict>(props: Struct<A>, name?: string): ObjectDecoder<unknown, A> => {
  return create(
    props,
    pipe(
      unknownDict,
      Decoder.parse(
        (input) =>
          pipe(
            props as Dict<Decoder<unknown, unknown>>,
            Result.structBy((prop, key) =>
              pipe(
                input[key],
                Decoder.validate(prop),
                Result.mapError((err) => DecodeError.key(key, err))
              )
            ),
            Result.map(Dict.compact),
            Result.mapError((errors) => DecodeError.object(errors, name))
          ) as Result<A, DecodeError>
      )
    )
  )
}

export const guard = <I, O extends Dict>(fn: (input: O) => Option<DecodeError.Value | DecodeError.ObjectLike>) => (
  decoder: ObjectDecoder<I, O>
) => create(decoder.props, pipe(decoder, Decoder.guard(fn)))

export function omit<I, O extends Dict, B extends keyof O>(
  props: B[]
): (decoder: ObjectDecoder<I, O>) => ObjectDecoder<I, Omit<O, B>>
export function omit(props: string[]) {
  return (decoder: ObjectDecoder<any, any>) => pipe(decoder.props, Obj.omit(props), struct)
}

export function pick<I, O extends Dict, B extends keyof O>(
  props: B[]
): (decoder: ObjectDecoder<I, O>) => ObjectDecoder<I, Pick<O, B>>
export function pick(props: string[]) {
  return (decoder: ObjectDecoder<any, any>) => pipe(decoder.props, Obj.pick(props), struct)
}

export function partial<I, O extends Dict>(decoder: ObjectDecoder<I, O>): ObjectDecoder<I, Partial<O>>
export function partial(decoder: ObjectDecoder<any, any>) {
  return pipe(decoder.props, Dict.map(Decoder.optional), struct)
}

export function merge<I, O1 extends Dict>(a: ObjectDecoder<I, O1>): ObjectDecoder<I, O1>
export function merge<I, O1 extends Dict, O2 extends Dict>(
  a: ObjectDecoder<I, O1>,
  b: ObjectDecoder<I, O2>
): ObjectDecoder<I, O2 & Omit<O1, keyof O2>>
export function merge<I, O1 extends Dict, O2 extends Dict, O3 extends Dict>(
  a: ObjectDecoder<I, O1>,
  b: ObjectDecoder<I, O2>,
  c: ObjectDecoder<I, O3>
): ObjectDecoder<I, O3 & Omit<O2, keyof O3> & Omit<O1, keyof O3 | keyof O2>>
export function merge<I, O1 extends Dict, O2 extends Dict, O3 extends Dict, O4 extends Dict>(
  a: ObjectDecoder<I, O1>,
  b: ObjectDecoder<I, O2>,
  c: ObjectDecoder<I, O3>,
  d: ObjectDecoder<I, O4>
): ObjectDecoder<I, O4 & Omit<O3, keyof O4> & Omit<O2, keyof O4 | keyof O3> & Omit<O1, keyof O4 | keyof O3 | keyof O2>>
export function merge<I, O extends Dict>(...members: NonEmptyArray<ObjectDecoder<I, O>>) {
  return struct(Object.assign({}, ...members.map((m) => m.props)))
}

type SumTypes<K extends string, T extends Dict> = {
  [P in keyof T]: T[P] extends ObjectDecoder<any, infer A> ? { [KP in K]: P } & A : never
}[keyof T]

export function sum<K extends string, I, T extends Dict<ObjectDecoder<I, any>>>(
  prop: K,
  cases: T
): Decoder<I, SumTypes<K, T>>
export function sum(prop: string, cases: Dict<ObjectDecoder<any, any>>) {
  const keys = Dict.keys(cases)
  const typeDecoder = TextDecoder.oneOf(keys)
  return pipe(
    unknownDict,
    Decoder.parse((input) =>
      pipe(
        input[prop],
        Decoder.validate(typeDecoder),
        Result.chain((type) =>
          pipe(
            input,
            Decoder.validate(cases[type]),
            Result.map((parsed) => ({
              [prop]: type,
              ...parsed
            }))
          )
        )
      )
    )
  )
}

export const additionalProperties = <I, O extends Dict>(decoder: ObjectDecoder<I, O>): Decoder<I, O & Dict> =>
  pipe(
    unknownDict,
    Decoder.parse((input) =>
      pipe(
        input as I,
        Decoder.validate(decoder),
        Result.map((parsed: O) => ({
          ...input,
          ...parsed
        }))
      )
    )
  )

/**
 * @namespace ObjectDecoder
 *
 * @description
 * This namespace contains object decoders and additional utilities for object validations.
 */
export const ObjectDecoder = {
  /**
   * @description
   * Check if the input is an object / record.
   * This function does not check the type of the properties.
   */
  unknownDict,

  /**
   * @description
   * Check if the input is an record, where all properties are of the given type.
   */
  dict,

  /**
   * @description
   * Check if the input is an object, where all object properties match the given decoders.
   * All extraenous properties will be skipped and ignored.
   *
   * @example
   * ```ts
   * const TodoDto = ObjectDecoder.struct({
   *   id: IntegerDecoder.positive,
   *   title: TextDecoder.varchar(1, 100),
   *   done: BooleanDecoder.boolean
   * })
   *
   * const input: unknown = {
   *   id: 0,
   *   title: 'Wake up',
   *   description: 'Some description', // This property is not recognized by the decoder and will be ignored.
   *   done: false
   * }
   *
   * expect(pipe(input, Decoder.validate(TodoDto), Result.isOk)).toBe(true)
   * expect(pipe(input, Decoder.validate(TodoDto), Result.get)).toEqual({
   *   id: 0,
   *   title: 'Wake up',
   *   done: false
   * })
   * ```
   */
  struct,

  /**
   * @description
   * Omit given properties from an `ObjectDecoder`.
   * The resulting `ObjectDecoder` will not contain the omitted properties.
   *
   * @example
   * ```ts
   * const TodoPostDto = pipe(TodoDto, ObjectDecoder.omit(['id']))
   *
   * const input: unknown = {
   *   id: 0, // This property has been omitted and will be ignored.
   *   title: 'Wake up',
   *   done: false
   * }
   *
   * expect(pipe(input, Decoder.validate(TodoPostDto), Result.isOk)).toBe(true)
   * expect(pipe(input, Decoder.validate(TodoPostDto), Result.get)).toEqual({
   *   title: 'Wake up',
   *   done: false
   * })
   * ```
   */
  omit,

  /**
   * @description
   * Pick given properties from an `ObjectDecoder`.
   * The resulting `ObjectDecoder` will only contain the picked properties.
   *
   * @example
   * ```ts
   * const TodoPostDto = pipe(TodoDto, ObjectDecoder.pick(['title', 'done']))
   *
   * const input: unknown = {
   *   id: 0, // This property has not been picked and will be ignored.
   *   title: 'Wake up',
   *   done: false
   * }
   *
   * expect(pipe(input, Decoder.validate(TodoPostDto), Result.isOk)).toBe(true)
   * expect(pipe(input, Decoder.validate(TodoPostDto), Result.get)).toEqual({
   *   title: 'Wake up',
   *   done: false
   * })
   * ```
   */
  pick,

  /**
   * @description
   * Make all properties of an `ObjectDecoder` optional.
   */
  partial,

  /**
   * @description
   * Add a custom validation function to the `ObjectDecoder`.
   *
   * @example
   * ```ts
   * const SignupDto = pipe(
   *   ObjectDecoder.struct({
   *     email: TextDecoder.email,
   *     password: TextDecoder.varchar(5, 50),
   *     passwordRepeat: TextDecoder.varchar(5, 50)
   *   }),
   *   ObjectDecoder.guard(user => {
   *     return user.password === user.passwordRepeat
   *       ? undefined
   *       : DecodeError.object([
   *         DecodeError.key('passwordRepeat', DecodeError.value(user.passwordRepeat, `Password does not match password confirmation`))
   *       ])
   *   })
   * )
   *
   * const input: unknown = {
   *   email: 'test@example.com',
   *   password: '12345',
   *   passwordRepeat: '12345'
   * }
   *
   * expect(pipe(input, Decoder.validate(SignupDto), Result.isKo)).toBe(true)
   * ```
   */
  guard,

  /**
   * @description
   * Merge multiple `ObjectDecoder`s.
   * If a property has already been declared, the decoder for this property will be overwritten.
   *
   * @example
   * ```ts
   * const A = ObjectDecoder.struct({
   *   a: TextDecoder.string,
   *   ab: TextDecoder.string
   * })
   * const B = ObjectDecoder.struct({
   *   ab: NumberDecoder.number,
   *   b: NumberDecoder.number
   * })
   * const C = ObjectDecoder.merge(A, B)
   *
   * interface C extends Decoder.TypeOf<typeof C> {}
   *
   * // Interface C is now equals to:
   * type C = {
   *   a: string
   *   ab: number
   *   b: number
   * }
   *
   * // Note that "ab: TextDecoder.string" has been overwritten and will not be executed
   * ```
   */
  merge,

  /**
   * @description
   * By default, `ObjectDecoder.struct` will skip and ignore extra properties.
   * If you wish to keep extra properties (all properties not validated by the struct), you can use this util.
   *
   * @example
   * ```ts
   * const Response = pipe(
   *   ObjectDecoder.struct({
   *     status: EnumDecoder.literal('OK', 'KO'),
   *     message: TextDecoder.string,
   *   }),
   *   ObjectDecoder.additionalProperties
   * )
   * ```
   */
  additionalProperties,

  /**
   * @description
   * Execute a specific decoder depending on the value of a given "type" property.
   *
   * @example
   * ```ts
   * const Geom = ObjectDecoder.sum('type', {
   *   Circle: struct({
   *     radius: NumberDecoder.number
   *   }),
   *   Rectangle: struct({
   *     width: NumberDecoder.number,
   *     height: NumberDecoder.number
   *   })
   * })
   *
   * type Geom = Decoder.TypeOf<typeof Geom>
   * const geom: Geom = {
   *   type: 'Rectangle',
   *   height: 5
   * }
   * ```
   */
  sum
}
