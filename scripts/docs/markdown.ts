import fs from 'fs'
import path from 'path'

import { Arr, pipe } from '@apoyo/std'
import { Decl } from './parse-ts'

const formatDecl = (decl: Decl) => {
  let content = ''
  content += `### ${decl.name}\n\n`
  if (decl.docs?.deprecated) {
    content += '::: warning\n' + decl.docs.deprecated + '\n:::\n\n'
  }
  const modifiers = decl.docs?.modifiers ?? []
  if (modifiers.length > 0) {
    content += decl.docs?.modifiers.join(', ') + '\n\n'
  }
  if (decl.docs?.description) {
    content += '#### Description\n\n' + decl.docs?.description + '\n\n'
  }
  if (decl.signature) {
    content += '```ts\n' + decl.signature + '\n```\n\n'
  }
  if (decl.docs?.example) {
    content += '#### Example\n' + decl.docs?.example + '\n\n'
  }
  const sees = decl.docs?.see ?? []
  if (sees.length > 0) {
    content += '#### References\n'
    content += sees.map((see) => `- ${see.trim()}`).join('\n')
    content += '\n\n'
  }
  return content
}

interface FormatNamespace {
  name: string
  description?: string
  example?: string
  types: Decl[]
  functions: Decl[]
}

const formatMarkdown = (nsFile: FormatNamespace) => {
  let content = `# ${nsFile.name}\n\n`
  if (nsFile.description) {
    content += `${nsFile.description}\n\n`
  }
  if (nsFile.example) {
    content += nsFile.example + '\n\n'
  }
  content += `## Summary\n\n`
  content += `[[toc]]\n\n`

  if (nsFile.types.length) {
    content += `## Types\n\n`
    for (const type of nsFile.types) {
      content += formatDecl(type)
    }
  }

  if (nsFile.functions.length) {
    content += `## Functions\n\n`
    for (const prop of nsFile.functions) {
      content += formatDecl(prop)
    }
  }

  return content
}

interface MarkdownObjectOptions {
  object: Decl
  additionals?: {
    types?: Decl[]
    functions?: Decl[]
  }
  title: string
  path: string
}

export const markdownObject = async (options: MarkdownObjectOptions) => {
  const obj = options.object
  const ns: FormatNamespace = {
    name: options.title,
    description: obj.docs?.description,
    example: obj.docs?.example,
    types: Arr.flatten([options.additionals?.types || []]),
    functions: Arr.flatten([
      pipe(
        obj.properties as Decl[],
        Arr.filter((p) => p.type === 'function')
      ),
      options.additionals?.functions || []
    ])
  }
  const md = formatMarkdown(ns)
  const directory = path.parse(options.path)

  // eslint-disable-next-line no-console
  console.log('Write file in', options.path)
  await fs.promises.mkdir(directory.dir, {
    recursive: true
  })
  await fs.promises.writeFile(options.path, md)
}
