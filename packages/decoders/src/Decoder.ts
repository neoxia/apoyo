import { Dict, InverseRefinement, NonEmptyArray, Option, pipe, Predicate, Refinement, Result } from '@apoyo/std'

import { DecodeError } from './DecodeError'

export type DecoderResult<A> = Result<A, DecodeError>

export type Decoder<I, O> = {
  decode(input: I): DecoderResult<O>
}

export namespace Decoder {
  export type TypeOf<A> = A extends Decoder<unknown, infer B> ? Option.Struct<B> : never
  export type InputOf<A> = A extends Decoder<infer B, unknown> ? Option.Struct<B> : never
}

export const create = <I, O>(fn: (input: I) => DecoderResult<O>): Decoder<I, O> => ({
  decode: fn
})

export const fromGuard = <I, O extends I>(fn: Refinement<I, O>, message: string, meta?: Dict<unknown>): Decoder<I, O> =>
  create((input) => (fn(input) ? Result.ok(input) : Result.ko(DecodeError.value(input, message, meta))))

export const parse = <B, C>(fn: (input: B) => DecoderResult<C>) => <A>(decoder: Decoder<A, B>): Decoder<A, C> =>
  create((input) => pipe(input, validate(decoder), Result.chain(fn)))

export const chain = <B, C>(fn: (input: B) => Decoder<B, C>) => <A>(decoder: Decoder<A, B>): Decoder<A, C> =>
  pipe(
    decoder,
    parse((value) => pipe(value, validate(fn(value))))
  )

export const map = <A, B>(fn: (input: A) => B) => <I>(decoder: Decoder<I, A>): Decoder<I, B> =>
  create((input) => pipe(input, validate(decoder), Result.map(fn)))

export const withMessage = (msg: string, meta?: Dict<unknown>) => <I, A>(decoder: Decoder<I, A>): Decoder<I, A> =>
  create((input) =>
    pipe(
      input,
      validate(decoder),
      Result.mapError(() => DecodeError.value(input, msg, meta))
    )
  )

export const nullable = <I, O>(decoder: Decoder<I, O>): Decoder<I, O | null> =>
  create((input: I) => (input === null ? Result.ok(null) : pipe(input, validate(decoder))))

export const optional = <I, O>(decoder: Decoder<I, O>): Decoder<I, O | undefined> =>
  create((input: I) => (input === undefined ? Result.ok(undefined) : pipe(input, validate(decoder))))

export const guard = <O>(fn: (input: O) => Option<DecodeError>) =>
  parse((input: O) => {
    const error = fn(input)
    return error !== undefined ? Result.ko(error) : Result.ok(input)
  })

export function filter<A, B extends A>(
  fn: Refinement<A, B>,
  message: string,
  meta?: Dict<unknown>
): <I>(value: Decoder<I, A>) => Decoder<I, B>
export function filter<A>(
  fn: Predicate<A>,
  message: string,
  meta?: Dict<unknown>
): <I>(value: Decoder<I, A>) => Decoder<I, A>
export function filter(fn: any, message: string, meta: Dict<unknown> = {}) {
  return parse((input) => (fn(input) ? Result.ok(input) : Result.ko(DecodeError.value(input, message, meta))))
}

export function reject<A, B extends A>(
  fn: Refinement<A, B>,
  message: string,
  meta?: Dict<unknown>
): <I>(value: Decoder<I, A>) => Decoder<I, InverseRefinement<A, B>>
export function reject<A>(
  fn: Predicate<A>,
  message: string,
  meta?: Dict<unknown>
): <I>(value: Decoder<I, A>) => Decoder<I, A>
export function reject(fn: any, message: string, meta: Dict<unknown> = {}) {
  return parse((input) => (!fn(input) ? Result.ok(input) : Result.ko(DecodeError.value(input, message, meta))))
}

export const ref = <A>(decoder: Decoder<unknown, A>) => decoder

export function validate<O>(decoder: Decoder<unknown, O>): (input: unknown) => DecoderResult<O>
export function validate<I, O>(decoder: Decoder<I, O>): (input: I) => DecoderResult<O>
export function validate<I, O>(decoder: Decoder<I, O>) {
  return (input: I) => decoder.decode(input)
}

export const lazy = <I, O>(fn: () => Decoder<I, O>): Decoder<I, O> => create((input) => pipe(input, validate(fn())))

export function union<I, O1, O2>(a: Decoder<I, O1>, b: Decoder<I, O2>): Decoder<I, O1 | O2>
export function union<I, O1, O2, O3>(a: Decoder<I, O1>, b: Decoder<I, O2>, c: Decoder<I, O3>): Decoder<I, O1 | O2 | O3>
export function union<I, O1, O2, O3, O4>(
  a: Decoder<I, O1>,
  b: Decoder<I, O2>,
  c: Decoder<I, O3>,
  d: Decoder<I, O4>
): Decoder<I, O1 | O2 | O3 | O4>
export function union(...members: NonEmptyArray<Decoder<unknown, unknown>>): Decoder<unknown, unknown> {
  return create((input) =>
    pipe(
      members,
      Result.unionBy((member, index) =>
        pipe(
          input,
          Decoder.validate(member),
          Result.mapError((err) => DecodeError.member(index, err))
        )
      ),
      Result.mapError(DecodeError.union)
    )
  )
}

export const unknown: Decoder<unknown, unknown> = create(Result.ok)

/**
 * @namespace Decoder
 *
 * @description
 *
 * A `Decoder` is a function, that from an input I to create an output O, or produce an DecodeError.
 * As such, a common use-case for `Decoder`s are type and value validations.
 *
 * This namespace contains the core utilities to:
 * - Create `Decoder`s
 * - Use or combine them
 * - Extract / infer the resulting type informations
 *
 * @example
 * ```ts
 * export const TodoDto = ObjectDecoder.struct({
 *   id: IntegerDecoder.int,
 *   title: TextDecoder.range(1, 100),
 *   description: pipe(TextDecoder.range(0, 2000), TextDecoder.nullable),
 *   done: BooleanDecoder.boolean
 * })
 *
 * export interface TodoDto extends Decoder.TypeOf<typeof TodoDto> {}
 * ```
 */
export const Decoder = {
  /**
   * @description
   * Create a new decoder
   */
  create,

  /**
   * @description
   * Creates a new decoder from a type guard
   *
   * @example
   * ```ts
   * const stringDecoder = Decoder.fromGuard(
   *   (input: unknown): input is string => typeof input === 'string',
   *   'value is not a string'
   * )
   *
   * expect(pipe('Hello', Decoder.validate(decoder), Result.isOk)).toBe(true)
   * expect(pipe(42, Decoder.validate(decoder), Result.isKo)).toBe(true)
   * ```
   */
  fromGuard,

  /**
   * @description
   * Map over the resulting value of an `Decoder`
   *
   * @example
   * ```ts
   * const decoder = pipe(
   *   TextDecoder.string,
   *   Decoder.map(str => str.trim())
   * )
   *
   * expect(pipe('  Hello  ', Decoder.validate(decoder), Result.get)).toBe('Hello')
   * ```
   */
  map,

  /**
   * @description
   * Catch the validation error and create a new error with the given message.
   *
   * @example
   * ```ts
   * const decoder = pipe(
   *   Decoder.union(
   *     NumberDecoder.number,
   *     NumberDecoder.fromString
   *   ),
   *   Decoder.withMessage('The given value is not a number', {
   *     code: 'invalid_number'
   *   })
   * )
   *
   * const expectedError = DecodeError.value('  Hello  ', 'This value is not a number', {
   *   code: 'invalid_number'
   * })
   * expect(pipe('  Hello  ', Decoder.validate(decoder))).toEqual(Result.ko(expectedError))
   * ```
   */
  withMessage,

  /**
   * @description
   * Add a custom validation function to an `Decoder`.
   *
   * Compared to `Decoder.guard`, this function gives more control and allows the user to modify the resulting value.
   *
   * @see `Decoder.guard`
   * @see `Decoder.filter`
   * @see `Decoder.reject`
   *
   * @example
   * ```ts
   * const validateAge = (dob: string): Result<string, DecodeError> => {
   *   const now = new Date()
   *   const date = new Date(dob)
   *
   *   if (date.getFullYear() < now.getFullYear() - 100) {
   *     return Result.ko(DecodeError.value(dob, 'Date of birth is more than 100 years ago'))
   *   }
   *   if (date.getFullYear() > now.getFullYear() - 18) {
   *     return Result.ko(DecodeError.value(dob, 'Date of birth is less than 18 years ago'))
   *   }
   *   return Result.ok(dob)
   * }
   *
   * const birthdayDecoder = pipe(
   *   DateDecoder.date,
   *   Decoder.parse(validateAge)
   * )
   *
   * expect(pipe('1930-01-01', Decoder.validate(birthdayDecoder), Result.isOk)).toBe(true)
   * expect(pipe('1920-01-01', Decoder.validate(birthdayDecoder), Result.isKo)).toBe(true)
   * ```
   */
  parse,

  /**
   * @description
   * Chain another decoder to execute with the current input.
   * This allows you to dynamically compute the decoder to use depending on a value.
   */
  chain,

  /**
   * @description
   * Add a custom validation function, returning either:
   * - A `DecodeError` if the input is incorrect
   * - `undefined` if there is no error to report.
   *
   * This function gives more control about the returned error than `Decoder.filter` or `Decoder.reject`, but does not allow the value to be modified.
   *
   * @see `Decoder.parse`
   * @see `Decoder.filter`
   * @see `Decoder.reject`
   *
   * @example
   * ```ts
   * const validateAge = (dob: string): Option<DecodeError> => {
   *   const now = new Date()
   *   const date = new Date(dob)
   *
   *   if (date.getFullYear() < now.getFullYear() - 100) {
   *     return DecodeError.value(dob, 'Date of birth is more than 100 years ago')
   *   }
   *   if (date.getFullYear() > now.getFullYear() - 18) {
   *     return DecodeError.value(dob, 'Date of birth is less than 18 years ago')
   *   }
   *   return undefined
   * }
   *
   * const birthdayDecoder = pipe(
   *   DateDecoder.date,
   *   Decoder.guard(validateAge)
   * )
   *
   * expect(pipe('1930-01-01', Decoder.validate(birthdayDecoder), Result.isOk)).toBe(true)
   * expect(pipe('1920-01-01', Decoder.validate(birthdayDecoder), Result.isKo)).toBe(true)
   * ```
   */
  guard,

  /**
   * @description
   * Add a `Predicate` filter function to a `Decoder`.
   * If the value matches the `Predicate`, the value is kept.
   * Else, an DecodeError with the given message is returned.
   *
   * @see `Decoder.parse`
   * @see `Decoder.guard`
   * @see `Decoder.reject`
   *
   * @example
   * ```ts
   * const maxAge = (age: number) => (dob: string) => {
   *   const now = new Date()
   *   const date = new Date(dob)
   *   return date.getFullYear() > now.getFullYear() - age
   * }
   * const minAge = (age: number) => (dob: string) => {
   *   const now = new Date()
   *   const date = new Date(dob)
   *   return date.getFullYear() < now.getFullYear() - age
   * }
   *
   * const birthdayDecoder = pipe(
   *   DateDecoder.date,
   *   Decoder.filter(maxAge(100), `Date of birth is more than 100 years ago`),
   *   Decoder.filter(minAge(18), `Date of birth is less than 18 years ago`)
   * )
   *
   * expect(pipe('1930-01-01', Decoder.validate(birthdayDecoder), Result.isOk)).toBe(true)
   * expect(pipe('1920-01-01', Decoder.validate(birthdayDecoder), Result.isKo)).toBe(true)
   * ```
   */
  filter,

  /**
   * @description
   * Add a `Predicate` filter function to a `Decoder`.
   * If the value matches the `Predicate`, an DecodeError with the given message is returned.
   * Else, the value is kept.
   *
   * @see `Decoder.parse`
   * @see `Decoder.guard`
   * @see `Decoder.filter`
   *
   * @example
   * ```ts
   * const decoder = pipe(
   *   TextDecoder.string,
   *   Decoder.reject(str => str.length === 0, `string should not be empty`)
   * )
   *
   * expect(pipe('Hello', Decoder.validate(decoder), Result.isOk)).toBe(true)
   * expect(pipe('', Decoder.validate(decoder), Result.isKo)).toBe(true)
   * ```
   */
  reject,

  /**
   * @description
   * Makes the value nullable.
   *
   * **Note**: If you want to transform an empty string to `null`, use `TextDecoder.nullable` instead.
   *
   * @see `Decoder.optional`
   * @see `TextDecoder.nullable`
   *
   * @example
   * ```ts
   * const decoder = pipe(
   *   TextDecoder.string,
   *   Decoder.nullable
   * )
   *
   * expect(pipe('Hello', Decoder.validate(decoder), Result.isOk)).toBe(true)
   * expect(pipe('', Decoder.validate(decoder), Result.isOk)).toBe(true)
   * expect(pipe('', Decoder.validate(decoder), Result.get)).toBe('')
   * expect(pipe(null, Decoder.validate(decoder), Result.get)).toBe(null)
   * ```
   */
  nullable,

  /**
   * @description
   * Makes the value optional (allows `undefined`).
   *
   * **Note**: If you want to transform an empty string to `undefined`, use `TextDecoder.optional` instead.
   *
   * @see `Decoder.nullable`
   * @see `TextDecoder.optional`
   *
   * @example
   * ```ts
   * const decoder = pipe(
   *   TextDecoder.string,
   *   Decoder.optional
   * )
   *
   * expect(pipe('Hello', Decoder.validate(decoder), Result.isOk)).toBe(true)
   * expect(pipe('', Decoder.validate(decoder), Result.isOk)).toBe(true)
   * expect(pipe('', Decoder.validate(decoder), Result.get)).toBe('')
   * expect(pipe(undefined, Decoder.validate(decoder), Result.get)).toBe(undefined)
   * ```
   */
  optional,

  /**
   * @description
   * This function allows the creation of recursive type decoders.
   *
   * @example
   * ```ts
   * interface Tree<T> {
   *   value: T
   *   forest: Tree<T>[]
   * }
   *
   * // Recursive types require manual typing
   * const TreeDecoder = <O>(decoder: Decoder<unknown, O>): Decoder<unknown, Tree<O>> =>
   *   Decoder.lazy(() =>
   *     ObjectDecoder.struct({
   *       value: decoder,
   *       forest: ArrayDecoder.array(TreeDecoder(decoder))
   *     })
   *   )
   *
   * const input: unknown = {
   *   value: 'Hello',
   *   forest: [
   *     {
   *        value: 'World',
   *        forest: []
   *     }
   *   ]
   * }
   *
   * expect(pipe(input, TreeDecoder(TextDecoder.string), Result.isOk)).toBe(true)
   * ```
   */
  lazy,

  /**
   * @description
   * Creates a union `Decoder` that tries, in the given order, if the input is valid.
   *
   * @example
   * ```ts
   * const decoder = Decoder.union(
   *   NumberDecoder.number,
   *   NumberDecoder.fromString
   * )
   *
   * expect(pipe(42, Decoder.validate(decoder), Result.isOk)).toBe(true)
   * expect(pipe("42", Decoder.validate(decoder), Result.isOk)).toBe(true)
   * expect(pipe("Hello", Decoder.validate(decoder), Result.isKo)).toBe(true)
   * ```
   */
  union,

  /**
   * @description
   * Utility to bind a given generated type to a `Decoder`
   */
  ref,

  /**
   * @description
   * Validate an input by the given `Decoder`
   *
   * @example
   * ```
   * const result = pipe(
   *   input,
   *   Decoder.validate(TextDecoder.string)
   * )
   *
   * if (Result.isKo(result)) {
   *   console.log(result.ko)
   *   return
   * }
   *
   * const value = result.ok
   * console.log(value)
   * ```
   */
  validate,

  /**
   * @description
   * `Decoder` for an unknown value
   */
  unknown
}
