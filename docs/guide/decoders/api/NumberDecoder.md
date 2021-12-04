# NumberDecoder overview

This namespace contains number decoders and additional utilities for number validations.

## Summary

[[toc]]

## Functions

### NumberDecoder.min

#### Description

Check if the number is equal or greater to the given minimum

```ts
(minimum: number) => <I>(value: Decoder<I, number>) => Decoder<I, number>
```

#### Example
```ts
const decoder = pipe(
  NumberDecoder.number,
  NumberDecoder.min(1)
)

expect(pipe(1, Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe(0, Decoder.validate(decoder), Result.isKo)).toBe(true)
```

### NumberDecoder.max

#### Description

Check if the number is equal or greater to the given minimum

```ts
(maximum: number) => <I>(value: Decoder<I, number>) => Decoder<I, number>
```

#### Example
```ts
const decoder = pipe(
  NumberDecoder.number,
  NumberDecoder.max(100)
)

expect(pipe(100, Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe(101, Decoder.validate(decoder), Result.isKo)).toBe(true)
```

### NumberDecoder.between

#### Description

Check if the number is between to the given minimum and maximum

```ts
(minimum: number, maximum: number) => <I>(value: Decoder<I, number>) => Decoder<I, number>
```

#### Example
```ts
const decoder = pipe(
  NumberDecoder.number,
  NumberDecoder.between(1, 100)
)

expect(pipe(1, Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe(100, Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe(0, Decoder.validate(decoder), Result.isKo)).toBe(true)
expect(pipe(101, Decoder.validate(decoder), Result.isKo)).toBe(true)
```

### NumberDecoder.range

#### Description

Check if the input is a number between the given minimum and maximum.

```ts
(minimum: number, maximum: number) => Decoder<unknown, number>
```

#### Example
```ts
// The following:
const decoder = NumberDecoder.range(1, 100)
// is the same as:
const decoder = pipe(NumberDecoder.number, NumberDecoder.between(1, 100))
```

