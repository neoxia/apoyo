# String overview

This namespace contains commonly used utilities for Strings, as well as pipeable versions of already existing String methods.

## Summary

[[toc]]

## Functions

### Str.of

#### Description

Transform value to string

```ts
(value: any) => string
```

### Str.length

#### Description

Return length of the string

```ts
(str: string) => number
```

### Str.isEmpty

#### Description

Predicate to verify if the string is empty or not

```ts
(str: string) => boolean
```

### Str.oneOf

#### Description

Checks if string is one of the given values
This function can also act as a literal string type guard

```ts
<T extends string>(arr: Array<T>): (value: string) => value is T
<T extends string>(arr: Set<T>): (value: string) => value is T
```

#### Example
```ts
const isMouseEvent = Str.oneOf(['click', 'hover', 'focus'] as const)

expect(isMouseEvent('click')).toBe(true)
expect(isMouseEvent('unknown')).toBe(false)
```

### Str.concat

#### Description

Concatenate a second string at the end of the given string

```ts
(append: string) => (str: string) => string
```

### Str.lower

#### Description

Lowercase string

```ts
(str: string) => string
```

#### Example
```
const str = Str.lower('TeST')
expect(str).toBe('test')
```

#### References
- `upper`
- `capitalize`

### Str.upper

#### Description

Uppercase string

```ts
(str: string) => string
```

#### Example
```
const str = Str.upper('TeST')
expect(str).toBe('TEST')
```

#### References
- `lower`
- `capitalize`

### Str.capitalize

#### Description

Capitalize first character of the string, while lowercasing everything else

```ts
(str: string) => string
```

#### Example
```
const str = Str.capitalize('teST')
expect(str).toBe('Test')
```

#### References
- `lower`
- `upper`

### Str.truncate

#### Description

Truncate string by given length

```ts
(maxLength: number, suffix?: string) => (str: string) => string
```

#### Example
```ts
const line = `Lorem quis sit duis cupidatat elit ut fugiat ea enim exercitation.`
const truncated = pipe(line, Str.truncate(20))

expect(truncated).toBe('Lorem quis sit duis ...')
```

### Str.split

#### Description

Split string by given separator.
This function is the pipeable equivalent to the native split function.

```ts
(sep: string) => (str: string) => Array<string>
```

#### Example
```ts
const fileName = pipe(
  'path/to/file.txt',
  Str.split('/'),
  Arr.last
)

expect(fileName).toBe('file.txt')
```

### Str.replace

#### Description

Replace first occurence (or all if a global RegExp has been specified) in a string.
This function is the pipeable equivalent to the native replace function.

```ts
(regexp: string | RegExp, replacer: string | Str.Replacer) => (str: string) => string
```

#### Example
```ts
const str = pipe(
  'Hello John, John',
  Str.replace('John', 'Doe')
)

expect(str).toBe('Hello Doe, John')
```

### Str.replaceAll

#### Description

Replace all occurences in a string.
This function is the pipeable equivalent to the native replaceAll function.

```ts
(regexp: string, replacer: string | Str.Replacer) => (str: string) => string
```

#### Example
```ts
const str = pipe(
  'Hello John, John',
  Str.replaceAll('John', 'Doe')
)

expect(str).toBe('Hello Doe, Doe')
```

### Str.template

#### Description

Simple string templating

This function has been inspired by:
https://github.com/sindresorhus/pupa

```ts
(info: any) => (str: string) => string
```

#### Example
```ts
const message = Str.template(`Hello {name}!`, {
  name: "John"
})
```

### Str.regexpEscape

#### Description

Escape regexp string

This function has been inspired by:
https://github.com/sindresorhus/escape-string-regexp

```ts
(str: string) => string
```

#### Example
```
const escaped = 'How much $ for a 🦄?'
const regexp = new RegExp(escaped)

expect(escaped).toBe('How much \\$ for a 🦄\\?')
```

### Str.htmlEscape

#### Description

Escape HTML sensible characters

This function has been inspired by:
https://github.com/sindresorhus/escape-goat

```ts
(str: string) => string
```

#### Example
```ts
const escaped = Str.htmlEscape(`<script>window.alert("Hello")</script>`)

expect(escaped).toBe('&lt;script&gt;window.alert(&quot;Hello&quot;)&lt;/script&gt;')
```

#### References
- `Str.htmlUnescape`

### Str.htmlUnescape

#### Description

Unescape an HTML escaped string

This function has been inspired by:
https://github.com/sindresorhus/escape-goat

```ts
(str: string) => string
```

#### Example
```ts
const unescaped = Str.htmlUnescape('&lt;script&gt;window.alert(&quot;Hello&quot;)&lt;/script&gt;')

expect(unescaped).toBe(`<script>window.alert("Hello")</script>`)
```

#### References
- `Str.htmlEscape`

### Str.eq

#### Description

Checks if the element is equal to the given string

This function is curryable

```ts
<X, Y>(x: X, y: Y): boolean
<Y>(y: Y): <X>(x: X) => boolean
```

#### Example
```ts
const isSmith = Str.eq('John', 'Smith')

expect(isSmith).toBe(false)

const names = ['John', 'Doe', 'Smith']
const john = pipe(
  names,
  Arr.find(Str.eq('John'))
)

expect(john).toBe('John')

const hasDoe = pipe(
  names,
  Arr.includes(Str.eq('Doe'))
)

expect(hasDoe).toBe(true)
```

#### References
- `Ord.eq` - If you want to compare other types

### Str.isWhitespace

#### Description

Check if the given character is a whitespace character.

```ts
(value: string) => value is string
```

### Str.trimWhile

#### Description

Trim the start and the end of the string until the predicate returns true.

```ts
(fn: (char: string) => boolean) => (str: string) => string
```

#### Example
```ts
const trimmed = pipe(
  '|Hello|World|||',
  Str.trimWhile(Str.eq('|'))
)

expect(trimmed).toBe('Hello|World')
```

#### References
- `Str.trim`

### Str.trim

#### Description

Trims all whitespaces characters at the start and the end of the string.

```ts
(str: string) => string
```

#### Example
```ts
const trimmed = pipe(
  '    Hello  world   ',
  Str.trim
)

expect(trimmed).toBe('Hello  world')
```

#### References
- `Str.trimWhile`

