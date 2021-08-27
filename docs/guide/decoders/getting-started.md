# Getting started

**Warning**: This package is still in development and features may still change, be renamed or removed.

However, we would appreciate any feedback you have on how to improve this library:

- Which features are missing?
- Which features are hard to understand or unnecessary?
- Which features need to be improved?

## Installation

`npm install @apoyo/decoders`

## Introduction

In `@apoyo/decoders`, a `Decoder` is an object used validate and transform an input of type `I`, to an output of type `O`, or an `DecodeError`.

```ts
export interface Decoder<I, O> {
  decode: (input: I) => Result<O, DecodeError>
}
```

*Example:* `Decoder<unknown, string>` will take an input of type `unknown`, and return either a `string` or an `DecodeError`.

## Existing decoders

A lot of the most commonly used decoders are provided by this library:

- Decoder contains general purpose helpers
- TextDecoder for string validations
- NumberDecoder for number validation
- IntegerDecoder
- BooleanDecoder
- ArrayDecoder
- ObjectDecoder

If is also very easy to [create custom decoders from scratch](/guide/decoders/creating-custom-decoders).

## Definition

```ts
import { ObjectDecoder, ArrayDecoder, DateDecoder, IntegerDecoder, TextDecoder, Decoder, BooleanDecoder } from '@apoyo/decoders'
import { pipe, Result } from '@apoyo/std'

const validateAge = (dob: string) => {
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

const UserDto = ObjectDecoder.struct({
  id: TextDecoder.string,
  email: TextDecoder.email,
  name: pipe(TextDecoder.varchar(1, 100), Decoder.nullable),
  dob: pipe(DateDecoder.date, Decoder.parse(validateAge), Decoder.nullable),
  age: IntegerDecoder.range(0, 120),
  createdAt: DateDecoder.datetime,
  updatedAt: DateDecoder.datetime
})

const TagDto = pipe(
  TextDecoder.string,
  TextDecoder.between(1, 32)
)

const TodoDto = ObjectDecoder.struct({
  id: TextDecoder.string,
  title: TextDecoder.varchar(1, 100),
  done: pipe(BooleanDecoder.boolean),
  // tags: string[]
  tags: pipe(
    ArrayDecoder.array(TagDto),
    ArrayDecoder.between(0, 5),
    Decoder.optional,
    Decoder.map((input) => (input === undefined ? [] : input))
  ),
  // description: string | null
  description: pipe(
    TextDecoder.varchar(0, 2000),
    Decoder.nullable,
    Decoder.optional,
    Decoder.map((input) => (input === '' || input === undefined ? null : input))
  ),
  createdAt: DateDecoder.datetime,
  updatedAt: DateDecoder.datetime
})

const TodoPostDto = pipe(TodoDto, ObjectDecoder.omit(['id', 'createdAt', 'updatedAt']))
const TodoPutDto = pipe(TodoDto, ObjectDecoder.partial, ObjectDecoder.omit(['id', 'createdAt', 'updatedAt']))

interface TodoDto extends Decoder.TypeOf<typeof TodoDto> {}
interface TodoPostDto extends Decoder.TypeOf<typeof TodoPostDto> {}
interface TodoPutDto extends Decoder.TypeOf<typeof TodoPutDto> {}

```

## Usage

```ts
const result = pipe(
  input,
  Decoder.validate(TodoDto)
)

if (Result.isKo(result)) {
  return new Error(`Validation failed:\n${DecodeError.draw(result.ko)}`)
}

const dto = result.ok
console.log(`Validation successful`, dto)
```

## Optional vs nullable

In `@apoyo/decoders`, like in Typescript, we differentiate between `null` and `undefined` types.
As such, if you need to support both, you need to chain both helpers:

```ts
// Decoder<unknown, string | null | undefined>
const myDecoder = pipe(
  TextDecoder.string,
  Decoder.optional,
  Decoder.nullable
)
```

## Example

Let's say your are implementing a HTTP REST API endpoint to create a todo list item.

You would like to validate the POST payload before creating the todo item in database.

Or return an unprocessable entity HTTP error if payload is invalid.

Here's how you can do with Apoyo's decoders:

```typescript
import { DecodeError } from '@apoyo/decoders'
import { pipe, Result } from '@apoyo/std'
import { TodoModel } from './models'

export const handler = async (event: HttpEvent) => {
  // Result is an union between OK and KO result
  const result = pipe(
    event.body, 
    Decoder.validate(TodoPostDto)
  )

  // Use type guard isKo to properly cast result
  if (Result.isKo(result)) {
    // If error result return "Unprocessable entity" and properly format errors with flatten 
    return {
      status: 422,
      body: DecodeError.flatten(result.ko)
    }
  }
  // If payload is valid, save item (result.ok should have the correct type) 
  const saved = await TodoModel.save(result.ok)
  // And return status "Created"
  return {
    status: 201,
    body: saved,
  }
}
```
