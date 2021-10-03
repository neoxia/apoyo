import { Arr, Dict, pipe, Tree } from '@apoyo/std'

export const enum DecodeErrorTag {
  VALUE = 'DE.Value',

  ARRAY = 'DE.ArrayLike',
  INDEX = 'DE.Index',

  OBJECT = 'DE.ObjectLike',
  KEY = 'DE.Key',

  UNION = 'DE.UnionLike',
  MEMBER = 'DE.Member'
}

export namespace DecodeError {
  export interface Value {
    tag: DecodeErrorTag.VALUE
    value: unknown
    message: string
    meta: Dict
  }

  export interface Key {
    tag: DecodeErrorTag.KEY
    key: string
    error: DecodeError
  }

  export interface Index {
    tag: DecodeErrorTag.INDEX
    index: number
    error: DecodeError
  }

  export interface Member {
    tag: DecodeErrorTag.MEMBER
    index: number
    error: DecodeError
  }

  export interface ArrayLike {
    tag: DecodeErrorTag.ARRAY
    kind: string
    errors: DecodeError.Index[]
  }
  export interface ObjectLike {
    tag: DecodeErrorTag.OBJECT
    kind: string
    name?: string
    errors: DecodeError.Key[]
  }
  export interface UnionLike {
    tag: DecodeErrorTag.UNION
    kind: string
    name?: string
    errors: DecodeError.Member[]
  }

  export type Path =
    | { tag: DecodeErrorTag.ARRAY; kind: string }
    | { tag: DecodeErrorTag.INDEX; index: number }
    | { tag: DecodeErrorTag.OBJECT; kind: string; name?: string }
    | { tag: DecodeErrorTag.KEY; key: string }
    | { tag: DecodeErrorTag.UNION; kind: string; name?: string }
    | { tag: DecodeErrorTag.MEMBER; index: number }

  export interface Flat {
    value: unknown
    message: string
    meta: Dict
    path: Path[]
  }

  export interface Formatted {
    value: unknown
    message: string
    description: string
    meta: Dict
    path: string
  }
}
export type DecodeError = DecodeError.Value | DecodeError.ObjectLike | DecodeError.ArrayLike | DecodeError.UnionLike

export const value = (value: unknown, message: string, meta: Dict = {}): DecodeError.Value => ({
  tag: DecodeErrorTag.VALUE,
  value,
  message,
  meta
})

export const key = (key: string, error: DecodeError): DecodeError.Key => ({
  tag: DecodeErrorTag.KEY,
  key,
  error
})

export const index = (index: number, error: DecodeError): DecodeError.Index => ({
  tag: DecodeErrorTag.INDEX,
  index,
  error
})

export const member = (index: number, error: DecodeError): DecodeError.Member => ({
  tag: DecodeErrorTag.MEMBER,
  index,
  error
})

export const array = (errors: DecodeError.Index[]): DecodeError.ArrayLike => ({
  tag: DecodeErrorTag.ARRAY,
  kind: 'array',
  errors
})

export const object = (errors: DecodeError.Key[], name?: string): DecodeError.ObjectLike => ({
  tag: DecodeErrorTag.OBJECT,
  kind: 'object',
  name,
  errors
})

export const union = (errors: DecodeError.Member[], name?: string): DecodeError.UnionLike => ({
  tag: DecodeErrorTag.UNION,
  kind: 'union',
  name,
  errors
})

export const fold = <T>(cases: {
  value(err: DecodeError.Value): T
  array(err: DecodeError.ArrayLike): T
  object(err: DecodeError.ObjectLike): T
  union(err: DecodeError.UnionLike): T
}) => (err: DecodeError): T => {
  switch (err.tag) {
    case DecodeErrorTag.VALUE:
      return cases.value(err)
    case DecodeErrorTag.ARRAY:
      return cases.array(err)
    case DecodeErrorTag.OBJECT:
      return cases.object(err)
    case DecodeErrorTag.UNION:
      return cases.union(err)
  }
}

export const toTree: (e: DecodeError) => Tree<string> = fold({
  value: (err) => Tree.of(`cannot decode ${JSON.stringify(err.value)}: ${err.message}`),
  array: (err) =>
    Tree.of(
      `${err.kind}`,
      pipe(
        err.errors,
        Arr.map((err) => Tree.of(`index ${JSON.stringify(err.index)}`, [err.error].map(toTree)))
      )
    ),
  object: (err) =>
    Tree.of(
      `${err.kind}${err.name ? ' ' + err.name : ''}`,
      pipe(
        err.errors,
        Arr.map((err) => Tree.of(`property ${JSON.stringify(err.key)}`, [err.error].map(toTree)))
      )
    ),
  union: (err) =>
    Tree.of(
      `${err.kind}${err.name ? ' ' + err.name : ''}`,
      pipe(
        err.errors,
        Arr.map((err) => Tree.of(`member ${JSON.stringify(err.index)}`, [err.error].map(toTree)))
      )
    )
})

export const draw = (e: DecodeError): string => pipe(e, toTree, Tree.draw)

export const flatten: (e: DecodeError) => DecodeError.Flat[] = fold({
  value: (err): DecodeError.Flat[] => [
    {
      value: err.value,
      message: err.message,
      meta: err.meta,
      path: []
    }
  ],
  array: (err) =>
    pipe(
      err.errors,
      Arr.chain((sub) =>
        pipe(
          flatten(sub.error),
          Arr.map((error) => ({
            ...error,
            path: [
              {
                tag: DecodeErrorTag.ARRAY,
                kind: err.kind
              },
              {
                tag: DecodeErrorTag.INDEX,
                index: sub.index
              },
              ...error.path
            ]
          }))
        )
      )
    ),
  object: (err) =>
    pipe(
      err.errors,
      Arr.chain((sub) =>
        pipe(
          flatten(sub.error),
          Arr.map((error) => ({
            ...error,
            path: [
              {
                tag: DecodeErrorTag.OBJECT,
                kind: err.kind,
                name: err.name
              },
              {
                tag: DecodeErrorTag.KEY,
                key: sub.key
              },
              ...error.path
            ]
          }))
        )
      )
    ),
  union: (err) =>
    pipe(
      err.errors,
      Arr.chain((sub) =>
        pipe(
          flatten(sub.error),
          Arr.map((error) => ({
            ...error,
            path: [
              {
                tag: DecodeErrorTag.UNION,
                kind: err.kind,
                name: err.name
              },
              {
                tag: DecodeErrorTag.MEMBER,
                index: sub.index
              },
              ...error.path
            ]
          }))
        )
      )
    )
})

export const formatBy = <T>(fn: (flat: DecodeError.Flat) => T) => (e: DecodeError) => pipe(e, flatten, Arr.map(fn))

export const getDescription = (err: DecodeError.Flat, separator = ', at ') => {
  const stack = pipe(
    err.path,
    Arr.filterMap((p) => {
      if (p.tag === DecodeErrorTag.ARRAY) {
        return `${p.kind}`
      }
      if (p.tag === DecodeErrorTag.INDEX) {
        return `index ${p.index}`
      }
      if (p.tag === DecodeErrorTag.OBJECT) {
        return `${p.kind}${p.name ? ' ' + p.name : ''}`
      }
      if (p.tag === DecodeErrorTag.KEY) {
        return `property ${JSON.stringify(p.key)}`
      }
      if (p.tag === DecodeErrorTag.UNION) {
        return `${p.kind}${p.name ? ' ' + p.name : ''}`
      }
      if (p.tag === DecodeErrorTag.MEMBER) {
        return `member ${p.index}`
      }
      return undefined
    })
  )
  return pipe([`cannot decode ${JSON.stringify(err.value)}: ${err.message}`, ...stack], Arr.join(separator))
}

const toPath = (path: (number | string)[]): string =>
  pipe(
    path,
    Arr.mapIndexed((item, i) => (typeof item === 'number' ? `[${item}]` : i > 0 ? `.${item}` : item)),
    Arr.join('')
  )

export const getPath = (err: DecodeError.Flat): string => {
  return pipe(
    err.path,
    Arr.filterMap((p) => (p.tag === DecodeErrorTag.INDEX ? p.index : p.tag === DecodeErrorTag.KEY ? p.key : undefined)),
    toPath
  )
}

export const format = formatBy(
  (e): DecodeError.Formatted => {
    return {
      value: e.value,
      message: e.message,
      meta: e.meta,
      description: getDescription(e),
      path: getPath(e)
    }
  }
)

/**
 * @deprecated Use `DecodeError.format` or `DecodeError.formatBy` to fully customize your error messages
 */
export const formatError = (e: DecodeError.Flat) => getDescription(e)

export const DecodeError = {
  value,
  key,
  index,
  member,
  array,
  object,
  union,
  fold,
  toTree,

  /**
   * @description
   * Format your `DecodeError` into a easily displayable string.
   */
  draw,

  /**
   * @description
   * Flatten your `DecodeError` into an `DecodeError.Flat`.
   * This allows you to more easily format custom errors.
   *
   * It is however recommended to simply use `DecodeError.format` or `DecodeError.formatBy` instead.
   */
  flatten,

  /**
   * @description
   * Get full error description / stack from a `DecodeError.Flat`.
   * Use `DecodeError.flatten` to transform your `DecodeError` into an `DecodeError.Flat`
   */
  getDescription,

  /**
   * @description
   * Get full property path from a `DecodeError.Flat`.
   * Use `DecodeError.flatten` to transform your `DecodeError` into an `DecodeError.Flat`
   */
  getPath,

  /**
   * @description
   * Create a custom error formatter, to fully customize your error output
   */
  formatBy,

  /**
   * @description
   * Default `DecodeError.formatBy` implementation, that returns `DecodeError.Formatted` errors
   */
  format,

  /**
   * @deprecated Use `DecodeError.getDescription` instead
   *
   * @see `DecodeError.getDescription`
   */
  formatError
}
