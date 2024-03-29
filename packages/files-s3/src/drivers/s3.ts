import getStream from 'get-stream'
import { format } from 'url'

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
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandInput,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
  Tag
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export type S3DriveConfig = S3ClientConfig & {
  bucket: string
  prefix?: string
  cdnUrl?: string
  key?: string
  secret?: string
}

/**
 * An implementation of the s3 driver for AdonisJS drive
 */
export class S3Drive implements Drive {
  /**
   * Reference to the s3 client
   */
  public adapter: S3Client

  /**
   * Name of the driver
   */
  public name: 's3' = 's3'

  constructor(private _config: S3DriveConfig) {
    /**
     * Use the top level key and secret to define AWS credentials
     */
    if (this._config.key && this._config.secret) {
      this._config.credentials = {
        accessKeyId: this._config.key,
        secretAccessKey: this._config.secret
      }
    }

    this.adapter = new S3Client(this._config)
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
   * Transforms the write options to S3 properties
   */
  private _transformWriteOptions(options?: WriteOptions) {
    const {
      contentType,
      contentDisposition,
      contentEncoding,
      contentLanguage,
      cacheControl,
      ...adapterOptions
    } = Object.assign({}, options)

    if (contentType) {
      adapterOptions['ContentType'] = contentType
    }

    if (contentDisposition) {
      adapterOptions['ContentDisposition'] = contentDisposition
    }

    if (contentEncoding) {
      adapterOptions['ContentEncoding'] = contentEncoding
    }

    if (contentLanguage) {
      adapterOptions['ContentLanguage'] = contentLanguage
    }

    if (cacheControl) {
      adapterOptions['CacheControl'] = cacheControl
    }

    return adapterOptions
  }

  /**
   * Transform content headers to S3 response content type
   */
  private _transformContentHeaders(options?: ContentHeaders) {
    const contentHeaders: Omit<GetObjectCommandInput, 'Key' | 'Bucket'> = {}
    const { contentType, contentDisposition, contentEncoding, contentLanguage, cacheControl } = options || {}

    if (contentType) {
      contentHeaders['ResponseContentType'] = contentType
    }

    if (contentDisposition) {
      contentHeaders['ResponseContentDisposition'] = contentDisposition
    }

    if (contentEncoding) {
      contentHeaders['ResponseContentEncoding'] = contentEncoding
    }

    if (contentLanguage) {
      contentHeaders['ResponseContentLanguage'] = contentLanguage
    }

    if (cacheControl) {
      contentHeaders['ResponseCacheControl'] = cacheControl
    }

    return contentHeaders
  }

  /**
   * Returns the file contents as a buffer. The buffer return
   * value allows you to self choose the encoding when
   * converting the buffer to a string.
   */
  public async get(location: string): Promise<Buffer> {
    return getStream.buffer(await this.getStream(location))
  }

  /**
   * Returns the file contents as a stream
   */
  public async getStream(location: string): Promise<NodeJS.ReadableStream> {
    const absolutePath = this.makePath(location)
    try {
      const response = await this.adapter.send(
        new GetObjectCommand({
          Key: absolutePath,
          Bucket: this._config.bucket
        })
      )

      return response.Body
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
      await this.adapter.send(
        new HeadObjectCommand({
          Key: absolutePath,
          Bucket: this._config.bucket
        })
      )

      return true
    } catch (error) {
      if (error.$metadata?.httpStatusCode === 404) {
        return false
      }

      throw new CannotGetMetaDataException(location, 'exists', error)
    }
  }

  /**
   * Returns the file stats
   */
  public async getStats(location: string): Promise<DriveFileStats> {
    const absolutePath = this.makePath(location)
    try {
      const stats = await this.adapter.send(
        new HeadObjectCommand({
          Key: absolutePath,
          Bucket: this._config.bucket
        })
      )

      return {
        modified: stats.LastModified!,
        size: stats.ContentLength!,
        isFile: true,
        etag: stats.ETag
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
      return await getSignedUrl(
        this.adapter,
        new GetObjectCommand({
          Key: absolutePath,
          Bucket: this._config.bucket,
          ...this._transformContentHeaders(options)
        }),
        {
          expiresIn: options?.expiresIn ?? 15 * 60
        }
      )
    } catch (error) {
      throw new CannotGetMetaDataException(location, 'signedUrl', error)
    }
  }

  /**
   * Returns URL to a given path
   */
  public async getUrl(location: string): Promise<string> {
    const absolutePath = this.makePath(location)

    /**
     * Use the CDN URL if defined
     */
    if (this._config.cdnUrl) {
      return `${this._config.cdnUrl}/${absolutePath}`
    }

    const href = format(await this.adapter.config.endpoint())
    if (href.startsWith('https://s3.amazonaws')) {
      return `https://${this._config.bucket}.s3.amazonaws.com/${absolutePath}`
    }

    return `${href}/${this._config.bucket}/${absolutePath}`
  }

  /**
   * Write string|buffer contents to a destination. The missing
   * intermediate directories will be created (if required).
   */
  public async put(location: string, contents: Buffer | string, options?: WriteOptions): Promise<void> {
    const absolutePath = this.makePath(location)
    try {
      await this.adapter.send(
        new PutObjectCommand({
          Key: absolutePath,
          Body: contents,
          Bucket: this._config.bucket,
          ...this._transformWriteOptions(options)
        })
      )
    } catch (error) {
      throw new CannotWriteFileException(location, error)
    }
  }

  /**
   * Write a stream to a destination. The missing intermediate
   * directories will be created (if required).
   */
  public async putStream(
    location: string,
    contents: NodeJS.ReadableStream,
    options?: WriteOptions & {
      multipart?: boolean
      queueSize?: number
      partSize?: number
      leavePartsOnError?: boolean
      tags?: Tag[]
      tap?: (stream: Upload) => void
    }
  ): Promise<void> {
    const absolutePath = this.makePath(location)
    try {
      options = Object.assign({}, options)

      /**
       * Upload as multipart stream
       */
      if (options.multipart) {
        const { tap, queueSize, partSize, leavePartsOnError, tags, ...others } = options
        const upload = new Upload({
          params: {
            Key: absolutePath,
            Body: contents,
            Bucket: this._config.bucket,
            ...this._transformWriteOptions(others)
          },
          queueSize,
          partSize,
          leavePartsOnError,
          tags,
          client: this.adapter
        })

        if (typeof tap === 'function') {
          tap(upload)
        }

        await upload.done()
        return
      }

      const upload = new Upload({
        params: {
          Key: absolutePath,
          Body: contents,
          Bucket: this._config.bucket,
          ...this._transformWriteOptions(options)
        },
        client: this.adapter
      })
      await upload.done()
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
      await this.adapter.send(
        new DeleteObjectCommand({
          Key: absolutePath,
          Bucket: this._config.bucket
        })
      )
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
      await this.adapter.send(
        new CopyObjectCommand({
          Key: destinationPath,
          CopySource: `/${this._config.bucket}/${sourcePath}`,
          Bucket: this._config.bucket,
          ...this._transformWriteOptions(options)
        })
      )
    } catch (error) {
      throw new CannotCopyFileException(source, destination, error.original || error)
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
      throw new CannotMoveFileException(source, destination, error.original || error)
    }
  }
}
