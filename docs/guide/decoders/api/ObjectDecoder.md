# ObjectDecoder overview

This namespace contains object decoders and additional utilities for object validations.

## Summary

[[toc]]

## Functions

### ObjectDecoder.dict

#### Description

Check if the input is an record, where all properties are of the given type.

```ts
<A>(decoder: Decoder<unknown, A>) => Decoder<unknown, Dict<A>>
```

### ObjectDecoder.struct

#### Description

Check if the input is an object, where all object properties match the given decoders.
All extraenous properties will be skipped and ignored.

```ts
<A extends Dict<any>>(props: Struct<A>, name?: string | undefined) => ObjectDecoder<unknown, A>
```

#### Example
```ts
const TodoDto = ObjectDecoder.struct({
  id: IntegerDecoder.positive,
  title: TextDecoder.varchar(1, 100),
  done: BooleanDecoder.boolean
})

const input: unknown = {
  id: 0,
  title: 'Wake up',
  description: 'Some description', // This property is not recognized by the decoder and will be ignored.
  done: false
}

expect(pipe(input, Decoder.validate(TodoDto), Result.isOk)).toBe(true)
expect(pipe(input, Decoder.validate(TodoDto), Result.get)).toEqual({
  id: 0,
  title: 'Wake up',
  done: false
})
```

### ObjectDecoder.omit

#### Description

Omit given properties from an `ObjectDecoder`.
The resulting `ObjectDecoder` will not contain the omitted properties.

```ts
<I, O extends Dict<any>, B extends keyof O>(props: Array<B>) => (decoder: ObjectDecoder<I, O>) => ObjectDecoder<I, Omit<O, B>>
```

#### Example
```ts
const TodoPostDto = pipe(TodoDto, ObjectDecoder.omit(['id']))

const input: unknown = {
  id: 0, // This property has been omitted and will be ignored.
  title: 'Wake up',
  done: false
}

expect(pipe(input, Decoder.validate(TodoPostDto), Result.isOk)).toBe(true)
expect(pipe(input, Decoder.validate(TodoPostDto), Result.get)).toEqual({
  title: 'Wake up',
  done: false
})
```

### ObjectDecoder.pick

#### Description

Pick given properties from an `ObjectDecoder`.
The resulting `ObjectDecoder` will only contain the picked properties.

```ts
<I, O extends Dict<any>, B extends keyof O>(props: Array<B>) => (decoder: ObjectDecoder<I, O>) => ObjectDecoder<I, Pick<O, B>>
```

#### Example
```ts
const TodoPostDto = pipe(TodoDto, ObjectDecoder.pick(['title', 'done']))

const input: unknown = {
  id: 0, // This property has not been picked and will be ignored.
  title: 'Wake up',
  done: false
}

expect(pipe(input, Decoder.validate(TodoPostDto), Result.isOk)).toBe(true)
expect(pipe(input, Decoder.validate(TodoPostDto), Result.get)).toEqual({
  title: 'Wake up',
  done: false
})
```

### ObjectDecoder.partial

#### Description

Make all properties of an `ObjectDecoder` optional.

```ts
<I, O extends Dict<any>>(decoder: ObjectDecoder<I, O>) => ObjectDecoder<I, Partial<O>>
```

### ObjectDecoder.guard

#### Description

Add a custom validation function to the `ObjectDecoder`.

```ts
<I, O extends Dict<any>>(fn: (input: O) => Option<DecodeError.Value | DecodeError.ObjectLike>) => (decoder: ObjectDecoder<I, O>) => ObjectDecoder<I, O>
```

#### Example
```ts
const SignupDto = pipe(
  ObjectDecoder.struct({
    email: TextDecoder.email,
    password: TextDecoder.varchar(5, 50),
    passwordRepeat: TextDecoder.varchar(5, 50)
  }),
  ObjectDecoder.guard(user => {
    return user.password === user.passwordRepeat
      ? undefined
      : DecodeError.object([
        DecodeError.key('passwordRepeat', DecodeError.value(user.passwordRepeat, `Password does not match password confirmation`))
      ])
  })
)

const input: unknown = {
  email: 'test@example.com',
  password: '12345',
  passwordRepeat: '12345'
}

expect(pipe(input, Decoder.validate(SignupDto), Result.isKo)).toBe(true)
```

### ObjectDecoder.merge

#### Description

Merge multiple `ObjectDecoder`s.
If a property has already been declared, the decoder for this property will be overwritten.

```ts
<I, O1 extends Dict<any>>(a: ObjectDecoder<I, O1>): ObjectDecoder<I, O1>
<I, O1 extends Dict<any>, O2 extends Dict<any>>(a: ObjectDecoder<I, O1>, b: ObjectDecoder<I, O2>): ObjectDecoder<I, O2 & Omit<O1, keyof O2>>
<I, O1 extends Dict<any>, O2 extends Dict<any>, O3 extends Dict<any>>(a: ObjectDecoder<I, O1>, b: ObjectDecoder<I, O2>, c: ObjectDecoder<I, O3>): ObjectDecoder<I, O3 & Omit<O2, keyof O3> & Omit<O1, keyof O3 | keyof O2>>
<I, O1 extends Dict<any>, O2 extends Dict<any>, O3 extends Dict<any>, O4 extends Dict<any>>(a: ObjectDecoder<I, O1>, b: ObjectDecoder<I, O2>, c: ObjectDecoder<I, O3>, d: ObjectDecoder<I, O4>): ObjectDecoder<I, O4 & Omit<O3, keyof O4> & Omit<O2, keyof O4 | keyof O3> & Omit<O1, keyof O4 | keyof O3 | keyof O2>>
```

#### Example
```ts
const A = ObjectDecoder.struct({
  a: TextDecoder.string,
  ab: TextDecoder.string
})
const B = ObjectDecoder.struct({
  ab: NumberDecoder.number,
  b: NumberDecoder.number
})
const C = ObjectDecoder.merge(A, B)

interface C extends Decoder.TypeOf<typeof C> {}

// Interface C is now equals to:
type C = {
  a: string
  ab: number
  b: number
}

// Note that "ab: TextDecoder.string" has been overwritten and will not be executed
```

### ObjectDecoder.additionalProperties

#### Description

By default, `ObjectDecoder.struct` will skip and ignore extra properties.
If you wish to keep extra properties (all properties not validated by the struct), you can use this util.

```ts
<I, O extends Dict<any>>(decoder: ObjectDecoder<I, O>) => Decoder<I, O & Dict<any>>
```

#### Example
```ts
const Response = pipe(
  ObjectDecoder.struct({
    status: EnumDecoder.literal('OK', 'KO'),
    message: TextDecoder.string,
  }),
  ObjectDecoder.additionalProperties
)
```

### ObjectDecoder.sum

#### Description

Execute a specific decoder depending on the value of a given "type" property.

```ts
<K extends string, I, T extends Dict<ObjectDecoder<I, any>>>(prop: K, cases: T) => Decoder<I, SumTypes<K, T>>
```

#### Example
```ts
const Geom = ObjectDecoder.sum('type', {
  Circle: struct({
    radius: NumberDecoder.number
  }),
  Rectangle: struct({
    width: NumberDecoder.number,
    height: NumberDecoder.number
  })
})

type Geom = Decoder.TypeOf<typeof Geom>
const geom: Geom = {
  type: 'Rectangle',
  height: 5
}
```

