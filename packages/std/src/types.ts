export const isNumber = (value: unknown): value is number => typeof value === 'number'

export const isNaN = (value: number) => Number.isNaN(value)
export const isNull = <A>(value: A | null): value is null => value === null
export const isUndefined = <A>(value: A | undefined): value is undefined => value === undefined

export const isObject = (input: unknown): input is Record<string | number | symbol, unknown> =>
  typeof input === 'object' && input !== null

export const isFunction = (input: unknown): input is Function => typeof input === 'function'
