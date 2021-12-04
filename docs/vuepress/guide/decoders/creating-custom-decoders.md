# Creating custom decoders

## Introduction

In `@apoyo/decoders`, it is very easy to create new custom `Decoder`s:

```ts
const myBool: Decoder<unknown, boolean> = {
  decode: (input: unknown) => {
    if (typeof input === 'boolean') {
      return Result.ok(input)
    } 
    return Result.ko(DecodeError.value(input, `input is not a boolean`, {
      code: `invalid_type`
    }))
  }
}
```

We **recommend** however creating decoders with the provided helpers and utilities:

- `Decoder.create` to create a decoder:

```ts
const myBool: Decoder<unknown, boolean> = Decoder.create((input: unknown) => {
  if (typeof input === 'boolean') {
    return Result.ok(input)
  } 
  return Result.ko(DecodeError.value(input, `input is not a boolean`, {
    code: `invalid_type`
  }))
})
```

- `Decoder.fromGuard` to create a decoder from a type guard:

```ts
const myBool: Decoder<unknown, boolean> = Decoder.fromGuard(
  (input: unknown): input is boolean => typeof input === 'boolean',
  `input is not a boolean`, {
    code: `invalid_type`
  }
)
```

## Complex types

`@apoyo/decoders` are relatively low-level. As such, it is possible to very easily create more complex decoders.
For example, here an implementation for a tuple type:

```ts
import { Decoder, DecodeError } from '@apoyo/decoders'
import { pipe, Arr, Result, NonEmptyArray } from '@apoyo/std'

export function tuple<T1>(a: Decoder<unknown, T1>): Decoder<unknown, [T1]>
export function tuple<T1, T2>(a: Decoder<unknown, T1>, b: Decoder<unknown, T2>): Decoder<unknown, [T1, T2]>
export function tuple(...members: NonEmptyArray<Decoder<unknown, unknown>>): Decoder<unknown, unknown[]> {
  return Decoder.create((input: unknown) => {
    if (!Array.isArray(input)) {
      return Result.ko(
        DecodeError.value(input, `input is not a tuple`, {
          code: `invalid_type`
        })
      )
    }
    if (input.length !== members.length) {
      return Result.ko(
        DecodeError.value(input, `tuple has invalid length`, {
          code: `invalid_length`
        })
      )
    }
    const [ok, errors] = pipe(
      members,
      Arr.mapIndexed((decoder, index) => {
        return pipe(
          decoder.decode(input[index]),
          Result.mapError((err) => DecodeError.index(index, err))
        )
      }),
      Arr.separate
    )
    return errors.length > 0 ? Result.ko(DecodeError.array(errors)) : Result.ok(ok)
  })
}
```

Or, when re-using the already existing utilities, you may also write:

```ts
import { Decoder, DecodeError, ArrayDecoder } from '@apoyo/decoders'
import { pipe, Arr, Result, NonEmptyArray } from '@apoyo/std'

export function tuple<T1>(a: Decoder<unknown, T1>): Decoder<unknown, [T1]>
export function tuple<T1, T2>(a: Decoder<unknown, T1>, b: Decoder<unknown, T2>): Decoder<unknown, [T1, T2]>
export function tuple(...members: NonEmptyArray<Decoder<unknown, unknown>>): Decoder<unknown, unknown[]> {
  return pipe(
    ArrayDecoder.unknownArray,
    ArrayDecoder.length(members.length),
    Decoder.parse((input) => {
      const [ok, errors] = pipe(
        members,
        Arr.mapIndexed((decoder, index) =>
          pipe(
            input[index],
            Decoder.validate(decoder),
            Result.mapError((err) => DecodeError.index(index, err))
          )
        ),
        Arr.separate
      )
      return errors.length > 0 ? Result.ko(DecodeError.array(errors)) : Result.ok(ok)
    })
  )
}
```
