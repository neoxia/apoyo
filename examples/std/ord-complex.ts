import { Arr, Ord, pipe, run } from '@apoyo/std'

export interface Consumer {
  lastPurchaseDate?: Date
  lastEmailOpenDate?: Date
  //...
}

const consumers: Consumer[] = []

// Before

run(() => {
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

  const sortedConsumers = consumers.slice().sort(ordConsumerByPriority)

  return {
    sortedConsumers
  }
})

// After

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

// The goal is to order consumers:
// - by latest purchase date (latest come first)
// - if no purchase date is specified, by latest email open date
