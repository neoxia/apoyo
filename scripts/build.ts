import * as path from 'path'
import * as fs from './fs'
import { run } from './run'

const INCLUDE_REGEXP: string[] = [] // all first level files as submodules: ['.*']
const EXCLUDE_REGEXP: string[] = []
const OUTPUT_FOLDER = 'dist'
const PKG = 'package.json'

export const copyPackageJson = async (): Promise<void> => {
  const content = await fs.readFile(PKG, 'utf-8')
  const json = JSON.parse(content)

  const clone = Object.assign({}, json)

  delete clone.scripts
  delete clone.files
  delete clone.devDependencies

  await fs.writeFile(path.join(OUTPUT_FOLDER, PKG), JSON.stringify(clone, null, 2))
}

export const FILES: ReadonlyArray<string> = ['CHANGELOG.md', 'LICENSE', 'README.md']

export const copyFiles = async (): Promise<void> => {
  for (const from of FILES) {
    await fs.copyFile(from, path.resolve(OUTPUT_FOLDER, from))
  }
}

const includes = INCLUDE_REGEXP.map((r) => new RegExp(r))
const excludes = EXCLUDE_REGEXP.map((r) => new RegExp(r))
const matchRegexps = (module: string) => includes.some((r) => r.test(module)) && excludes.every((r) => !r.test(module))

export const makeModules = async (): Promise<void> => {
  const files = await fs.glob(`${OUTPUT_FOLDER}/lib/*.js`)
  const modules = getModules(files).filter(matchRegexps)

  for (const module of modules) {
    await makeSingleModule(module, module)
  }

  const subindexes = await fs.glob(`${OUTPUT_FOLDER}/lib/*/index.js`)
  const submodules = getModules(subindexes.map((m) => m.replace('/index.js', ''))).filter(matchRegexps)

  for (const module of submodules) {
    await makeSingleModule(module, module + '/index')
  }
}

const getModules = (paths: ReadonlyArray<string>): ReadonlyArray<string> => {
  return paths.map((filePath) => path.basename(filePath, '.js')).filter((x) => x !== 'index')
}

const makeSingleModule = async (module: string, indexPath: string): Promise<void> => {
  await fs.mkdir(path.join(OUTPUT_FOLDER, module))
  const pkg = await makePkgJson(indexPath)
  await fs.writeFile(path.join(OUTPUT_FOLDER, module, 'package.json'), pkg)
}

const makePkgJson = async (indexPath: string) => {
  return JSON.stringify(
    {
      main: `../lib/${indexPath}.js`,
      module: `../es6/${indexPath}.js`,
      typings: `../lib/${indexPath}.d.ts`,
      sideEffects: false
    },
    null,
    2
  )
}

const main = async () => {
  await copyPackageJson()
  await copyFiles()
  await makeModules()
}

run(main)
