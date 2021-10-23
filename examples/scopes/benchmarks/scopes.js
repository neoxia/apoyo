// @ts-check
/* eslint-disable */

const { Scope, Var } = require('@apoyo/scopes')
const { pipe } = require('@apoyo/std')

const double = (value) => value * 2

const scope = pipe(Scope.create(), Scope.get)
const cached = Var.of(2)

const range = Array(1_000_000)
  .fill(0)
  .map((_, idx) => idx)

const benchmark = async (name, fn) => {
  console.log(`${name} started`)
  const start = Date.now()

  await fn()

  const end = Date.now()
  console.log(`${name} done: ${end - start} ms`)
}

const main = async () => {
  await benchmark('Primitive', async () => {
    const res = []
    for (let item of range) {
      res.push(pipe(item, double, double, double, double))
    }
    console.log('res', res.length)
  })

  await benchmark('Promise', async () => {
    const res = []
    for (let item of range) {
      res.push(
        await Promise.resolve(item)
          // .then((i) => (i % 10000 === 0 ? Prom.sleep(100).then(() => i) : i))
          .then(double)
          .then(double)
          .then(double)
          .then(double)
      )
    }
    console.log('res', res.length)
  })

  await benchmark('Var cached', async () => {
    for (const _item of range) {
      await scope.get(cached)
    }
  })

  await benchmark('Var unreferenced', async () => {
    for (const item of range) {
      await scope.get(Var.of(item))
    }
  })
}

main()
