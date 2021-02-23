export type Enum<E> = Record<keyof E, number | string> & { [k: number]: string }

export const keys = <E extends Enum<E>>(enumType: E) =>
  Object.keys(enumType).filter((key) => isNaN(Number(key))) as Array<keyof E>

export function values<E extends Enum<E>>(enumType: E) {
  return keys(enumType).map((key) => enumType[key]) as Array<E[keyof E]>
}
export const toPairs = <E extends Enum<E>>(enumType: E) =>
  keys(enumType).map((key) => [key, enumType[key]]) as Array<[keyof E, E[keyof E]]>

export const Enum = {
  keys,
  values,
  toPairs
}
