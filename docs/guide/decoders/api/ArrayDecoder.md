# ArrayDecoder overview

This namespace contains array decoders and additional utilities for array validations.

## Summary

[[toc]]

## Functions

### ArrayDecoder.array

#### Description

Check if the input is an array of a given type.

```ts
<A>(decoder: Decoder<unknown, A>) => ArrayDecoder<unknown, Array<A>>
```

### ArrayDecoder.nonEmptyArray

#### Description

Check if the input is a non empty array of a given type.

```ts
<O>(decoder: Decoder<unknown, O>) => Decoder<unknown, import("C:/Projects/ordinary-utils/packages/std/dist/lib/NonEmptyArray").NonEmptyArray<O>>
```

### ArrayDecoder.length

#### Description

Check the length of the string

```ts
(len: number) => <D extends ArrayDecoder<any, any>>(value: D) => D
```

### ArrayDecoder.min

#### Description

Check the minimum length of the array

```ts
(minLength: number) => <D extends ArrayDecoder<any, any>>(value: D) => D
```

#### Example
```ts
const decoder = pipe(
  ArrayDecoder.array(NumberDecoder.number),
  ArrayDecoder.min(1)
)

expect(pipe([1], Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe([], Decoder.validate(decoder), Result.isKo)).toBe(true)
```

### ArrayDecoder.max

#### Description

Check the maximum length of the array

```ts
(maxLength: number) => <D extends ArrayDecoder<any, any>>(value: D) => D
```

#### Example
```ts
const decoder = pipe(
  ArrayDecoder.array(NumberDecoder.number),
  ArrayDecoder.max(5)
)

expect(pipe([1,2,3,4,5], Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe([1,2,3,4,5,6], Decoder.validate(decoder), Result.isKo)).toBe(true)
```

### ArrayDecoder.between

#### Description

Check both the minimum and maximum length of the array

```ts
(minLength: number, maxLength: number) => <D extends ArrayDecoder<any, any>>(value: D) => D
```

#### Example
```ts
const decoder = pipe(
  ArrayDecoder.array(NumberDecoder.number),
  ArrayDecoder.between(1, 5)
)

expect(pipe([], Decoder.validate(decoder), Result.isKo)).toBe(true)
```

