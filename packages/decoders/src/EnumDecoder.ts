import { Enum } from '@apoyo/std'
import { Decoder } from './Decoder'

export type Literal = string | number | boolean | null

export type EnumDecoder<I, O> = Decoder<I, O> & {
  values: Set<unknown>
}

const create = <I, O>(values: Set<unknown>, decoder: Decoder<I, O>): EnumDecoder<I, O> => ({
  ...decoder,
  values
})

const inSet = <T>(set: Set<T>) => (value: unknown): value is T => set.has(value as any)

export const native = <E extends Enum<E>>(enumType: E): EnumDecoder<unknown, E[keyof E]> => {
  const values = Enum.values(enumType)
  const set = new Set(values)
  return create(
    set,
    Decoder.fromGuard(inSet(set), `input does not match any value in enumeration`, {
      values
    })
  )
}

export const from = native

export const literal = <A extends readonly [Literal, ...Literal[]]>(...values: [...A]): Decoder<unknown, A[number]> => {
  const set = new Set(values)
  return create(
    set,
    Decoder.fromGuard(inSet(set), `value is not equal to ${values.join(', or ')}`, {
      values
    })
  )
}

export function isIn<T>(arr: T[] | Set<T>): Decoder<unknown, T>
export function isIn(arr: any[] | Set<any>): any {
  const set = arr instanceof Set ? arr : new Set<any>(arr)
  return create(set, Decoder.fromGuard(inSet(set), `string is not included in the allowed list of values`))
}

export const EnumDecoder = {
  /**
   * @description
   * Checks if a value is included in the given enum
   *
   * @example
   * ```ts
   * enum Status {
   *   ACTIVE = "active",
   *   INACTIVE = "inactive",
   *   ARCHIVED = "archived"
   * }
   *
   * const decoder = EnumDecoder.native(Status)
   *
   * expect(pipe("active", Decoder.validate(decoder), Result.get)).toBe(Status.ACTIVE)
   * expect(pipe("xxx", Decoder.validate(decoder), Result.isKo)).toBe(true)
   * ```
   */
  native,

  /**
   * @deprecated Use `EnumDecoder.native` instead.
   *
   * @description
   * Checks if a value is included in the given enum
   *
   * @example
   * ```ts
   * enum Status {
   *   ACTIVE = "active",
   *   INACTIVE = "inactive",
   *   ARCHIVED = "archived"
   * }
   *
   * const decoder = EnumDecoder.native(Status)
   *
   * expect(pipe("active", Decoder.validate(decoder), Result.get)).toBe(Status.ACTIVE)
   * expect(pipe("xxx", Decoder.validate(decoder), Result.isKo)).toBe(true)
   * ```
   */
  from,

  /**
   * @description
   * Checks if a value is in the given list of constants
   *
   * @example
   * ```ts
   * const decoder = EnumDecoder.literal("active", "inactive", "archived")
   *
   * expect(pipe("active", Decoder.validate(decoder), Result.get)).toBe("active")
   * expect(pipe("xxx", Decoder.validate(decoder), Result.isKo)).toBe(true)
   * ```
   */
  literal,

  /**
   * @description
   * Checks if a value is in the given list
   *
   * @example
   * ```ts
   * const decoder = EnumDecoder.isIn(["active", "inactive", "archived"])
   *
   * expect(pipe("active", Decoder.validate(decoder), Result.get)).toBe("active")
   * expect(pipe("xxx", Decoder.validate(decoder), Result.isKo)).toBe(true)
   * ```
   */
  isIn
}
