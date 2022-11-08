import etag from 'etag'
import { Volume } from 'memfs'
import { dirname } from 'path'

import { DriveFileStats, Drive, SignedUrlOptions } from '../drive'

import { pipelinePromise } from '../utils'

import {
  CannotCopyFileException,
  CannotMoveFileException,
  CannotReadFileException,
  CannotWriteFileException,
  CannotDeleteFileException,
  CannotGetMetaDataException,
  CannotGenerateUrlException
} from '../exceptions'
import { Exception } from '@apoyo/std'

export interface FakeDriveConfig {
  /**
   * Configure how `getUrl` and `getSignedUrl` computes the URL for a given file
   */
  serveFiles?: {
    makeUrl(location: string): string
    makeSignedUrl(location: string, options?: SignedUrlOptions): string
  }
}

/**
 * Memory drive is mainly used for testing
 */
export class FakeDrive implements Drive {
  /**
   * Reference to the underlying adapter. Which is memfs
   */
  public adapter = new Volume()

  /**
   * Name of the driver
   */
  public name: 'fake' = 'fake'

  constructor(private _config: FakeDriveConfig = {}) {}

  /**
   * Make absolute path to a given location
   */
  public makePath(location: string) {
    return location
  }

  /**
   * Creates the directory recursively with in the memory
   */
  private _ensureDir(location: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.adapter.mkdirp(dirname(location), (error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  /**
   * Returns the file contents as a buffer. The buffer return
   * value allows you to self choose the encoding when
   * converting the buffer to a string.
   */
  public async get(location: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      this.adapter.readFile(this.makePath(location), (error, data) => {
        if (error) {
          reject(new CannotReadFileException(location, error))
        } else if (!data) {
          reject(new CannotReadFileException(location, new Exception('Undefined data')))
        } else {
          resolve(typeof data === 'string' ? Buffer.from(data) : data)
        }
      })
    })
  }

  /**
   * Returns the file contents as a stream
   */
  public async getStream(location: string): Promise<NodeJS.ReadableStream> {
    return this.adapter.createReadStream(this.makePath(location))
  }

  /**
   * A boolean to find if the location path exists or not
   */
  public exists(location: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.adapter.exists(this.makePath(location), (exists: boolean) => {
        resolve(exists)
      })
    })
  }

  /**
   * Returns the file stats
   */
  public async getStats(location: string): Promise<DriveFileStats> {
    return new Promise((resolve, reject) => {
      this.adapter.stat(this.makePath(location), (error, stats) => {
        if (error) {
          reject(new CannotGetMetaDataException(location, 'stats', error))
        } else {
          resolve({
            modified: stats!.mtime,
            size: stats!.size as number,
            isFile: stats!.isFile(),
            etag: etag(stats as etag.StatsLike)
          })
        }
      })
    })
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
    await this._ensureDir(absolutePath)

    return new Promise((resolve, reject) => {
      this.adapter.writeFile(absolutePath, contents, (error) => {
        if (error) {
          reject(new CannotWriteFileException(location, error))
        } else {
          resolve()
        }
      })
    })
  }

  /**
   * Write a stream to a destination. The missing intermediate
   * directories will be created (if required).
   */
  public async putStream(location: string, contents: NodeJS.ReadableStream): Promise<void> {
    const absolutePath = this.makePath(location)
    try {
      await this._ensureDir(absolutePath)

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
      await pipelinePromise(contents, writeStream)
    } catch (error) {
      throw new CannotWriteFileException(location, error)
    }
  }

  /**
   * Remove a given location path
   */
  public async delete(location: string): Promise<void> {
    if (!(await this.exists(location))) {
      return
    }

    return new Promise((resolve, reject) => {
      this.adapter.unlink(this.makePath(location), (error) => {
        if (error) {
          reject(new CannotDeleteFileException(location, error))
        } else {
          resolve()
        }
      })
    })
  }

  /**
   * Copy a given location path from the source to the desination.
   * The missing intermediate directories will be created (if required)
   */
  public async copy(source: string, destination: string): Promise<void> {
    const desintationAbsolutePath = this.makePath(destination)
    await this._ensureDir(desintationAbsolutePath)

    return new Promise((resolve, reject) => {
      this.adapter.copyFile(this.makePath(source), desintationAbsolutePath, (error) => {
        if (error) {
          reject(new CannotCopyFileException(source, destination, error))
        } else {
          resolve()
        }
      })
    })
  }

  /**
   * Move a given location path from the source to the desination.
   * The missing intermediate directories will be created (if required)
   */
  public async move(source: string, destination: string): Promise<void> {
    const sourceAbsolutePath = this.makePath(source)
    const desintationAbsolutePath = this.makePath(destination)
    await this._ensureDir(desintationAbsolutePath)

    return new Promise<void>((resolve, reject) => {
      this.adapter.copyFile(sourceAbsolutePath, desintationAbsolutePath, (error) => {
        if (error) {
          reject(new CannotMoveFileException(source, destination, error))
        } else {
          resolve()
        }
      })
    }).then(() => this.delete(source))
  }
}
