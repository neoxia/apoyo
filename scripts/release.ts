import { run } from './run'
import * as child_process from 'child_process'

const DIST = 'dist'

const exec = async (cmd: string, args?: child_process.ExecOptions): Promise<void> =>
  new Promise((resolve, reject) => {
    child_process.exec(cmd, args, (err) => (err ? reject(err) : resolve()))
  })

export const main = async () => {
  await exec('npm publish', {
    cwd: DIST
  })
}

run(main)
