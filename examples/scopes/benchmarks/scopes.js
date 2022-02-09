// @ts-check
/* eslint-disable */

const { Scope, Injectable } = require('@apoyo/scopes')
const { pipe } = require('@apoyo/std')
const fs = require('fs')
const { join } = require('path')

const pkg = require('../package.json')

const double = (value) => value * 2

const scope = Scope.create()
const cached = Injectable.of(2)

const range = Array(1_000_000)
  .fill(0)
  .map((_, idx) => idx)

const logs = fs.createWriteStream(join(__dirname, 'benchmarks.log'), {
  encoding: 'utf-8',
  flags: 'a'
})

const write = (msg) => {
  const now = new Date().toISOString()
  logs.write(`[${now}] ${msg}\n`)
}

const benchmark = async (name, fn) => {
  write(`${name} started`)
  const start = Date.now()

  await fn()

  const end = Date.now()
  write(`${name} done: ${end - start} ms`)
}

const main = async () => {

  const version = pkg.dependencies['@apoyo/scopes']

  write(``)
  write(`Starting benchmarks for @apoyo/scopes@${version}`)

  await benchmark('Primitive', async () => {
    for (let item of range) {
      pipe(item, double, double, double, double)
    }
  })

  await benchmark('Promise', async () => {
    for (let item of range) {
      await Promise.resolve(item)
    }
  })

  await benchmark('Injectable cached', async () => {
    for (const _item of range) {
      await scope.get(cached)
    }
  })

  await benchmark('Injectable unreferenced', async () => {
    for (const item of range) {
      await scope.get(Injectable.of(item))
    }
  })

  await benchmark('Scope creation without bindings', async () => {
    for (const item of range) {
      Scope.create({
        bindings: [
          Scope.bind(cached, item),
        ]
      })
    }
  })

  await benchmark('Scope creation with bindings', async () => {
    for (const item of range) {
      Scope.create({
        bindings: [
          Scope.bind(cached, item),
        ]
      })
    }
  })
}

main()
