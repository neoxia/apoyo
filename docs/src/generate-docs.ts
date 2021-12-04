import path from 'path'
import { Project, ProjectOptions } from 'ts-morph'

import { Arr, Err, pipe, Result } from '@apoyo/std'
import { markdownObject } from './markdown'
import { getObjectOrThrow, getType } from './parse-ts'
import { run } from './run'

export const generateStdDocs = async (rootPath: string, docsPath: string) => {
  const config: ProjectOptions = {
    tsConfigFilePath: path.join(rootPath, 'tsconfig.common.json')
  }
  const project = pipe(
    Result.tryCatch(() => new Project(config)),
    Result.mapError(Err.chain('Could not initialize TS project')),
    Result.get
  )

  project.addSourceFilesAtPaths(path.join(rootPath, 'src/**/*.ts'))

  const files = {
    array: project.getSourceFileOrThrow('Array.ts'),
    nonEmptyArray: project.getSourceFileOrThrow('NonEmptyArray.ts'),
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
    io: project.getSourceFileOrThrow('IO.ts'),
    seq: project.getSourceFileOrThrow('Seq.ts')
  }

  await markdownObject({
    object: getObjectOrThrow(files.array, 'Arr'),
    title: 'Array overview',
    path: path.join(docsPath, 'Array.md')
  })

  await markdownObject({
    object: getObjectOrThrow(files.nonEmptyArray, 'NonEmptyArray'),
    title: 'NonEmptyArray overview',
    path: path.join(docsPath, 'NonEmptyArray.md')
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

  await markdownObject({
    object: getObjectOrThrow(files.seq, 'Seq'),
    title: 'Seq overview',
    path: path.join(docsPath, 'Seq.md'),
    additionals: {
      types: Arr.compact([getType(files.seq, 'Seq')])
    }
  })
}

export const generateDecodersDocs = async (rootPath: string, docsPath: string) => {
  const config: ProjectOptions = {
    tsConfigFilePath: path.join(rootPath, 'tsconfig.common.json')
  }
  const project = pipe(
    Result.tryCatch(() => new Project(config)),
    Result.mapError(Err.chain('Could not initialize TS project')),
    Result.get
  )

  project.addSourceFilesAtPaths(path.join(rootPath, 'src/**/*.ts'))

  const files = {
    decoder: project.getSourceFileOrThrow('Decoder.ts'),
    textDecoder: project.getSourceFileOrThrow('TextDecoder.ts'),
    numberDecoder: project.getSourceFileOrThrow('NumberDecoder.ts'),
    integerDecoder: project.getSourceFileOrThrow('IntegerDecoder.ts'),
    booleanDecoder: project.getSourceFileOrThrow('BooleanDecoder.ts'),
    arrayDecoder: project.getSourceFileOrThrow('ArrayDecoder.ts'),
    objectDecoder: project.getSourceFileOrThrow('ObjectDecoder.ts'),
    enumDecoder: project.getSourceFileOrThrow('EnumDecoder.ts'),
    dateDecoder: project.getSourceFileOrThrow('DateDecoder.ts')
  }

  await markdownObject({
    object: getObjectOrThrow(files.decoder, 'Decoder'),
    title: 'Decoder overview',
    path: path.join(docsPath, 'Decoder.md')
  })

  await markdownObject({
    object: getObjectOrThrow(files.textDecoder, 'TextDecoder'),
    title: 'TextDecoder overview',
    path: path.join(docsPath, 'TextDecoder.md')
  })

  await markdownObject({
    object: getObjectOrThrow(files.numberDecoder, 'NumberDecoder'),
    title: 'NumberDecoder overview',
    path: path.join(docsPath, 'NumberDecoder.md')
  })

  await markdownObject({
    object: getObjectOrThrow(files.integerDecoder, 'IntegerDecoder'),
    title: 'IntegerDecoder overview',
    path: path.join(docsPath, 'IntegerDecoder.md')
  })

  await markdownObject({
    object: getObjectOrThrow(files.booleanDecoder, 'BooleanDecoder'),
    title: 'BooleanDecoder overview',
    path: path.join(docsPath, 'BooleanDecoder.md')
  })

  await markdownObject({
    object: getObjectOrThrow(files.arrayDecoder, 'ArrayDecoder'),
    title: 'ArrayDecoder overview',
    path: path.join(docsPath, 'ArrayDecoder.md')
  })

  await markdownObject({
    object: getObjectOrThrow(files.objectDecoder, 'ObjectDecoder'),
    title: 'ObjectDecoder overview',
    path: path.join(docsPath, 'ObjectDecoder.md')
  })

  await markdownObject({
    object: getObjectOrThrow(files.enumDecoder, 'EnumDecoder'),
    title: 'EnumDecoder overview',
    path: path.join(docsPath, 'EnumDecoder.md')
  })

  await markdownObject({
    object: getObjectOrThrow(files.dateDecoder, 'DateDecoder'),
    title: 'DateDecoder overview',
    path: path.join(docsPath, 'DateDecoder.md')
  })
}

export const generateHttpDocs = async (rootPath: string, docsPath: string) => {
  const config: ProjectOptions = {
    tsConfigFilePath: path.join(rootPath, 'tsconfig.common.json')
  }
  const project = pipe(
    Result.tryCatch(() => new Project(config)),
    Result.mapError(Err.chain('Could not initialize TS project')),
    Result.get
  )

  project.addSourceFilesAtPaths(path.join(rootPath, 'src/**/*.ts'))

  const files = {
    response: project.getSourceFileOrThrow('Response.ts'),
    http: project.getSourceFileOrThrow('Http.ts'),
    httpCode: project.getSourceFileOrThrow('HttpCode.ts')
  }

  await markdownObject({
    object: getObjectOrThrow(files.response, 'Response'),
    title: 'Response overview',
    path: path.join(docsPath, 'Response.md'),
    additionals: {
      types: Arr.compact([
        getType(files.response, 'ResponseType'),
        getType(files.response, 'Response'),
        getType(files.response, 'Response.Open'),
        getType(files.response, 'Response.Result'),
        getType(files.response, 'Response.Redirect'),
        getType(files.response, 'Response.Stream'),
        getType(files.response, 'Response.Next'),
        getType(files.response, 'Response.Callback')
      ])
    }
  })

  await markdownObject({
    object: getObjectOrThrow(files.http, 'Http'),
    title: 'Http overview',
    path: path.join(docsPath, 'Http.md')
  })

  await markdownObject({
    title: 'Http codes overview',
    path: path.join(docsPath, 'HttpCode.md'),
    additionals: {
      types: Arr.compact([getType(files.httpCode, 'HttpCode')])
    }
  })
}

export const main = async () => {
  const packagesPath = path.resolve(__dirname, '../../packages')
  const vuepressPath = path.resolve(__dirname, '../vuepress')

  await generateStdDocs(path.join(packagesPath, `std`), path.join(vuepressPath, `guide/std/api`))
  await generateDecodersDocs(path.join(packagesPath, `decoders`), path.join(vuepressPath, `guide/decoders/api`))
  await generateHttpDocs(path.join(packagesPath, `http`), path.join(vuepressPath, `guide/http/api`))
}

run(main)
