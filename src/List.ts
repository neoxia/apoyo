import { Option } from './Option'

type Node<A> = {
  next?: Node<A>
  prev?: Node<A>
  value: A
}

export type List<A> = {
  head?: Node<A>
  last?: Node<A>
  length: number
}

export const init = <A>(): List<A> => ({
  length: 0
})

export const map = <A, B>(fn: (value: A) => B) => (list: List<A>): List<B> => {
  const lb: List<B> = init()
  let elem: Option<Node<A>> = list.head
  while (elem) {
    push(lb, fn(elem.value))
    elem = elem.next
  }
  return lb
}

export const unshift = <A>(queue: List<A>, value: A) => {
  const head = queue.head
  const item: Node<A> = {
    next: head,
    prev: undefined,
    value
  }
  if (head) {
    head.prev = item
  }
  if (!queue.last) {
    queue.last = item
  }
  queue.head = item
  queue.length++
}

export const push = <A>(queue: List<A>, value: A) => {
  const last = queue.last
  const item: Node<A> = {
    next: undefined,
    prev: last,
    value
  }
  if (last) {
    last.next = item
  }
  if (!queue.head) {
    queue.head = item
  }
  queue.last = item
  queue.length++
}

export const shift = <A>(queue: List<A>): A | undefined => {
  const head = queue.head
  if (head) {
    queue.head = head.next
    queue.length--
  }
  if (queue.last === head) {
    queue.last = undefined
  }
  return head && head.value
}

export const pop = <A>(queue: List<A>): A | undefined => {
  const last = queue.last
  if (last) {
    queue.last = last.prev
    queue.length--
  }
  if (queue.head === last) {
    queue.head = undefined
  }
  return last && last.value
}

export const fromArray = <A>(arr: Array<A>) => {
  const queue: List<A> = init()
  for (let i = 0; i < arr.length; ++i) {
    push(queue, arr[i])
  }
  return queue
}

export const toArray = <A>(list: List<A>) => {
  const arr: Array<A> = []
  let elem: Option<Node<A>> = list.head
  while (elem) {
    arr.push(elem.value)
    elem = elem.next
  }
  return arr
}

export const List = {
  init,
  map,
  fromArray,
  toArray,
  unshift,
  shift,
  push,
  pop
}
