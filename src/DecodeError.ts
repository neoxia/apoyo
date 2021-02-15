import { Dict } from './Dict'
import { pipe } from './pipe'
import * as Tree from './Tree'

export namespace DecodeError {
  export interface Value {
    _tag: 'DE.Value'
    value: unknown
    message: string
    [k: string]: unknown
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

  export interface Wrap {
    _tag: 'DE.Wrap'
    kind: string
    errors: DecodeError[]
    name?: string
  }
}
export type DecodeError =
  | DecodeError.Value
  | DecodeError.Key
  | DecodeError.Index
  | DecodeError.Member
  | DecodeError.Wrap

export const value = (value: unknown, message: string, meta: Dict<unknown> = {}): DecodeError.Value => ({
  _tag: 'DE.Value',
  value,
  message,
  ...meta
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

export const wrap = (kind: string) => (errors: DecodeError[], name?: string): DecodeError.Wrap => ({
  _tag: 'DE.Wrap',
  kind,
  name,
  errors
})

export const array = wrap('array')
export const object = wrap('object')
export const union = wrap('union')
export const intersect = wrap('intersection')

export const fold = <T>(cases: {
  value(err: DecodeError.Value): T
  key(err: DecodeError.Key): T
  index(err: DecodeError.Index): T
  member(err: DecodeError.Member): T
  wrap(err: DecodeError.Wrap): T
}) => (err: DecodeError): T => {
  switch (err._tag) {
    case 'DE.Value':
      return cases.value(err)
    case 'DE.Key':
      return cases.key(err)
    case 'DE.Index':
      return cases.index(err)
    case 'DE.Member':
      return cases.member(err)
    case 'DE.Wrap':
      return cases.wrap(err)
  }
}

export const toTree: (e: DecodeError) => Tree.Tree<string> = fold({
  value: (err) => Tree.of(`cannot decode ${JSON.stringify(err.value)}: ${err.message}`),
  key: (err) => Tree.of(`property ${JSON.stringify(err.key)}`, [err.error].map(toTree)),
  index: (err) => Tree.of(`index ${JSON.stringify(err.index)}`, [err.error].map(toTree)),
  member: (err) => Tree.of(`member ${JSON.stringify(err.index)}`, [err.error].map(toTree)),
  wrap: (err) => Tree.of(`${err.kind}${err.name ? ' ' + err.name : ''}`, err.errors.map(toTree))
})

export const draw = (e: DecodeError): string => pipe(e, toTree, Tree.draw)

export const DecodeError = {
  value,
  key,
  index,
  member,
  wrap,
  array,
  object,
  union,
  intersect,
  fold,
  toTree,
  draw
}
