# Complex ordering

Sometimes, you will need to order your elements or simply get the biggest or smallest element in your list.
For this kind of use-cases, you will be able to use `Ord`.

## Native ordering

In native JS/TS, to order or sort multiple elements, you can use a comparator function to compute which elements is greater than the other:

```ts
const ordNumber = (a: number, b: number) => {
  if (a > b) {
    return 1
  }
  if (a < b) {
    return -1
  }
  return 0
}

const sorted = [1,5,3,2,6].sort(ordNumber)
```

However, writing these comparator function can become complicated and error prone really fast:

```ts
interface Todo {
  id: string
  title: string
  description: string
  done: boolean
}

// Difficult to read / understand
const ordTodo = (a: Todo, b: Todo) => {
  if (a.done < b.done) {
    return 1
  }
  if (a.done > b.done) {
    return -1
  }
  if (a.title > b.title) {
    return 1
  }
  if (b.title < b.title) {
    return -1
  }
  return 0
}
```

Especially when writing more complex comparator functions:

```ts
interface Consumer {
  lastPurchaseDate?: Date
  lastEmailOpenDate?: Date
  //...
}

// Impossible to read / understand
const ordConsumerByPriority = (a: Consumer, b: Consumer) => {
  if (a.lastPurchaseDate && b.lastPurchaseDate) {
    return b.lastPurchaseDate.getTime() - a.lastPurchaseDate.getTime()
  }
  if (a.lastPurchaseDate && !b.lastPurchaseDate) {
    return -1
  }
  if (b.lastPurchaseDate && !a.lastPurchaseDate) {
    return 1
  }
  if (a.lastEmailOpenDate && b.lastEmailOpenDate) {
    return b.lastEmailOpenDate.getTime() - a.lastEmailOpenDate.getTime()
  }
  if (a.lastEmailOpenDate && !b.lastEmailOpenDate) {
    return -1
  }
  if (b.lastEmailOpenDate && !a.lastEmailOpenDate) {
    return 1
  }
  return 0
}
```

## Ord module

The `Ord` module exposes utilities to write and compose complicated ordering logic in a readable way.

It contains comparator functions for most primitive types:

```ts
const sorted = [1,5,3,2,6].sort(Ord.number)
```

Or compose them to create more complex comparator functions:

*Todo example*:

```ts
// Order todos by done ("true" come first)
const ordDone = pipe(
  Ord.boolean,
  Ord.inverse,
  Ord.contramap((todo: Todo) => todo.done)
)
// Order todos by title
const ordTitle = pipe(
  Ord.string,
  Ord.contramap((todo: Todo) => todo.title)
)
// Combine both orders
const ordTodo = Ord.concat(ordDone, ordTitle)
```

*Consumer example*:

```ts
// Order consumers with latest purchases first
const ordLastPurchase = pipe(
  Ord.date,
  Ord.inverse,
  Ord.optional,
  Ord.contramap((consumer: Consumer) => consumer.lastPurchaseDate)
)
// Order consumers with latest email open first
const ordLastEmailOpen = pipe(
  Ord.date,
  Ord.inverse,
  Ord.optional,
  Ord.contramap((consumer: Consumer) => consumer.lastEmailOpenDate)
)

// Combine both orders
const ordConsumerByPriority = Ord.concat(ordLastPurchase, ordLastEmailOpen)
```

## Min/max

Comparator functions can be used for more than just sorting. In fact, you can also use them to get the smallest or greatest value in an array:

```ts
const minNumber = pipe(
  [1,5,3,2,6],
  Arr.min(Ord.number)
)

const maxDate = pipe(
  [
    new Date('2000-01-01'),
    new Date('2020-01-01'),
    new Date('2017-01-01')
  ],
  Arr.max(Ord.date)
)
```

These operations are naturally more performant than trying to sort an entire array.
