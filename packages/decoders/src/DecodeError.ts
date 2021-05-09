import { Arr, Dict, Obj, pipe, Tree } from '@apoyo/std'

export namespace DecodeError {
  export interface Flat {
    value: unknown
    message: string
    meta: Dict
    path: string[]
  }

  export interface Value {
    _tag: 'DE.Value'
    value: unknown
    message: string
    meta: Dict
  }

  export interface Key {
    _tag: 'DE.Key'
    key: string
    error: DecodeError
  }

  export interface Index {
    _tag: 'DE.Index'
    index: number
    error: DecodeError
  }

  export interface Member {
    _tag: 'DE.Member'
    index: number
    error: DecodeError
  }

  export interface ArrayLike {
    _tag: 'DE.ArrayLike'
    kind: string
    errors: DecodeError.Index[]
  }
  export interface ObjectLike {
    _tag: 'DE.ObjectLike'
    kind: string
    name?: string
    errors: DecodeError.Key[]
  }
  export interface UnionLike {
    _tag: 'DE.UnionLike'
    kind: string
    name?: string
    errors: DecodeError.Member[]
  }
}
export type DecodeError = DecodeError.Value | DecodeError.ObjectLike | DecodeError.ArrayLike | DecodeError.UnionLike

export const value = (value: unknown, message: string, meta: Dict<unknown> = {}): DecodeError.Value => ({
  _tag: 'DE.Value',
  value,
  message,
  meta
})

export const key = (key: string, error: DecodeError): DecodeError.Key => ({
  _tag: 'DE.Key',
  key,
  error
})

export const index = (index: number, error: DecodeError): DecodeError.Index => ({
  _tag: 'DE.Index',
  index,
  error
})

export const member = (index: number, error: DecodeError): DecodeError.Member => ({
  _tag: 'DE.Member',
  index,
  error
})

export const array = (errors: DecodeError.Index[]): DecodeError.ArrayLike => ({
  _tag: 'DE.ArrayLike',
  kind: 'array',
  errors
})

export const object = (errors: DecodeError.Key[], name?: string): DecodeError.ObjectLike => ({
  _tag: 'DE.ObjectLike',
  kind: 'object',
  name,
  errors
})

export const union = (errors: DecodeError.Member[], name?: string): DecodeError.UnionLike => ({
  _tag: 'DE.UnionLike',
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
  switch (err._tag) {
    case 'DE.Value':
      return cases.value(err)
    case 'DE.ArrayLike':
      return cases.array(err)
    case 'DE.ObjectLike':
      return cases.object(err)
    case 'DE.UnionLike':
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

export const flatten: (e: DecodeError) => DecodeError.Flat[] = fold({
  value: (err): DecodeError.Flat[] => pipe({ ...err, path: [] }, Obj.omit(['_tag']), Arr.of),
  array: (err) =>
    pipe(
      err.errors,
      Arr.chain((sub) =>
        pipe(
          flatten(sub.error),
          Arr.map((error) => ({
            ...error,
            path: [`index ${sub.index}`, ...error.path]
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
            path: [`property ${JSON.stringify(sub.key)}`, ...error.path]
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
            path: [`${err.kind} (member ${sub.index})`, ...error.path]
          }))
        )
      )
    )
})

export const formatError = (e: DecodeError.Flat) =>
  `invalid value ${JSON.stringify(e.value)} at ${e.path.join(', ')}: ${e.message}`

export const draw = (e: DecodeError): string => pipe(e, toTree, Tree.draw)

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
  flatten,
  formatError,
  draw
}
