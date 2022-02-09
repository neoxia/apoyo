import { Scope, Injectable } from '@apoyo/scopes'
import { pipe } from '@apoyo/std'

import { API } from './api'
import { Process } from './process'

const Main = pipe(
  Injectable.sequence([API]),
  Injectable.map(async () => {
    await Process.end()
    console.log('Shutdown application...')
  })
)

Scope.run(Main).catch((err) => {
  console.error(`An internal error occured`, err)
})
