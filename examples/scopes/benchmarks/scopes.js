// @ts-check
/* eslint-disable */

const Benchmark = require('benchmark')
const { Scope, Var } = require('@apoyo/scopes')
const { pipe } = require('@apoyo/std')

const suite = new Benchmark.Suite()

const scope = pipe(Scope.create(), Scope.get)

const cached = Var.of({
  value: 2
})

suite
  .add('Primitive', () => {
    return {
      value: 2
    }
  })
  .add('Promise', () => {
    return Promise.resolve({
      value: 2
    })
  })
  .add('Var cached', () => {
    return scope.get(cached)
  })
  .add('Var unreferenced', () => {
    return scope.get(
      Var.of({
        value: 2
      })
    )
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
