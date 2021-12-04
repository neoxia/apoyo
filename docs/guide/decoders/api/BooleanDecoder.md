# BooleanDecoder overview

This namespace contains boolean decoders and additional utilities for boolean validations.

## Summary

[[toc]]

## Functions

### BooleanDecoder.equals

#### Description

Check if the boolean is true or false

```ts
<T extends boolean>(bool: T) => Decoder<unknown, T>
```

#### Example
```
const decoder = BooleanDecoder.equals(true)

expect(pipe(true, Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe(false, Decoder.validate(decoder), Result.isKo)).toBe(true)
```

