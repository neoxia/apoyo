# Decode errors

All decoders from `@apoyo/decoders` will return a `Result<Type, DecodeError>`, where `Type` contains the type of the decoded value, and `DecodeError` being the validation error.

In this post, we will look in more details at all possible validation errors:

## Values

`DecodeError.Value` errors represents an error for a single value:

```ts
export namespace DecodeError {
  // ...

  export interface Value {
    _tag: 'DE.Value'
    value: unknown
    message: string
    meta: Dict
  }
}
```

*Examples*:

- The input is not a valid number
- The input is not an object
- etc...

As such, it is most of the time similar to "leafs" in tree-like structures.

This type of error contains the original (invalid) value and an error message. It may also contain additional metadata (error codes, etc...)

## Arrays (and array-likes)

`DecodeError.ArrayLike` and `DecodeError.Index` are used to represent errors for array-like structures:

```ts
export namespace DecodeError {
  // ...

  export interface Index {
    _tag: 'DE.Index'
    index: number
    error: DecodeError
  }
  export interface ArrayLike {
    _tag: 'DE.ArrayLike'
    kind: string // "array" is used for Array decoders
    errors: DecodeError.Index[]
  }
}
```

An invalid array will return an `DecodeError.ArrayLike` error.
This `DecodeError.ArrayLike` error will contain a list of `DecodeError.Index` errors.
Each `DecodeError.Index` will contain a reference to the original `DecodeError.Value` and the index at which the error occured.

**Note**: You could also use these error types to represent errors for tuple types.

## Objects (and object-likes)

`DecodeError.ObjectLike` and `DecodeError.Key` are used to represent errors for object-like structures:

```ts
export namespace DecodeError {
  // ...

  export interface Key {
    _tag: 'DE.Key'
    key: string
    error: DecodeError
  }
  export interface ObjectLike {
    _tag: 'DE.ObjectLike'
    kind: string // "object" is used for Object decoders
    name?: string
    errors: DecodeError.Key[]
  }
}
```

An invalid array will return an `DecodeError.ObjectLike` error.
This `DecodeError.ObjectLike` error will contain a list of `DecodeError.Key` errors.
Each `DecodeError.Key` will contain a reference to the original `DecodeError.Value` and the name of the property at which the error occured.

**Note**: You could also use these error types to represent errors for `Map<string, any>` types.

## Unions (and union-likes)

`DecodeError.UnionLike` and `DecodeError.Member` are used to represent errors for union-like types:

```ts
export namespace DecodeError {
  // ...

  export interface Member {
    _tag: 'DE.Member'
    index: number
    error: DecodeError
  }
  export interface UnionLike {
    _tag: 'DE.UnionLike'
    kind: string // "union" is used for unions
    name?: string
    errors: DecodeError.Member[]
  }
}
```

Unions are used to check if an input matches one of the given types.

*Example*: The input is either a number, or a string, or a boolean.

To validate these kind of structures, the decoder goes, one by one, through the list of decoders:

```ts
const bool = Decoder.union(
  BooleanDecoder.boolean,
  BooleanDecoder.fromString,
  BooleanDecoder.fromNumber
)
```

If all decoders are invalid, an `DecodeError.UnionLike` error is returned.
This `DecodeError.UnionLike` error will contain a list of `DecodeError.Member` errors, one for each possible type in the union.
Each `DecodeError.Member` will contain a reference to the original `DecodeError.Value` and the name of the index at which the error occured.

**Note**: You could also use these error types to represent errors for intersection types.

## Error reporters

By default, `@apoyo/decoders` provide 2 ways to format these errors:

- `DecodeError.draw`: By transforming a `DecodeError` into a `Tree`, we can draw an error an obtain a printable string like the following:

```txt
array
├─ index 0
│  └─ cannot decode "test": value is not a number
└─ index 1
   └─ cannot decode "another": value is not a number
```

- `DecodeError.flatten`: By flattening all errors to obtain the path to the invalid value.

```ts
export interface Flat {
  value: unknown
  message: string
  meta: Dict
  path?: string
}
```

**Note**: When using unions, the flattened list of errors may contain multiple times properties for the same path, but for a different union member.

*Example*: For the given decoder below, you may receive an error twice for the path 'type', if the type is neither 'Ok' or 'Ko':

```ts
const Ok = ObjectDecoder.struct({
  type: TextDecoder.equals('Ok'),
  ok: Decoder.unknown
})
const Ko = z.object({
  type: TextDecoder.equals('Ko'),
  ko: Decoder.unknown
})
const Result = Decoder.union(Ok, Ko)
```
