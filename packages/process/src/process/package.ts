import fs from 'fs'
import { join } from 'path'

import { DecodeError, Decoder, ObjectDecoder, TextDecoder } from '@apoyo/decoders'
import { Provider } from '@apoyo/ioc'
import { Err, pipe, Result } from '@apoyo/std'

import { $rootDir } from './root'

export interface Pkg {
  name: string
  version: string
  description?: string
  author?: string
}

const jsonDecoder = Decoder.create((input: string) =>
  pipe(
    Result.tryCatch(() => JSON.parse(input)),
    Result.mapError((err: any) => DecodeError.value(input, err.message, err))
  )
)

const pkgDecoder = ObjectDecoder.struct<Pkg>({
  name: TextDecoder.string,
  version: TextDecoder.string,
  description: pipe(TextDecoder.string, TextDecoder.optional),
  author: pipe(TextDecoder.string, TextDecoder.optional)
})

const fileDecoder = pipe(
  jsonDecoder,
  Decoder.chain(() => pkgDecoder)
)

export const readPkg = async (rootDir: string): Promise<Pkg> => {
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

export const $pkg = Provider.fromFactory(readPkg, [$rootDir])

export const $version = Provider.fromFactory((pkg) => pkg.version, [$pkg])
