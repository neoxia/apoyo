export const enum ErrorCode {
  REQUIRED = 'required',

  STRING = 'string',
  STRING_LENGTH = 'string.length',
  STRING_MIN = 'string.min',
  STRING_MAX = 'string.max',
  STRING_EMAIL = 'string.email',
  STRING_UUID = 'string.uuid',
  STRING_EQUALS = 'string.equals',
  STRING_ONE_OF = 'string.oneOf',
  STRING_DATE = 'string.date',
  STRING_DATETIME = 'string.datetime',

  DATE = 'date',

  NUMBER = 'number',
  NUMBER_STRICT = 'number.strict',
  NUMBER_FROM_STRING = 'number.fromString',
  NUMBER_MIN = 'number.min',
  NUMBER_MAX = 'number.max',

  INT = 'int',
  INT_STRICT = 'int.strict',
  INT_FROM_STRING = 'int.fromString',
  INT_MIN = 'int.min',
  INT_MAX = 'int.max',

  BOOL = 'bool',
  BOOL_STRICT = 'bool.strict',
  BOOL_FROM_STRING = 'bool.fromString',
  BOOL_FROM_NUMBER = 'bool.fromNumber',
  BOOL_EQUALS = 'bool.equals',

  ARRAY = 'array',
  ARRAY_NON_EMPTY = 'array.nonEmpty',
  ARRAY_LENGTH = 'array.length',
  ARRAY_MIN = 'array.min',
  ARRAY_MAX = 'array.max',

  DICT = 'dict',

  ENUM = 'enum.native',
  ENUM_LITERAL = 'enum.literal',
  ENUM_IS_IN = 'enum.isIn'
}
