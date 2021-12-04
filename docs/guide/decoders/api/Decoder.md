# Decoder overview

A `Decoder` is a function, that from an input I to create an output O, or produce an DecodeError.
As such, a common use-case for `Decoder`s are type and value validations.

This namespace contains the core utilities to:
- Create `Decoder`s
- Use or combine them
- Extract / infer the resulting type informations

```ts
export const TodoDto = ObjectDecoder.struct({
  id: IntegerDecoder.int,
  title: TextDecoder.range(1, 100),
  description: pipe(TextDecoder.range(0, 2000), TextDecoder.nullable),
  done: BooleanDecoder.boolean
})

export interface TodoDto extends Decoder.TypeOf<typeof TodoDto> {}
```

## Summary

[[toc]]

## Functions

### Decoder.create

#### Description

Create a new decoder

```ts
<I, O>(fn: (input: I) => DecoderResult<O>) => Decoder<I, O>
```

### Decoder.fromGuard

#### Description

Creates a new decoder from a type guard

```ts
<I, O extends I>(fn: Refinement<I, O>, message: string, meta?: Dict<unknown> | undefined) => Decoder<I, O>
```

#### Example
```ts
const stringDecoder = Decoder.fromGuard(
  (input: unknown): input is string => typeof input === 'string',
  'value is not a string'
)

expect(pipe('Hello', Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe(42, Decoder.validate(decoder), Result.isKo)).toBe(true)
```

### Decoder.map

#### Description

Map over the resulting value of an `Decoder`

```ts
<A, B>(fn: (input: A) => B) => <I>(decoder: Decoder<I, A>) => Decoder<I, B>
```

#### Example
```ts
const decoder = pipe(
  TextDecoder.string,
  Decoder.map(str => str.trim())
)

expect(pipe('  Hello  ', Decoder.validate(decoder), Result.get)).toBe('Hello')
```

### Decoder.withMessage

#### Description

Catch the validation error and create a new error with the given message.

```ts
(msg: string, meta?: Dict<unknown> | undefined) => <I, A>(decoder: Decoder<I, A>) => Decoder<I, A>
```

#### Example
```ts
const decoder = pipe(
  Decoder.union(
    NumberDecoder.number,
    NumberDecoder.fromString
  ),
  Decoder.withMessage('The given value is not a number', {
    code: 'invalid_number'
  })
)

const expectedError = DecodeError.value('  Hello  ', 'This value is not a number', {
  code: 'invalid_number'
})
expect(pipe('  Hello  ', Decoder.validate(decoder))).toEqual(Result.ko(expectedError))
```

### Decoder.parse

#### Description

Add a custom validation function to an `Decoder`.

Compared to `Decoder.guard`, this function gives more control and allows the user to modify the resulting value.

```ts
<B, C>(fn: (input: B) => DecoderResult<C>) => <A>(decoder: Decoder<A, B>) => Decoder<A, C>
```

#### Example
```ts
const validateAge = (dob: string): Result<string, DecodeError> => {
  const now = new Date()
  const date = new Date(dob)

  if (date.getFullYear() < now.getFullYear() - 100) {
    return Result.ko(DecodeError.value(dob, 'Date of birth is more than 100 years ago'))
  }
  if (date.getFullYear() > now.getFullYear() - 18) {
    return Result.ko(DecodeError.value(dob, 'Date of birth is less than 18 years ago'))
  }
  return Result.ok(dob)
}

const birthdayDecoder = pipe(
  DateDecoder.date,
  Decoder.parse(validateAge)
)

expect(pipe('1930-01-01', Decoder.validate(birthdayDecoder), Result.isOk)).toBe(true)
expect(pipe('1920-01-01', Decoder.validate(birthdayDecoder), Result.isKo)).toBe(true)
```

#### References
- `Decoder.guard`
- `Decoder.filter`
- `Decoder.reject`

### Decoder.chain

#### Description

Chain another decoder to execute with the current input.
This allows you to dynamically compute the decoder to use depending on a value.

```ts
<B, C>(fn: (input: B) => Decoder<B, C>) => <A>(decoder: Decoder<A, B>) => Decoder<A, C>
```

### Decoder.guard

#### Description

Add a custom validation function, returning either:
- A `DecodeError` if the input is incorrect
- `undefined` if there is no error to report.

This function gives more control about the returned error than `Decoder.filter` or `Decoder.reject`, but does not allow the value to be modified.

```ts
<O>(fn: (input: O) => Option<DecodeError>) => <A>(decoder: Decoder<A, O>) => Decoder<A, O>
```

#### Example
```ts
const validateAge = (dob: string): Option<DecodeError> => {
  const now = new Date()
  const date = new Date(dob)

  if (date.getFullYear() < now.getFullYear() - 100) {
    return DecodeError.value(dob, 'Date of birth is more than 100 years ago')
  }
  if (date.getFullYear() > now.getFullYear() - 18) {
    return DecodeError.value(dob, 'Date of birth is less than 18 years ago')
  }
  return undefined
}

const birthdayDecoder = pipe(
  DateDecoder.date,
  Decoder.guard(validateAge)
)

expect(pipe('1930-01-01', Decoder.validate(birthdayDecoder), Result.isOk)).toBe(true)
expect(pipe('1920-01-01', Decoder.validate(birthdayDecoder), Result.isKo)).toBe(true)
```

#### References
- `Decoder.parse`
- `Decoder.filter`
- `Decoder.reject`

### Decoder.filter

#### Description

Add a `Predicate` filter function to a `Decoder`.
If the value matches the `Predicate`, the value is kept.
Else, an DecodeError with the given message is returned.

```ts
<A, B extends A>(fn: Refinement<A, B>, message: string, meta?: Dict<unknown> | undefined): <I>(value: Decoder<I, A>) => Decoder<I, B>
<A>(fn: Predicate<A>, message: string, meta?: Dict<unknown> | undefined): <I>(value: Decoder<I, A>) => Decoder<I, A>
```

#### Example
```ts
const maxAge = (age: number) => (dob: string) => {
  const now = new Date()
  const date = new Date(dob)
  return date.getFullYear() > now.getFullYear() - age
}
const minAge = (age: number) => (dob: string) => {
  const now = new Date()
  const date = new Date(dob)
  return date.getFullYear() < now.getFullYear() - age
}

const birthdayDecoder = pipe(
  DateDecoder.date,
  Decoder.filter(maxAge(100), `Date of birth is more than 100 years ago`),
  Decoder.filter(minAge(18), `Date of birth is less than 18 years ago`)
)

expect(pipe('1930-01-01', Decoder.validate(birthdayDecoder), Result.isOk)).toBe(true)
expect(pipe('1920-01-01', Decoder.validate(birthdayDecoder), Result.isKo)).toBe(true)
```

#### References
- `Decoder.parse`
- `Decoder.guard`
- `Decoder.reject`

### Decoder.reject

#### Description

Add a `Predicate` filter function to a `Decoder`.
If the value matches the `Predicate`, an DecodeError with the given message is returned.
Else, the value is kept.

```ts
<A, B extends A>(fn: Refinement<A, B>, message: string, meta?: Dict<unknown> | undefined): <I>(value: Decoder<I, A>) => Decoder<I, InverseRefinement<A, B>>
<A>(fn: Predicate<A>, message: string, meta?: Dict<unknown> | undefined): <I>(value: Decoder<I, A>) => Decoder<I, A>
```

#### Example
```ts
const decoder = pipe(
  TextDecoder.string,
  Decoder.reject(str => str.length === 0, `string should not be empty`)
)

expect(pipe('Hello', Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe('', Decoder.validate(decoder), Result.isKo)).toBe(true)
```

#### References
- `Decoder.parse`
- `Decoder.guard`
- `Decoder.filter`

### Decoder.nullable

#### Description

Makes the value nullable.

**Note**: If you want to transform an empty string to `null`, use `TextDecoder.nullable` instead.

```ts
<I, O>(decoder: Decoder<I, O>) => Decoder<I, O | null>
```

#### Example
```ts
const decoder = pipe(
  TextDecoder.string,
  Decoder.nullable
)

expect(pipe('Hello', Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe('', Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe('', Decoder.validate(decoder), Result.get)).toBe('')
expect(pipe(null, Decoder.validate(decoder), Result.get)).toBe(null)
```

#### References
- `Decoder.optional`
- `TextDecoder.nullable`

### Decoder.optional

#### Description

Makes the value optional (allows `undefined`).

**Note**: If you want to transform an empty string to `undefined`, use `TextDecoder.optional` instead.

```ts
<I, O>(decoder: Decoder<I, O>) => Decoder<I, O | undefined>
```

#### Example
```ts
const decoder = pipe(
  TextDecoder.string,
  Decoder.optional
)

expect(pipe('Hello', Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe('', Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe('', Decoder.validate(decoder), Result.get)).toBe('')
expect(pipe(undefined, Decoder.validate(decoder), Result.get)).toBe(undefined)
```

#### References
- `Decoder.nullable`
- `TextDecoder.optional`

### Decoder.required

#### Description

Explicitely return an "input is required" error when input is "null" or "undefined"

```ts
<I, O>(decoder: Decoder<I, O>) => Decoder<I, O | undefined>
```

#### Example
```ts
const decoder = pipe(
  TextDecoder.string,
  Decoder.required
)
```

### Decoder.lazy

#### Description

This function allows the creation of recursive type decoders.

```ts
<I, O>(fn: () => Decoder<I, O>) => Decoder<I, O>
```

#### Example
```ts
interface Tree<T> {
  value: T
  forest: Tree<T>[]
}

// Recursive types require manual typing
const TreeDecoder = <O>(decoder: Decoder<unknown, O>): Decoder<unknown, Tree<O>> =>
  Decoder.lazy(() =>
    ObjectDecoder.struct({
      value: decoder,
      forest: ArrayDecoder.array(TreeDecoder(decoder))
    })
  )

const input: unknown = {
  value: 'Hello',
  forest: [
    {
       value: 'World',
       forest: []
    }
  ]
}

expect(pipe(input, TreeDecoder(TextDecoder.string), Result.isOk)).toBe(true)
```

### Decoder.union

#### Description

Creates a union `Decoder` that tries, in the given order, if the input is valid.

```ts
<I, O1, O2>(a: Decoder<I, O1>, b: Decoder<I, O2>): Decoder<I, O1 | O2>
<I, O1, O2, O3>(a: Decoder<I, O1>, b: Decoder<I, O2>, c: Decoder<I, O3>): Decoder<I, O1 | O2 | O3>
<I, O1, O2, O3, O4>(a: Decoder<I, O1>, b: Decoder<I, O2>, c: Decoder<I, O3>, d: Decoder<I, O4>): Decoder<I, O1 | O2 | O3 | O4>
```

#### Example
```ts
const decoder = Decoder.union(
  NumberDecoder.number,
  NumberDecoder.fromString
)

expect(pipe(42, Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe("42", Decoder.validate(decoder), Result.isOk)).toBe(true)
expect(pipe("Hello", Decoder.validate(decoder), Result.isKo)).toBe(true)
```

### Decoder.ref

#### Description

Utility to bind a given generated type to a `Decoder`

```ts
<A>(decoder: Decoder<unknown, A>) => Decoder<unknown, A>
```

### Decoder.validate

#### Description

Validate an input by the given `Decoder`

```ts
<O>(decoder: Decoder<unknown, O>): (input: unknown) => DecoderResult<O>
<I, O>(decoder: Decoder<I, O>): (input: I) => DecoderResult<O>
```

#### Example
```
const result = pipe(
  input,
  Decoder.validate(TextDecoder.string)
)

if (Result.isKo(result)) {
  console.log(result.ko)
  return
}

const value = result.ok
console.log(value)
```

