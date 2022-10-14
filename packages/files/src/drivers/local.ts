import etag from 'etag'
import * as fsExtra from 'fs-extra'
import path, { dirname } from 'path'

import { DriveFilePage, DriveFileStats, DriverContract, ListOptions, SignedUrlOptions } from '../driver'

import { pipelinePromise } from '../utils'

import {
  CannotCopyFileException,
  CannotMoveFileException,
  CannotReadFileException,
  CannotWriteFileException,
  CannotGenerateUrlException,
  CannotDeleteFileException,
  CannotGetMetaDataException,
  CannotListFilesException
} from '../exceptions'
import { Arr, pipe, Str } from '@apoyo/std'

export interface LocalDriverConfig {
  /**
   * Root directory in which to search for your files on your local filesystem
   */
  root: string

  /**
   * Configure how `getUrl` and `getSignedUrl` computes the URL for a given file
   */
  serveFiles?: {
    makeUrl(location: string): string
    makeSignedUrl(location: string, options?: SignedUrlOptions): string
  }
}

/**
 * Local driver interacts with the local file system
 */
export class LocalDriver implements DriverContract {
  /**
   * Reference to the underlying adapter. Which is
   * fs-extra
   */
  public adapter = fsExtra

  /**
   * Name of the driver
   */
  public name: 'local' = 'local'

  constructor(private _config: LocalDriverConfig) {}

  /**
   * Make absolute path to a given location
   */
  public makePath(location: string) {
    return path.join(this._config.root, location)
  }

  /**
   * Returns the file contents as a buffer. The buffer return
   * value allows you to self choose the encoding when
   * converting the buffer to a string.
   */
  public async get(location: string): Promise<Buffer> {
    try {
      return await this.adapter.readFile(this.makePath(location))
    } catch (error) {
      throw new CannotReadFileException(location, error)
    }
  }

  /**
   * Returns the file contents as a stream
   */
  public async getStream(location: string): Promise<NodeJS.ReadableStream> {
    try {
      return this.adapter.createReadStream(this.makePath(location))
    } catch (error) {
      throw new CannotReadFileException(location, error)
    }
  }

  /**
   * A boolean to find if the location path exists or not
   */
  public async exists(location: string): Promise<boolean> {
    try {
      return await this.adapter.pathExists(this.makePath(location))
    } catch (error) {
      throw new CannotGetMetaDataException(location, 'exists', error)
    }
  }

  /**
   * Returns the file stats
   */
  public async getStats(location: string): Promise<DriveFileStats> {
    try {
      const stats = await this.adapter.stat(this.makePath(location))
      return {
        modified: new Date(stats.mtime),
        size: stats.size,
        isFile: stats.isFile(),
        etag: etag(stats)
      }
    } catch (error) {
      throw new CannotGetMetaDataException(location, 'stats', error)
    }
  }

  /**
   * Returns a signed URL for a given location path
   */
  public async getSignedUrl(location: string, options?: SignedUrlOptions): Promise<string> {
    if (!this._config.serveFiles) {
      throw new CannotGenerateUrlException(location)
    }
    return this._config.serveFiles.makeSignedUrl(location, options)
  }

  /**
   * Returns a URL for a given location path
   */
  public async getUrl(location: string): Promise<string> {
    if (!this._config.serveFiles) {
      throw new CannotGenerateUrlException(location)
    }
    return this._config.serveFiles.makeUrl(location)
  }

  /**
   * Write string|buffer contents to a destination. The missing
   * intermediate directories will be created (if required).
   */
  public async put(location: string, contents: Buffer | string): Promise<void> {
    try {
      await this.adapter.outputFile(this.makePath(location), contents)
    } catch (error) {
      throw new CannotWriteFileException(location, error)
    }
  }

  /**
   * Write a stream to a destination. The missing intermediate
   * directories will be created (if required).
   */
  public async putStream(location: string, contents: NodeJS.ReadableStream): Promise<void> {
    const absolutePath = this.makePath(location)

    const dir = dirname(absolutePath)
    await this.adapter.ensureDir(dir)

    const writeStream = this.adapter.createWriteStream(absolutePath)

    /**
     * If streaming is interrupted, then the destination file will be
     * created with partial or empty contents.
     *
     * Earlier we are cleaning up the empty file, which addresses one
     * use case (no pre-existing file was there).
     *
     * However, in case there was already a file, it will be then emptied
     * out. So basically there is no way to get the original contents
     * back unless we read the existing content in buffer, but then
     * we don't know how large the file is.
     */
    try {
      await pipelinePromise(contents, writeStream)
    } catch (error) {
      throw new CannotWriteFileException(location, error)
    }
  }

  /**
   * Remove a given location path
   */
  public async delete(location: string): Promise<void> {
    try {
      await this.adapter.remove(this.makePath(location))
    } catch (error) {
      throw new CannotDeleteFileException(location, error)
    }
  }

  /**
   * Copy a given location path from the source to the desination.
   * The missing intermediate directories will be created (if required)
   */
  public async copy(source: string, destination: string): Promise<void> {
    try {
      await this.adapter.copy(this.makePath(source), this.makePath(destination), {
        overwrite: true
      })
    } catch (error) {
      throw new CannotCopyFileException(source, destination, error)
    }
  }

  /**
   * Move a given location path from the source to the desination.
   * The missing intermediate directories will be created (if required)
   */
  public async move(source: string, destination: string): Promise<void> {
    try {
      await this.adapter.move(this.makePath(source), this.makePath(destination), {
        overwrite: true
      })
    } catch (error) {
      throw new CannotMoveFileException(source, destination, error)
    }
  }

  /**
   * List files for a given directory.
   *
   * A continuation token will be made available to fetch the next page.
   *
   * @example
   * ```ts
   * const page = await driver.list()
   * const { items, next } = page
   *
   * const nextPage = await driver.list({ next })
   * ```
   */
  public async list(options: ListOptions = {}): Promise<DriveFilePage> {
    const trimSlash = Str.trimWhile((c) => c === '/')
    const location = pipe(options.prefix ?? '', trimSlash, Str.concat('/'))

    try {
      const results = await this.adapter.readdir(this.makePath(location), {
        withFileTypes: true
      })

      const files = pipe(
        results,
        Arr.filter((ent) => ent.isFile() || ent.isDirectory()),
        Arr.map((ent) => {
          return {
            name: trimSlash(`${location}${ent.name}`),
            isFile: ent.isFile()
          }
        })
      )

      return {
        items: files
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        return {
          items: []
        }
      }
      throw new CannotListFilesException(location, err)
    }
  }
}
