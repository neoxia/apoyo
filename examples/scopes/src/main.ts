import { Scope } from '@apoyo/scopes'
import { $server } from './http/server'
import { Process } from './utils/process'

async function main() {
  const scope = Scope.create()

  try {
    await scope.get($server)
    console.log('Application started')
    await Process.end()
  } catch (err) {
    console.error(`An internal error occured`, err)
  } finally {
    await scope.close()
    console.log('Shutdown application...')
  }
}

main()
