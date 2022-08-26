import fs from 'fs'
import { join } from 'path'

import { DecodeError, Decoder, ObjectDecoder, TextDecoder } from '@apoyo/decoders'
import { Implementation } from '@apoyo/scopes'
import { Err, pipe, Result } from '@apoyo/std'

import { $rootDir } from './root'

const jsonDecoder = Decoder.create((input: string) =>
  pipe(
    Result.tryCatch(() => JSON.parse(input)),
    Result.mapError((err: any) => DecodeError.value(input, err.message, err))
  )
)

const pkgDecoder = ObjectDecoder.struct({
  name: TextDecoder.string,
  version: TextDecoder.string,
  description: pipe(TextDecoder.string, TextDecoder.optional),
  author: pipe(TextDecoder.string, TextDecoder.optional)
})

const fileDecoder = pipe(
  jsonDecoder,
  Decoder.chain(() => pkgDecoder)
)

export const readPkg = async (rootDir: string) => {
  const path = join(rootDir, 'package.json')
  const content = await fs.promises.readFile(path, {
    encoding: 'utf-8'
  })

  return pipe(
    content,
    Decoder.validate(fileDecoder),
    Result.mapError((err) =>
      Err.of(`Could not find valid package.json file at ${JSON.stringify(path)}`, {
        path,
        errors: DecodeError.format(err)
      })
    ),
    Result.get
  )
}

export const $pkg = Implementation.create([$rootDir], (rootDir) => readPkg(rootDir))

export const $version = Implementation.create([$pkg], (pkg) => pkg.version)
