import { pipe, Str } from '../src'

describe('String.template', () => {
  it('should resolve variable', () => {
    expect(pipe(`Hello {name}`, Str.template({ name: 'John' }))).toBe('Hello John')
  })

  it('should resolve multiple variables', () => {
    expect(pipe(`Hello {firstName} {lastName}`, Str.template({ firstName: 'John', lastName: 'Doe' }))).toBe(
      'Hello John Doe'
    )
  })

  it('should resolve sub-object variables', () => {
    expect(pipe(`Hello {user.name}`, Str.template({ user: { name: 'John' } }))).toBe('Hello John')
  })
})

describe('String.replace', () => {
  it('should return expected result', () => {
    expect(pipe('Hello world', Str.replace(/o/g, 'a'))).toBe('Hella warld')
  })
})

describe('String.htmlEscape', () => {
  it('should escape html characters', () => {
    expect(pipe(`Hello <b>John</b>`, Str.htmlEscape)).toBe('Hello &lt;b&gt;John&lt;/b&gt;')
  })

  it('should escape quotes', () => {
    expect(pipe(`Hello "John"`, Str.htmlEscape)).toBe('Hello &quot;John&quot;')
  })
})

describe('String.htmlUnescape', () => {
  it('should unescape html characters', () => {
    const from = 'Hello &lt;b&gt;John&lt;/b&gt;'
    const to = `Hello <b>John</b>`
    expect(pipe(from, Str.htmlUnescape)).toBe(to)
  })

  it('should unescape quotes', () => {
    const from = 'Hello &quot;John&quot;'
    const to = `Hello "John"`
    expect(pipe(from, Str.htmlUnescape)).toBe(to)
  })
})
