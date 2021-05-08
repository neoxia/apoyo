# Apoyo - Decoders

[![npm version](https://badgen.net/npm/v/@apoyo/decoders)](https://www.npmjs.com/package/@apoyo/decoders)
[![build size](https://badgen.net/bundlephobia/min/@apoyo/decoders)](https://bundlephobia.com/result?p=@apoyo/decoders)
[![three shaking](https://badgen.net/bundlephobia/tree-shaking/@apoyo/decoders)](https://bundlephobia.com/result?p=@apoyo/decoders)

**Warning**: This package is still in development and features may still change, be renamed or removed.

However, we would appreciate any feedback you have on how to improve this library:

- Which features are missing?
- Which features are hard to understand or unnecessary?
- Which features need to be improved?

## Installation

**Warning**: This package has not been deployed to NPM yet.

`npm install @apoyo/decoders`

## Usage

```ts
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

const TodoDto = ObjectDecoder.struct({
  id: TextDecoder.string,
  email: TextDecoder.email,
  name: pipe(TextDecoder.varchar(1, 100), Decoder.nullable),
  dob: pipe(DateDecoder.date, Decoder.parse(validateAge), Decoder.nullable),
  age: IntegerDecoder.range(0, 120),
  title: TextDecoder.varchar(1, 100),
  done: pipe(BooleanDecoder.boolean),
  description: pipe(TextDecoder.varchar(0, 2000), TextDecoder.nullable),
  createdAt: DateDecoder.datetime,
  updatedAt: DateDecoder.datetime
})

const TodoPostDto = pipe(TodoDto, ObjectDecoder.omit(['id']))
const TodoPutDto = pipe(TodoDto, ObjectDecoder.partial, ObjectDecoder.omit(['id']))

interface TodoDto extends Decoder.TypeOf<typeof TodoDto> {}
interface TodoPostDto extends Decoder.TypeOf<typeof TodoPostDto> {}
interface TodoPutDto extends Decoder.TypeOf<typeof TodoPutDto> {}

```
