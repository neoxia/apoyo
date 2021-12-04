# TextDecoder overview

This namespace contains string decoders and additional utilities for string validations.

## Summary

[[toc]]

## Functions

### TextDecoder.length

#### Description

Check the length of the string

```ts
(len: number) => <I>(value: Decoder<I, string>) => Decoder<I, string>
```

### TextDecoder.min

#### Description

Check the minimum length of the string

```ts
(minLength: number) => <I>(value: Decoder<I, string>) => Decoder<I, string>
```

#### Example
```ts
const decoder = pipe(
  TextDecoder.string,
  TextDecoder.min(1)
)

expect(pipe('1', Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe('', Decoder.validate(decoder), Result.isKo)).toBe(true)
```

### TextDecoder.max

#### Description

Check the maximum length of the string

```ts
(maxLength: number) => <I>(value: Decoder<I, string>) => Decoder<I, string>
```

#### Example
```ts
const decoder = pipe(
  TextDecoder.string,
  TextDecoder.max(5)
)

expect(pipe('12345', Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe('123456', Decoder.validate(decoder), Result.isKo)).toBe(true)
```

### TextDecoder.between

#### Description

Check both the minimum and maximum length of the string

```ts
(minLength: number, maxLength: number) => <I>(value: Decoder<I, string>) => Decoder<I, string>
```

#### Example
```ts
const decoder = pipe(
  TextDecoder.string,
  TextDecoder.between(1, 100)
)

expect(pipe('', Decoder.validate(decoder), Result.isKo)).toBe(true)
```

### TextDecoder.trim

#### Description

Trim the string

```ts
<I>(decoder: Decoder<I, string>) => Decoder<I, string>
```

#### Example
```ts
const decoder = pipe(
  TextDecoder.string,
  TextDecoder.trim,
  TextDecoder.between(1, 100)
)

expect(pipe('     ', Decoder.validate(decoder), Result.isKo)).toBe(true)
```

### TextDecoder.pattern

#### Description

Check if the string matches a given pattern / regexp

```ts
<T extends string = string>(regexp: RegExp, message?: string, meta?: Dict<any>) => <I>(value: Decoder<I, string>) => Decoder<I, T>
```

#### Example
```ts
const decoder = pipe(
  TextDecoder.string,
  TextDecoder.pattern(/^Hello [a-zA-Z]+$/)
)

expect(pipe('Hello world', Decoder.validate(decoder), Result.isOk)).toBe(true)
```

### TextDecoder.varchar

#### Description

Check if the input is a string between the given length.

```ts
(minLength: number, maxLength: number) => Decoder<unknown, string>
```

#### Example
```ts
// The following:
const decoder = TextDecoder.varchar(1, 100)
// is the same as:
const decoder = pipe(TextDecoder.string, TextDecoder.between(1, 100))
```

### TextDecoder.nullable

#### Description

This makes the string nullable. If the string is empty, `null` is returned.

```ts
<I>(decoder: Decoder<I, string>) => Decoder<I, string | null>
```

#### Example
```ts
const decoder = pipe(TextDecoder.string, TextDecoder.nullable)

expect(pipe("Hello", Decoder.validate(decoder), Result.get)).toBe("Hello")
expect(pipe(null, Decoder.validate(decoder), Result.get)).toBe(null)
expect(pipe("", Decoder.validate(decoder), Result.get)).toBe(null)
```

#### References
- `TextDecoder.optional`
- `Decoder.nullable`

### TextDecoder.optional

#### Description

This makes the string optional (allows `undefined`). If the string is empty, `undefined` is returned.

```ts
<I>(decoder: Decoder<I, string>) => Decoder<I, string | undefined>
```

#### Example
```ts
const decoder = pipe(TextDecoder.string, TextDecoder.optional)

expect(pipe("Hello", Decoder.validate(decoder), Result.get)).toBe("Hello")
expect(pipe(undefined, Decoder.validate(decoder), Result.get)).toBe(undefined)
expect(pipe("", Decoder.validate(decoder), Result.get)).toBe(undefined)
```

#### References
- `TextDecoder.nullable`
- `Decoder.optional`

### TextDecoder.oneOf

::: warning
Use `EnumDecoder.isIn` instead.
:::

#### Description

Check if the string is included in the given values

```ts
<T extends string>(arr: Array<T>): Decoder<unknown, T>
<T extends string>(arr: Set<T>): Decoder<unknown, T>
```

#### Example
```ts
const decoder = TextDecoder.oneOf(['todo', 'in-progress', 'done', 'archived'] as const)

expect(pipe("todo", Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe("unknown", Decoder.validate(decoder), Result.isKo)).toBe(true)
```

### TextDecoder.equals

::: warning
Use `EnumDecoder.literal` instead.
:::

#### Description

Check if the string is included in the given values

```ts
<T extends string>(value: T) => Decoder<unknown, T>
```

#### Example
```ts
const decoder = TextDecoder.equals('ongoing')

expect(pipe("todo", Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe("unknown", Decoder.validate(decoder), Result.isKo)).toBe(true)
```

### TextDecoder.htmlEscape

#### Description

Escapes the HTML in the string.

```ts
<I>(decoder: Decoder<I, string>) => Decoder<I, string>
```

#### Example
```ts
const decoder = pipe(
  TextDecoder.string,
  TextDecoder.trim,
  TextDecoder.htmlEscape,
  TextDecoder.between(1, 2000)
)

const escaped = pipe(
  "<script>window.alert("Hello")</script>",
  Decoder.validate(decoder),
  Result.get
)

expect(escaped).toBe('&lt;script&gt;window.alert(&quot;Hello&quot;)&lt;/script&gt;')
```

