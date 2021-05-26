export type Enum<E> = Record<keyof E, number | string> & { [k: number]: string }

export const keys = <E extends Enum<E>>(enumType: E) =>
  Object.keys(enumType).filter((key) => isNaN(Number(key))) as Array<keyof E>

export function values<E extends Enum<E>>(enumType: E) {
  return keys(enumType).map((key) => enumType[key]) as Array<E[keyof E]>
}
export const toPairs = <E extends Enum<E>>(enumType: E) =>
  keys(enumType).map((key) => [key, enumType[key]]) as Array<[keyof E, E[keyof E]]>

export const isEnum = <E extends Enum<E>>(enumType: E) => {
  const set = new Set(values(enumType))
  return (input: unknown): input is E[keyof E] => set.has(input as any)
}

/**
 * @namespace Enum
 *
 * @description
 * This namespace contains utilities for Typescript enums.
 */
export const Enum = {
  /**
   * @description
   * Get all keys for the given enum.
   *
   * @example
   * ```ts
   * enum Color {
   *   RED = "red",
   *   BLUE = "blue",
   *   GREEN = "green"
   * }
   * const keys = Enum.keys(Color)
   *
   * expect(keys).toEqual(["RED", "BLUE", "GREEN"])
   * ```
   */
  keys,

  /**
   * @description
   * Get all values for the given enum.
   *
   * @example
   * ```ts
   * enum Color {
   *   RED = "red",
   *   BLUE = "blue",
   *   GREEN = "green"
   * }
   * const values = Enum.values(Color)
   *
   * expect(values).toEqual(["red", "blue", "green"])
   * ```
   */
  values,

  /**
   * @description
   * Get all key/value pairs for the given enum.
   *
   * @example
   * ```ts
   * enum Color {
   *   RED = "red",
   *   BLUE = "blue",
   *   GREEN = "green"
   * }
   * const pairs = Enum.toPairs(Color)
   *
   * expect(pairs).toEqual([
   *   ["RED", "red"],
   *   ["BLUE", "blue"],
   *   ["GREEN", "green"]
   * ])
   * ```
   */
  toPairs,

  /**
   * @description
   * Check if a value exists in the enumeration.
   * This function acts as a type guard for an enumeration.
   *
   * @example
   * ```
   * enum Color {
   *   RED = "red",
   *   BLUE = "blue",
   *   GREEN = "green"
   * }
   *
   * const isColor = Enum.isEnum(Color)
   *
   * expect(isColor("red")).toBe(true)
   * expect(isColor("unknown")).toBe(false)
   * ```
   */
  isEnum
}
