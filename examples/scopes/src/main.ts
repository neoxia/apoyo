import { Scope, Var } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'

import { API } from './api'
import { Process } from './process'

const Main = pipe(
  Var.inject(API),
  Var.map(async () => {
    await Process.end()
  }),
  Var.closeWith(() => {
    console.log('Shutdown application...')
  })
)

pipe(Scope.create(), Scope.run(Main)).catch((err) => {
  console.error(`An internal error occured`, err)
})
