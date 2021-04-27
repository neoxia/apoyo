import path from 'path'
import { Project, ProjectOptions } from 'ts-morph'

import { Arr, Err, pipe, Result } from '../src'
import { markdownObject } from './docs/markdown'
import { getObjectOrThrow, getType } from './docs/parse-ts'
import { run } from './run'

export const main = async () => {
  const rootPath = path.resolve(__dirname, '..')
  const docsPath = path.join(rootPath, `docs/guide/namespaces`)

  const config: ProjectOptions = {
    tsConfigFilePath: path.join(rootPath, 'tsconfig.json')
  }
  const project = pipe(
    Result.tryCatch(() => new Project(config)),
    Result.mapError(Err.chain('Could not initialize TS project')),
    Result.get
  )

  project.addSourceFilesAtPaths(path.join(rootPath, 'src/**/*.ts'))

  const files = {
    array: project.getSourceFileOrThrow('Array.ts'),
    dict: project.getSourceFileOrThrow('Dict.ts'),
    result: project.getSourceFileOrThrow('Result.ts'),
    prom: project.getSourceFileOrThrow('Promise.ts'),
    task: project.getSourceFileOrThrow('Task.ts'),
    ord: project.getSourceFileOrThrow('Ord.ts'),
    string: project.getSourceFileOrThrow('String.ts'),
    option: project.getSourceFileOrThrow('Option.ts'),
    enum: project.getSourceFileOrThrow('Enum.ts'),
    err: project.getSourceFileOrThrow('Err.ts'),
    tree: project.getSourceFileOrThrow('Tree.ts'),
    io: project.getSourceFileOrThrow('IO.ts')
  }

  await markdownObject({
    object: getObjectOrThrow(files.array, 'Arr'),
    title: 'Array overview',
    path: path.join(docsPath, 'Array.md')
  })

  await markdownObject({
    object: getObjectOrThrow(files.dict, 'Dict'),
    title: 'Dictionnary overview',
    path: path.join(docsPath, 'Dict.md'),
    additionals: {
      types: Arr.compact([getType(files.dict, 'Dict')])
    }
  })

  await markdownObject({
    object: getObjectOrThrow(files.result, 'Result'),
    title: 'Result overview',
    path: path.join(docsPath, 'Result.md'),
    additionals: {
      types: Arr.compact([getType(files.result, 'Ok'), getType(files.result, 'Ko'), getType(files.result, 'Result')])
    }
  })

  await markdownObject({
    object: getObjectOrThrow(files.prom, 'Prom'),
    title: 'Promise overview',
    path: path.join(docsPath, 'Promise.md')
  })

  await markdownObject({
    object: getObjectOrThrow(files.task, 'Task'),
    title: 'Task overview',
    path: path.join(docsPath, 'Task.md'),
    additionals: {
      types: Arr.compact([getType(files.task, 'Task')])
    }
  })

  await markdownObject({
    object: getObjectOrThrow(files.ord, 'Ord'),
    title: 'Ord overview',
    path: path.join(docsPath, 'Ord.md'),
    additionals: {
      types: Arr.compact([getType(files.ord, 'Ord'), getType(files.ord, 'Ordering')])
    }
  })

  await markdownObject({
    object: getObjectOrThrow(files.string, 'Str'),
    title: 'String overview',
    path: path.join(docsPath, 'String.md')
  })

  await markdownObject({
    object: getObjectOrThrow(files.option, 'Option'),
    title: 'Option overview',
    path: path.join(docsPath, 'Option.md'),
    additionals: {
      types: Arr.compact([getType(files.option, 'Option')])
    }
  })

  await markdownObject({
    object: getObjectOrThrow(files.enum, 'Enum'),
    title: 'Enum overview',
    path: path.join(docsPath, 'Enum.md')
  })

  await markdownObject({
    object: getObjectOrThrow(files.err, 'Err'),
    title: 'Error overview',
    path: path.join(docsPath, 'Err.md'),
    additionals: {
      types: Arr.compact([getType(files.err, 'Err')])
    }
  })

  await markdownObject({
    object: getObjectOrThrow(files.tree, 'Tree'),
    title: 'Tree overview',
    path: path.join(docsPath, 'Tree.md'),
    additionals: {
      types: Arr.compact([getType(files.tree, 'Tree')])
    }
  })

  await markdownObject({
    object: getObjectOrThrow(files.io, 'IO'),
    title: 'IO overview',
    path: path.join(docsPath, 'IO.md'),
    additionals: {
      types: Arr.compact([getType(files.io, 'IO')])
    }
  })
}

run(main)
