import { Enum } from '@apoyo/std'
import { Decoder } from './Decoder'

export type EnumDecoder<I> = Decoder<I, string | number>

const from = <E extends Enum<E>>(enumType: E) => {
  const values = Enum.values(enumType)
  return Decoder.fromGuard(
    (input: unknown): input is E[keyof E] => !!values.find((v) => v === input),
    `input does not match any value in enumeration`,
    {
      values
    }
  )
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
  from
}
