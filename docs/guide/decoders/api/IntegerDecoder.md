# IntegerDecoder overview

This namespace contains integer decoders and additional utilities for integer validations.

## Summary

[[toc]]

## Functions

### IntegerDecoder.min

#### Description

Check if the number is equal or greater to the given minimum

```ts
(minimum: number) => <I>(decoder: IntegerDecoder<I>) => IntegerDecoder<I>
```

#### Example
```ts
const decoder = pipe(
  IntegerDecoder.number,
  IntegerDecoder.min(1)
)

expect(pipe(1, Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe(0, Decoder.validate(decoder), Result.isKo)).toBe(true)
```

### IntegerDecoder.max

#### Description

Check if the number is equal or greater to the given minimum

```ts
(maximum: number) => <I>(decoder: IntegerDecoder<I>) => IntegerDecoder<I>
```

#### Example
```ts
const decoder = pipe(
  IntegerDecoder.number,
  IntegerDecoder.max(100)
)

expect(pipe(100, Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe(101, Decoder.validate(decoder), Result.isKo)).toBe(true)
```

### IntegerDecoder.between

#### Description

Check if the number is between to the given minimum and maximum

```ts
(minimum: number, maximum: number) => <I>(decoder: IntegerDecoder<I>) => IntegerDecoder<I>
```

#### Example
```ts
const decoder = pipe(
  IntegerDecoder.number,
  IntegerDecoder.between(1, 100)
)

expect(pipe(1, Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe(100, Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe(0, Decoder.validate(decoder), Result.isKo)).toBe(true)
expect(pipe(101, Decoder.validate(decoder), Result.isKo)).toBe(true)
```

### IntegerDecoder.range

#### Description

Check if the input is a number between the given minimum and maximum.

```ts
(minimum: number, maximum: number) => IntegerDecoder<unknown>
```

#### Example
```ts
// The following:
const decoder = IntegerDecoder.range(1, 100)
// is the same as:
const decoder = pipe(IntegerDecoder.number, IntegerDecoder.between(1, 100))
```

