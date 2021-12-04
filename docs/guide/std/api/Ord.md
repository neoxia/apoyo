# Ord overview

This namespace contains utilities to create simple or more complex ordering / sorting functions.

These `Ord` functions can be used for a multitude of use-cases:

## Summary

[[toc]]

## Types

### Ord

```ts
type Ord<A> = {
  name: string
  (a: A, b: A): Ordering
}
```

### Ordering

#### Description

A constant enum for possible `Ord` results

```ts
const enum Ordering {
  UP = 1,
  DOWN = -1,
  EQ = 0
}
```

#### Example
```ts
expect(Ord.number(1, 0)).toBe(Ordering.UP)
expect(Ord.number(0, 1)).toBe(Ordering.DOWN)
expect(Ord.number(0, 0)).toBe(Ordering.EQ)
```

## Functions

### Ord.string

#### Description

Order strings

```ts
Ord<string>
```

### Ord.number

#### Description

Order numbers

```ts
Ord<number>
```

### Ord.boolean

#### Description

Order booleans.

The value `false` comes first.

```ts
Ord<boolean>
```

### Ord.date

#### Description

Order date object.

This function does not check if the date is valid

```ts
Ord<Date>
```

### Ord.contramap

#### Description

Create an order function for a custom type or object

```ts
<A, B>(fn: (value: A) => B) => (ord: Ord<B>) => Ord<A>
```

#### Example
```ts
const ordTodo = pipe(
  Ord.string,
  Ord.contramap((todo: Todo) => todo.title)
)
```

### Ord.inverse

#### Description

Inverse the order function

```ts
<A>(ord: Ord<A>) => Ord<A>
```

#### Example
```ts
const numberDesc = pipe(
  Ord.number,
  Ord.inverse
)

const nbs = pipe(
  [1,3,2,4],
  Arr.sort(numberDesc)
)

expect(nbs).toEqual([4,3,2,1])
```

### Ord.optional

#### Description

Allow the ordering function to take optional (undefined) values.

Undefined values are placed last.

```ts
<A>(ord: Ord<A>) => Ord<Option<A>>
```

#### Example
```ts
const optionalNb = pipe(
  Ord.number,
  Ord.optional
)

const nbs = pipe(
  [1,3,undefined,2],
  Arr.sort(optionalNb)
)

expect(nbs).toEqual([1,2,3,undefined])
```

#### References
- `Ord.nullable` for nullable values

### Ord.nullable

#### Description

Allow the ordering function to take nullable values.

Nullable values are placed last.

```ts
<A>(ord: Ord<A>) => Ord<A | null>
```

#### Example
```ts
const optionalNb = pipe(
  Ord.number,
  Ord.nullable
)

const nbs = pipe(
  [1,3,null,2],
  Arr.sort(optionalNb)
)

expect(nbs).toEqual([1,2,3,null])
```

#### References
- `Ord.optional` for optional (undefined) values

### Ord.concat

#### Description

Combine multiple `Ord`s.

The first `Ord` is executed first.
If the elements are equal, the second `Ord` is executed, and so forth...

```ts
<A>(ords_0: Ord<A>): Ord<A>
<A, B>(ords_0: Ord<A>, ords_1: Ord<B>): Ord<A & B>
<A, B, C>(ords_0: Ord<A>, ords_1: Ord<B>, ords_2: Ord<C>): Ord<A & B & C>
<A, B, C, D>(ords_0: Ord<A>, ords_1: Ord<B>, ords_2: Ord<C>, ords_3: Ord<D>): Ord<A & B & C & D>
<A, B, C, D, E>(ords_0: Ord<A>, ords_1: Ord<B>, ords_2: Ord<C>, ords_3: Ord<D>, ords_4: Ord<E>): Ord<A & B & C & D & E>
<A, B, C, D, E, F>(ords_0: Ord<A>, ords_1: Ord<B>, ords_2: Ord<C>, ords_3: Ord<D>, ords_4: Ord<E>, ords_5: Ord<F>): Ord<A & B & C & D & E & F>
```

#### Example
```ts
const ordDone = pipe(
  Ord.boolean,
  Ord.contramap((todo: Todo) => todo.done)
)
const ordName = pipe(
  Ord.string,
  Ord.contramap((todo: Todo) => todo.name)
)

// Order first by "done", then by "name"
const ordTodo = Ord.concat(ordDone, ordName)

const todos = pipe(
  todos,
  Arr.sort(ordTodo)
)
```

### Ord.eq

#### Description

Create "equals" comparator from `Ord`

```ts
<A>(ord: Ord<A>) =>     <X extends A, Y extends A>(x: X, y: Y): boolean
<Y extends A>(y: Y): <X extends A>(x: X) => boolean
```

#### Example
```ts
const eqName = pipe(
  Ord.string,
  Ord.contramap((todo: Todo) => todo.name),
  Ord.eq
)

// Find todo with the name "Buy bread"
const todo = todos.find(eqName("Buy bread"))
```

### Ord.lt

#### Description

Create "lower than" comparator from `Ord`

```ts
<A>(ord: Ord<A>) =>     <X extends A, Y extends A>(x: X, y: Y): boolean
<Y extends A>(y: Y): <X extends A>(x: X) => boolean
```

#### Example
```ts
const ltNumber = pipe(
  Ord.number,
  Ord.lt
)

// Only retain numbers under 4
const nbs = [1,3,6,2,4].filter(ltNumber(4))

expect(nbs).toEqual([1,3,2])
```

#### References
- `Ord.lte` for "lower than equals"
- `Ord.gt` for "greater than"
- `Ord.gte` for "greater than equals"

### Ord.lte

#### Description

Create "lower than equals" comparator from `Ord`

```ts
<A>(ord: Ord<A>) =>     <X extends A, Y extends A>(x: X, y: Y): boolean
<Y extends A>(y: Y): <X extends A>(x: X) => boolean
```

#### Example
```ts
const lteNumber = pipe(
  Ord.number,
  Ord.lte
)

// Only retain numbers under or equals to 4
const nbs = [1,3,6,2,4].filter(lteNumber(4))

expect(nbs).toEqual([1,3,2,4])
```

#### References
- `Ord.lt` for "lower than"
- `Ord.gt` for "greater than"
- `Ord.gte` for "greater than equals"

### Ord.gt

#### Description

Create "greater than" comparator from `Ord`

```ts
<A>(ord: Ord<A>) =>     <X extends A, Y extends A>(x: X, y: Y): boolean
<Y extends A>(y: Y): <X extends A>(x: X) => boolean
```

#### Example
```ts
const gtNumber = pipe(
  Ord.number,
  Ord.gt
)

// Only retain numbers greater than 4
const nbs = [1,3,6,2,4].filter(gtNumber(4))

expect(nbs).toEqual([6])
```

#### References
- `Ord.lt` for "lower than"
- `Ord.lte` for "lower than equals"
- `Ord.gte` for "greater than equals"

### Ord.gte

#### Description

Create "greater than equals" comparator from `Ord`

```ts
<A>(ord: Ord<A>) =>     <X extends A, Y extends A>(x: X, y: Y): boolean
<Y extends A>(y: Y): <X extends A>(x: X) => boolean
```

#### Example
```ts
const gteNumber = pipe(
  Ord.number,
  Ord.gte
)

// Only retain numbers greater or equals to 4
const nbs = [1,3,6,2,4].filter(gteNumber(4))

expect(nbs).toEqual([6,4])
```

#### References
- `Ord.lt` for "lower than"
- `Ord.lte` for "lower than equals"
- `Ord.gt` for "greater than"

### Ord.min

#### Description

Create a function which returns the smallest element from an `Ord`

```ts
<A>(ord: Ord<A>) =>     <X extends A, Y extends A>(x: X, y: Y): X | Y
<Y extends A>(y: Y): <X extends A>(x: X) => Y | X
```

#### Example
```ts
const minDate = pipe(
  Ord.date,
  Ord.min
)

const date = minDate(new Date('2020'), new Date('2021'))

expect(date).toBe(new Date('2020'))
```

#### References
- `Ord.max`

### Ord.max

#### Description

Create a function which returns the greatest element from an `Ord`

```ts
<A>(ord: Ord<A>) =>     <X extends A, Y extends A>(x: X, y: Y): X | Y
<Y extends A>(y: Y): <X extends A>(x: X) => Y | X
```

#### Example
```ts
const maxDate = pipe(
  Ord.date,
  Ord.max
)

const date = maxDate(new Date('2020'), new Date('2021'))

expect(date).toBe(new Date('2021'))
```

#### References
- `Ord.min`

