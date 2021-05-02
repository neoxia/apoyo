import { pipe, Str } from '../src'

describe('String.length', () => {
  it('should return expected length', () => {
    expect(pipe('Hello', Str.length)).toBe(5)
  })
})

describe('String.lower', () => {
  it('should return expected results', () => {
    expect(pipe('HellO', Str.lower)).toBe('hello')
  })
})

describe('String.upper', () => {
  it('should return expected results', () => {
    expect(pipe('HellO', Str.upper)).toBe('HELLO')
  })
})

describe('String.capitalize', () => {
  it('should return expected results', () => {
    expect(pipe('HelLO', Str.capitalize)).toBe('Hello')
  })
})

describe('String.truncate', () => {
  const line = `Lorem quis sit duis cupidatat elit ut fugiat ea enim exercitation.`
  const beginning = `Lorem quis sit duis `

  it('should return expected results', () => {
    expect(pipe(line, Str.truncate(20))).toBe(beginning + '...')
  })

  it('should add given suffix', () => {
    expect(pipe(line, Str.truncate(20, '... (truncated)'))).toBe(beginning + '... (truncated)')
  })

  it('should do nothing when string under max length', () => {
    expect(pipe('Hello world', Str.truncate(80, '... (truncated)'))).toBe('Hello world')
  })
})

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

  it('should escape html on double braces', () => {
    expect(pipe(`Hello {{name}}`, Str.template({ name: '<b>John</b>' }))).toBe('Hello &lt;b&gt;John&lt;/b&gt;')
  })

  it('should not replace non-valid js identifiers', () => {
    const str = '"*.{json,md,css,graphql,html}"'
    expect(pipe(str, Str.template({}))).toBe(str)
  })
})

describe('String.replace', () => {
  it('should return expected result', () => {
    expect(pipe('Hello world', Str.replace(/o/g, 'a'))).toBe('Hella warld')
  })
})

describe('String.regexpEscape', () => {
  it('should escape regexp sensible characters', () => {
    const str = Str.regexpEscape('\\ ^ $ * + ? . ( ) | { } [ ]')
    const expected = '\\\\ \\^ \\$ \\* \\+ \\? \\. \\( \\) \\| \\{ \\} \\[ \\]'
    expect(str).toBe(expected)
  })

  it('should escape `-` in a way compatible with PCRE', () => {
    const str = Str.regexpEscape('foo - bar')
    const expected = 'foo \\x2d bar'
    expect(str).toBe(expected)
  })

  it('should escape `-` in a way compatible with the Unicode flag', () => {
    const str = Str.regexpEscape('-')
    const reg = new RegExp(str, 'u')
    expect(reg.test('John-Smith')).toBe(true)
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

describe('String.trim', () => {
  it('should trim space characters at the start and at the end of the string', () => {
    const result = pipe('    \n \r \t    Hello \n world      ', Str.trim)
    expect(result).toBe('Hello \n world')
  })

  it('should return the original string if unmodified', () => {
    const str = 'Hello \n world'
    const result = pipe(str, Str.trim)
    expect(result).toBe(str)
  })
})
