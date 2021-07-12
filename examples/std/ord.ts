import { Arr, Ord, pipe, run } from '@apoyo/std'

export interface Todo {
  id: string
  title: string
  description: string
  done: boolean
}

const todos: Todo[] = []

// Before

run(() => {
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

  const sortedTodo = todos.slice().sort(ordTodo)

  return {
    sortedTodo
  }
})

// After

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
  const minTodo = pipe(todos, Arr.min(ordTodo))
  const maxTodo = pipe(todos, Arr.max(ordTodo))

  return {
    sortedTodo,
    minTodo,
    maxTodo
  }
})
