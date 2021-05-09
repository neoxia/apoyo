import { pipe, Result } from '@apoyo/std'
import { ArrayDecoder, DecodeError, Decoder, NumberDecoder, ObjectDecoder, TextDecoder } from '../src'

describe('Decoder.map', () => {
  const flooredNumber = pipe(NumberDecoder.number, Decoder.map(Math.floor))

  it('should succeed', () => {
    const res = pipe(flooredNumber(42.2531726), Result.get)
    expect(res).toBe(42)
  })
})

describe('Decoder.parse', () => {
  /**
   * **Note**: This function already exists
   *
   * @see `NumberDecoder.fromString`
   */
  const numberFromString = pipe(
    TextDecoder.string,
    Decoder.parse((x) => {
      const nb = parseFloat(x)
      return Number.isNaN(nb) ? Result.ko(DecodeError.value(x, `Could not parse string to number`)) : Result.ok(nb)
    })
  )

  it('should succeed', () => {
    const res = pipe(numberFromString('42'), Result.get)
    expect(res).toBe(42)
  })
})

describe('Decoder.filter', () => {
  const decoder = pipe(
    TextDecoder.string,
    Decoder.filter((x) => x.length > 0, `string should have 1 or more characters`, { minLength: 1 })
  )

  it('should succeed', () => {
    expect(pipe(decoder('42'), Result.isOk)).toBe(true)
  })
  it('should fail', () => {
    expect(pipe(decoder(''), Result.isKo)).toBe(true)
  })
})

describe('Decode.reject', () => {
  const decoder = pipe(
    TextDecoder.string,
    Decoder.reject((x) => x.length === 0, `string should not be empty`)
  )

  it('should succeed', () => {
    expect(pipe(decoder('42'), Result.isOk)).toBe(true)
  })
  it('should fail', () => {
    expect(pipe(decoder(''), Result.isKo)).toBe(true)
  })
})

describe('Decoder.optional', () => {
  it('should succeed', () => {
    expect(pipe(42, Decoder.optional(NumberDecoder.number), Result.isOk)).toBe(true)
    expect(pipe(undefined, Decoder.optional(NumberDecoder.number), Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe(null, Decoder.optional(NumberDecoder.number), Result.isKo)).toBe(true)
    expect(pipe(undefined, NumberDecoder.number, Result.isKo)).toBe(true)
  })
})

describe('Decoder.nullable', () => {
  it('should succeed', () => {
    expect(pipe(42, NumberDecoder.number, Result.isOk)).toBe(true)
    expect(pipe(null, Decoder.nullable(NumberDecoder.number), Result.isOk)).toBe(true)
  })

  it('should fail', () => {
    expect(pipe(null, NumberDecoder.number, Result.isKo)).toBe(true)
    expect(pipe(undefined, Decoder.nullable(NumberDecoder.number), Result.isKo)).toBe(true)
  })
})

describe('Decoder.lazy', () => {
  interface Tree<T> {
    value: T
    forest: Tree<T>[]
  }

  // Way 1
  // recursives types require manual typing
  const decodeStringTree1: Decoder<unknown, Tree<string>> = ObjectDecoder.struct({
    value: TextDecoder.string,
    forest: Decoder.lazy(() => ArrayDecoder.array(decodeStringTree1))
  })

  // Way 2
  // recursives types require manual typing
  const decodeStringTree2: Decoder<unknown, Tree<string>> = Decoder.lazy(() =>
    ObjectDecoder.struct({
      value: TextDecoder.string,
      forest: ArrayDecoder.array(decodeStringTree2)
    })
  )

  const decodeGenericTree = <O>(decoder: Decoder<unknown, O>): Decoder<unknown, Tree<O>> =>
    Decoder.lazy(() =>
      ObjectDecoder.struct({
        value: decoder,
        forest: ArrayDecoder.array(decodeGenericTree(decoder))
      })
    )

  const t: Tree<string> = {
    value: 'test',
    forest: [
      { value: 'foo', forest: [] },
      { value: 'bar', forest: [{ value: 'bar.foo', forest: [] }] }
    ]
  }

  it('should work', () => {
    expect(pipe(t, decodeStringTree1, Result.isOk)).toBe(true)
    expect(pipe(t, decodeStringTree2, Result.isOk)).toBe(true)
  })

  it('should work with generic types', () => {
    expect(pipe(t, decodeGenericTree(TextDecoder.string), Result.isOk)).toBe(true)
  })
})

describe('Decode.union', () => {
  const stringOrNumber = Decoder.union(NumberDecoder.fromString, NumberDecoder.number, TextDecoder.string)

  it('should succeed', () => {
    expect(pipe(stringOrNumber('42'), Result.get)).toBe(42)
    expect(pipe(stringOrNumber(42), Result.get)).toBe(42)
    expect(pipe(stringOrNumber('string'), Result.get)).toBe('string')
  })

  it('should fail', () => {
    const res = pipe(stringOrNumber(false), Result.isKo)
    expect(res).toBe(true)
  })
})