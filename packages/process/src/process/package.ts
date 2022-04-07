import fs from 'fs'
import { join } from 'path'

import { DecodeError, Decoder, ObjectDecoder, TextDecoder } from '@apoyo/decoders'
import { Injectable } from '@apoyo/scopes'
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
  description: TextDecoder.string
})

const fileDecoder = pipe(
  jsonDecoder,
  Decoder.chain(() => pkgDecoder)
)

export const $pkg = Injectable.define($rootDir, async (rootDir) => {
  const path = join(rootDir, 'package.json')
  const content = await fs.promises.readFile(path, {
    encoding: 'utf-8'
  })

  const pkg = pipe(
    content,
    Decoder.validate(fileDecoder),
    Result.mapError((err) =>
      Err.of(`Could not find valid package.json file at {{path}}`, {
        path,
        errors: DecodeError.format(err)
      })
    ),
    Result.get
  )

  return {
    name: pkg.name as string,
    version: pkg.version as string,
    description: pkg.description as string
  }
})

export const $version = Injectable.define($pkg, (pkg) => pkg.version)
