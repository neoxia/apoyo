import { Scope } from '@apoyo/scopes'

import { $server } from './bootstrap/server'
import { Process } from './utils/process'

async function main() {
  const scope = Scope.create()

  try {
    console.log('Bootstrap application...')
    await scope.get($server)
    console.log('Application started')
    await Process.end()
  } catch (err) {
    console.error(`An internal error occured`, err)
  } finally {
    console.log('Shutdown application...')
    await scope.close()
    console.log('Application gracefully exited')
  }
}

main()
