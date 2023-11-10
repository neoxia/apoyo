import etag from 'etag'
import * as fsExtra from 'fs-extra'
import path, { dirname } from 'path'

import { DriveFileStats, Drive, SignedUrlOptions } from '../drive'

import { pipelinePromise } from '../utils'

import {
  CannotCopyFileException,
  CannotMoveFileException,
  CannotReadFileException,
  CannotWriteFileException,
  CannotGenerateUrlException,
  CannotDeleteFileException,
  CannotGetMetaDataException
} from '../exceptions'
import { Location } from '../location'

export interface LocalDriveConfig {
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
export class LocalDrive implements Drive {
  /**
   * Reference to the underlying adapter. Which is
   * fs-extra
   */
  public adapter = fsExtra

  /**
   * Name of the driver
   */
  public name = 'local' as const

  constructor(private _config: LocalDriveConfig) {}

  /**
   * Make absolute path to a given location
   */
  public makePath(location: string) {
    return path.join(this._config.root, Location.normalize(location))
  }

  /**
   * Returns the file contents as a buffer. The buffer return
   * value allows you to self choose the encoding when
   * converting the buffer to a string.
   */
  public async get(location: string): Promise<Buffer> {
    const absolutePath = this.makePath(location)
    try {
      return await this.adapter.readFile(absolutePath)
    } catch (error) {
      throw new CannotReadFileException(location, error)
    }
  }

  /**
   * Returns the file contents as a stream
   */
  public async getStream(location: string): Promise<NodeJS.ReadableStream> {
    const absolutePath = this.makePath(location)
    try {
      return this.adapter.createReadStream(absolutePath)
    } catch (error) {
      throw new CannotReadFileException(location, error)
    }
  }

  /**
   * A boolean to find if the location path exists or not
   */
  public async exists(location: string): Promise<boolean> {
    const absolutePath = this.makePath(location)
    try {
      return await this.adapter.pathExists(absolutePath)
    } catch (error) {
      throw new CannotGetMetaDataException(location, 'exists', error)
    }
  }

  /**
   * Returns the file stats
   */
  public async getStats(location: string): Promise<DriveFileStats> {
    const absolutePath = this.makePath(location)
    try {
      const stats = await this.adapter.stat(absolutePath)
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
    const absolutePath = this.makePath(location)
    try {
      await this.adapter.outputFile(absolutePath, contents)
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
    const absolutePath = this.makePath(location)

    try {
      await this.adapter.remove(absolutePath)
    } catch (error) {
      throw new CannotDeleteFileException(location, error)
    }
  }

  /**
   * Copy a given location path from the source to the desination.
   * The missing intermediate directories will be created (if required)
   */
  public async copy(source: string, destination: string): Promise<void> {
    const sourcePath = this.makePath(source)
    const destinationPath = this.makePath(destination)

    try {
      await this.adapter.copy(sourcePath, destinationPath, {
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
    const sourcePath = this.makePath(source)
    const destinationPath = this.makePath(destination)

    try {
      await this.adapter.move(sourcePath, destinationPath, {
        overwrite: true
      })
    } catch (error) {
      throw new CannotMoveFileException(source, destination, error)
    }
  }
}
