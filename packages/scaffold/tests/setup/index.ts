import path from 'path'
import rimraf from 'rimraf'
import { EjsTemplateEngine, LocalFileSystem, Scaffolder } from '../../src'

const templatesPath = path.resolve(__dirname, '../templates')
const destinationPath = path.resolve(__dirname, '../dist')

export const scaffolder = new Scaffolder({
  renderer: new EjsTemplateEngine(),
  templates: new LocalFileSystem({
    rootDir: templatesPath
  }),
  destination: new LocalFileSystem({
    rootDir: destinationPath
  })
})

export const clear = async () => {
  return new Promise<void>((resolve, reject) => {
    rimraf(destinationPath, (err) => (err ? reject(err) : resolve()))
  })
}
