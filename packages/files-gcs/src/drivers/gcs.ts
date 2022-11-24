import { pipeline } from 'stream'
import { promisify } from 'util'

import {
  CannotCopyFileException,
  CannotDeleteFileException,
  CannotGetMetaDataException,
  CannotMoveFileException,
  CannotReadFileException,
  CannotWriteFileException,
  ContentHeaders,
  DriveFileStats,
  Drive,
  SignedUrlOptions,
  WriteOptions,
  Location,
  LocationException
} from '@apoyo/files'
import { Bucket, GetSignedUrlConfig, Storage, StorageOptions } from '@google-cloud/storage'

const pipelinePromise = promisify(pipeline)

export type GcsDriveConfig = StorageOptions & {
  bucket: string
  prefix?: string
  usingUniformAcl?: boolean
  cdnUrl?: string
}

export class GcsDrive implements Drive {
  /**
   * Reference to the GCS Bucket
   */
  private _gcsBucket: Bucket

  /**
   * Reference to the gcs storage instance
   */
  public adapter: Storage

  /**
   * Name of the driver
   */
  public name: 'gcs' = 'gcs'

  constructor(private _config: GcsDriveConfig) {
    this.adapter = new Storage(this._config)
    this._gcsBucket = this.adapter.bucket(this._config.bucket)
  }

  /**
   * Make absolute path to a given location
   */
  public makePath(location: string) {
    return this._config.prefix
      ? Location.stripSlashes(this._config.prefix) + '/' + Location.normalize(location)
      : Location.normalize(location)
  }

  /**
   * Transforms the write options to GCS properties. Checkout the
   * following example in the docs to see the available options
   *
   * https://googleapis.dev/nodejs/storage/latest/File.html#createWriteStream
   */
  private _transformWriteOptions(options?: WriteOptions) {
    const { contentType, contentDisposition, contentEncoding, contentLanguage, ...adapterOptions } = Object.assign(
      {},
      options
    )

    adapterOptions.metadata = {}

    if (contentType) {
      adapterOptions['contentType'] = contentType
    }

    if (contentDisposition) {
      adapterOptions.metadata['contentDisposition'] = contentDisposition
    }

    if (contentEncoding) {
      adapterOptions.metadata['contentEncoding'] = contentEncoding
    }

    if (contentLanguage) {
      adapterOptions.metadata['contentLanguage'] = contentLanguage
    }

    return adapterOptions
  }

  /**
   * Transform content headers to GCS response headers
   */
  private _transformContentHeaders(options?: ContentHeaders) {
    const contentHeaders: Partial<GetSignedUrlConfig> = {}
    const { contentType, contentDisposition } = options || {}

    if (contentType) {
      contentHeaders['responseType'] = contentType
    }
    if (contentDisposition) {
      contentHeaders['responseDisposition'] = contentDisposition
    }

    return contentHeaders
  }

  /**
   * Converts seconds to milliseconds
   */
  private _secondsToTimeStamp(secs: number) {
    return new Date(Date.now() + secs * 1000).getTime()
  }

  /**
   * Returns a new instance of the GCS driver with
   * a custom runtime bucket
   */
  public bucket(bucket: string): GcsDrive {
    return new GcsDrive(Object.assign({}, this._config, { bucket }))
  }

  /**
   * Returns the file contents as a buffer. The buffer return
   * value allows you to self choose the encoding when
   * converting the buffer to a string.
   */
  public async get(location: string): Promise<Buffer> {
    const absolutePath = this.makePath(location)
    try {
      const [file] = await this._gcsBucket.file(absolutePath).download()
      return file
    } catch (error) {
      throw new CannotReadFileException(location, error)
    }
  }

  /**
   * Returns the file contents as a stream
   */
  public async getStream(location: string): Promise<NodeJS.ReadableStream> {
    const absolutePath = this.makePath(location)
    return this._gcsBucket.file(absolutePath).createReadStream()
  }

  /**
   * A boolean to find if the location path exists or not
   */
  public async exists(location: string): Promise<boolean> {
    const absolutePath = this.makePath(location)
    try {
      const [exists] = await this._gcsBucket.file(absolutePath).exists()
      return exists
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
      const [metaData] = await this._gcsBucket.file(absolutePath).getMetadata()

      return {
        modified: new Date(metaData.updated),
        size: parseInt(metaData.size, 10),
        isFile: true,
        etag: metaData.etag
      }
    } catch (error) {
      throw new CannotGetMetaDataException(location, 'stats', error)
    }
  }

  /**
   * Returns the signed url for a given path
   */
  public async getSignedUrl(location: string, options?: SignedUrlOptions): Promise<string> {
    const absolutePath = this.makePath(location)
    try {
      const sixDays = 6 * 24 * 60 * 60
      const [url] = await this._gcsBucket.file(absolutePath).getSignedUrl({
        action: 'read',
        /**
         * Using v2 doesn't allow overriding content-type header
         */
        version: 'v4',
        expires: this._secondsToTimeStamp(options?.expiresIn || sixDays),
        ...this._transformContentHeaders(options)
      })
      return url
    } catch (error) {
      throw new CannotGetMetaDataException(location, 'signedUrl', error)
    }
  }

  /**
   * Returns URL to a given path
   */
  public async getUrl(location: string): Promise<string> {
    const absolutePath = this.makePath(location)
    return this._gcsBucket.file(absolutePath).publicUrl()
  }

  /**
   * Write string|buffer contents to a destination. The missing
   * intermediate directories will be created (if required).
   */
  public async put(location: string, contents: Buffer | string, options?: WriteOptions): Promise<void> {
    const absolutePath = this.makePath(location)
    try {
      await this._gcsBucket.file(absolutePath).save(contents, {
        resumable: false,
        ...this._transformWriteOptions(options)
      })
    } catch (error) {
      throw new CannotWriteFileException(location, error)
    }
  }

  /**
   * Write a stream to a destination. The missing intermediate
   * directories will be created (if required).
   */
  public async putStream(location: string, contents: NodeJS.ReadableStream, options?: WriteOptions): Promise<void> {
    const absolutePath = this.makePath(location)
    try {
      const destination = this._gcsBucket.file(absolutePath).createWriteStream({
        resumable: false,
        ...this._transformWriteOptions(options)
      })
      await pipelinePromise(contents, destination)
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
      await this._gcsBucket.file(absolutePath).delete({ ignoreNotFound: true })
    } catch (error) {
      throw new CannotDeleteFileException(location, error)
    }
  }

  /**
   * Copy a given location path from the source to the desination.
   * The missing intermediate directories will be created (if required)
   */
  public async copy(source: string, destination: string, options?: WriteOptions): Promise<void> {
    const sourcePath = this.makePath(source)
    const destinationPath = this.makePath(destination)

    options = options || {}

    try {
      await this._gcsBucket.file(sourcePath).copy(destinationPath, this._transformWriteOptions(options))
    } catch (error) {
      throw new CannotCopyFileException(source, destination, error)
    }
  }

  /**
   * Move a given location path from the source to the desination.
   * The missing intermediate directories will be created (if required)
   */
  public async move(source: string, destination: string, options?: WriteOptions): Promise<void> {
    try {
      await this.copy(source, destination, options)
      await this.delete(source)
    } catch (error) {
      if (error instanceof LocationException) {
        throw error
      }
      throw new CannotMoveFileException(source, destination, error.cause || error)
    }
  }
}
