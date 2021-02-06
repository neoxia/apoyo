import { Dict } from './Dict'

interface Value {
  _tag: 'Value'
  value: unknown
  message: string
  [k: string]: unknown
}

interface Key {
  _tag: 'Key'
  key: string
  error: DecodeError
}

interface Index {
  _tag: 'Index'
  index: number
  error: DecodeError
}

interface Member {
  _tag: 'Member'
  index: number
  error: DecodeError
}

type WrapKind = 'union' | 'intersection' | 'object' | 'array'

interface Wrap {
  _tag: 'Wrap'
  kind: WrapKind
  errors: DecodeError[]
  name?: string
}

export type DecodeError = Value | Key | Index | Member | Wrap

export const value = (value: unknown, message: string, meta: Dict<unknown> = {}): Value => ({
  _tag: 'Value',
  value,
  message,
  ...meta
})

export const key = (key: string, error: DecodeError): Key => ({
  _tag: 'Key',
  key,
  error
})

export const index = (index: number, error: DecodeError): Index => ({
  _tag: 'Index',
  index,
  error
})

export const member = (index: number, error: DecodeError): Member => ({
  _tag: 'Member',
  index,
  error
})

const wrap = (kind: WrapKind) => (errors: DecodeError[], name?: string): Wrap => ({
  _tag: 'Wrap',
  kind,
  name,
  errors
})

export const array = wrap('array')
export const object = wrap('object')
export const union = wrap('union')
export const intersect = wrap('intersection')

export const DecodeError = {
  value,
  key,
  index,
  member,
  wrap,
  array,
  object,
  union,
  intersect
}
