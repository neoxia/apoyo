# EnumDecoder overview

## Summary

[[toc]]

## Functions

### EnumDecoder.native

#### Description

Checks if a value is included in the given enum

```ts
<E extends Enum<E>>(enumType: E) => EnumDecoder<unknown, E[keyof E]>
```

#### Example
```ts
enum Status {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ARCHIVED = "archived"
}

const decoder = EnumDecoder.native(Status)

expect(pipe("active", Decoder.validate(decoder), Result.get)).toBe(Status.ACTIVE)
expect(pipe("xxx", Decoder.validate(decoder), Result.isKo)).toBe(true)
```

### EnumDecoder.from

::: warning
Use `EnumDecoder.native` instead.
:::

#### Description

Checks if a value is included in the given enum

```ts
<E extends Enum<E>>(enumType: E) => EnumDecoder<unknown, E[keyof E]>
```

#### Example
```ts
enum Status {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ARCHIVED = "archived"
}

const decoder = EnumDecoder.from(Status)

expect(pipe("active", Decoder.validate(decoder), Result.get)).toBe(Status.ACTIVE)
expect(pipe("xxx", Decoder.validate(decoder), Result.isKo)).toBe(true)
```

### EnumDecoder.literal

#### Description

Checks if a value is in the given list of constants

```ts
<A extends readonly [Literal, ...Literal[]]>(...values_0: A) => Decoder<unknown, A[number]>
```

#### Example
```ts
const decoder = EnumDecoder.literal("active", "inactive", "archived")

expect(pipe("active", Decoder.validate(decoder), Result.get)).toBe("active")
expect(pipe("xxx", Decoder.validate(decoder), Result.isKo)).toBe(true)
```

### EnumDecoder.isIn

#### Description

Checks if a value is in the given list

```ts
<T>(arr: Array<T> | Set<T>) => Decoder<unknown, T>
```

#### Example
```ts
const decoder = EnumDecoder.isIn(["active", "inactive", "archived"])

expect(pipe("active", Decoder.validate(decoder), Result.get)).toBe("active")
expect(pipe("xxx", Decoder.validate(decoder), Result.isKo)).toBe(true)
```

