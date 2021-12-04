# Enum overview

This namespace contains utilities for Typescript enums.

## Summary

[[toc]]

## Functions

### Enum.keys

#### Description

Get all keys for the given enum.

```ts
<E extends Enum<E>>(enumType: E) => Array<keyof E>
```

#### Example
```ts
enum Color {
  RED = "red",
  BLUE = "blue",
  GREEN = "green"
}
const keys = Enum.keys(Color)

expect(keys).toEqual(["RED", "BLUE", "GREEN"])
```

### Enum.values

#### Description

Get all values for the given enum.

```ts
<E extends Enum<E>>(enumType: E) => Array<E[keyof E]>
```

#### Example
```ts
enum Color {
  RED = "red",
  BLUE = "blue",
  GREEN = "green"
}
const values = Enum.values(Color)

expect(values).toEqual(["red", "blue", "green"])
```

### Enum.toPairs

#### Description

Get all key/value pairs for the given enum.

```ts
<E extends Enum<E>>(enumType: E) => Array<[keyof E, E[keyof E]]>
```

#### Example
```ts
enum Color {
  RED = "red",
  BLUE = "blue",
  GREEN = "green"
}
const pairs = Enum.toPairs(Color)

expect(pairs).toEqual([
  ["RED", "red"],
  ["BLUE", "blue"],
  ["GREEN", "green"]
])
```

### Enum.isEnum

#### Description

Check if a value exists in the enumeration.
This function acts as a type guard for an enumeration.

```ts
<E extends Enum<E>>(enumType: E) => (input: unknown) => input is E[keyof E]
```

#### Example
```
enum Color {
  RED = "red",
  BLUE = "blue",
  GREEN = "green"
}

const isColor = Enum.isEnum(Color)

expect(isColor("red")).toBe(true)
expect(isColor("unknown")).toBe(false)
```

