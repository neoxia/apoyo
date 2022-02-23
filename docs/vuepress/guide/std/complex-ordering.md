# Complex ordering

Sometimes, you will need to order your elements or simply get the biggest or smallest element in your list.
For this kind of use-cases, you will be able to use `Ord`.

## Basic comparators

The `Ord` modules contains basic comparator functions, to compare native Javascript / Typescript types between each other:

- `Ord.string` to compare 2 strings
- `Ord.number` to compare 2 numbers
- `Ord.boolean`
- `Ord.date`
- ...

Example:

```ts
expect(Ord.number(1, 0)).toBe(Ordering.UP) // 1
expect(Ord.number(0, 1)).toBe(Ordering.DOWN) // -1
expect(Ord.number(0, 0)).toBe(Ordering.EQ) // 0
```

## Inverse order

Sometimes, it is necessary to inverse the order. This can be achieved with `Ord.inverse`:

```ts
const numberDesc = pipe(
  Ord.number,
  Ord.inverse
)

const nbs = [2,3,1,4]
const sorted = pipe(nbs, Arr.sort(numberDesc))

expect(sorted).toEqual([4,3,2,1])
```

## Sort objects by a given property

When sorting a list of objects, we will need to use `Ord.contramap`, to transform an `Ord<B>` into an `Ord<A>`:

```ts
// Transform Ord<string> => Ord<Todo>
const ordTodo = pipe(
  Ord.string,
  Ord.contramap((todo: Todo) => todo.title)
)

const todos: Todo[] = [...]
const sorted = pipe(todos, Arr.sort(ordTodo))
```

**Note**: *contramap* is the opposite of *map*:

- In *map*, we transform A into B
- In *contramap*, we start from B and want to obtain A

## Use-cases

### Sorting todos by status and title

```ts
import { Arr, Ord, pipe, run } from '@apoyo/std'

export interface Todo {
  id: string
  title: string
  description?: string
  done: boolean
}

const todos: Todo[] = [
  {
    id: 1,
    title: 'Wake-up',
    done: true
  },
  {
    id: 2,
    title: 'Go to work',
    done: false
  },
  {
    id: 3,
    title: 'Eat some bread',
    done: false
  },
  {
    id: 4,
    title: 'Drink some water',
    done: true
  }
]

// Without `Ord` module

run(() => {
  // Difficult to read / understand
  const ordTodo = (a: Todo, b: Todo) => {
    // Order todos by done ("true" come first)
    if (a.done < b.done) {
      return 1
    }
    if (a.done > b.done) {
      return -1
    }
    // Order todos by title
    if (a.title > b.title) {
      return 1
    }
    if (b.title < b.title) {
      return -1
    }
    return 0
  }

  const sortedTodo = todos.slice().sort(ordTodo)

  return {
    sortedTodo
  }
})

// With `Ord` module

run(() => {
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

  const sortedTodo = pipe(todos, Arr.sort(ordTodo))

  // Other possible actions
  const minTodo = pipe(todos, Arr.min(ordTodo)) // Todo #4 (first element)
  const maxTodo = pipe(todos, Arr.max(ordTodo)) // Todo #2 (last element)

  return {
    sortedTodo,
    minTodo,
    maxTodo
  }
})
```

### Sorting consumers by priority

The goal in this example is to order consumers:

- By latest purchase date (latest come first)
- If no purchase date is specified, by latest email open date

```ts
import { Arr, Ord, pipe, run } from '@apoyo/std'

export interface Consumer {
  lastPurchaseDate?: Date
  lastEmailOpenDate?: Date
  //...
}

const consumers: Consumer[] = []

// Without `Ord`

run(() => {
  // Impossible to read / understand
  // Very easy to introduce errors
  const ordConsumerByPriority = (a: Consumer, b: Consumer) => {
    // Order consumers with latest purchases first
    if (a.lastPurchaseDate && b.lastPurchaseDate) {
      return b.lastPurchaseDate.getTime() - a.lastPurchaseDate.getTime()
    }
    if (a.lastPurchaseDate && !b.lastPurchaseDate) {
      return -1
    }
    if (b.lastPurchaseDate && !a.lastPurchaseDate) {
      return 1
    }
    // Order consumers with latest email open first
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

  const sortedConsumers = consumers.slice().sort(ordConsumerByPriority)

  return {
    sortedConsumers
  }
})

// With `Ord`
// You can also unit test the individual parts easily

run(() => {
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

  const sortedConsumers = pipe(consumers, Arr.sort(ordConsumerByPriority))

  // Other possible actions
  const highPriorityUser = pipe(consumers, Arr.min(ordConsumerByPriority))
  const lowPriorityUser = pipe(consumers, Arr.max(ordConsumerByPriority))

  return {
    sortedConsumers,
    highPriorityUser,
    lowPriorityUser
  }
})

```
