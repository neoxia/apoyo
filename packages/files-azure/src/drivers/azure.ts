import { Readable } from 'stream'

import {
  CannotCopyFileException,
  CannotDeleteFileException,
  CannotGetMetaDataException,
  CannotMoveFileException,
  CannotReadFileException,
  CannotWriteFileException,
  Drive,
  DriveFileStats,
  Location,
  LocationException,
  SignedUrlOptions
} from '@apoyo/files'
import { DefaultAzureCredential, TokenCredential } from '@azure/identity'
import {
  BlobDownloadOptions,
  BlobDownloadToBufferOptions,
  BlobExistsOptions,
  BlobSASPermissions,
  BlobSASSignatureValues,
  BlobServiceClient,
  BlockBlobClient,
  BlockBlobUploadOptions,
  BlockBlobUploadStreamOptions,
  generateBlobSASQueryParameters,
  newPipeline,
  StorageSharedKeyCredential
} from '@azure/storage-blob'

export type AzureDriveCommonConfig = {
  container: string
  prefix?: string
}

export type AzureDriveAuthByConnectionString = {
  connectionString: string
}

export type AzureDriveAuthByAccountKeyCredentials = {
  accountName: string
  accountKey: string
  localAddress?: string
}

/**
 * Use the {@link DefaultAzureCredential} to authenticate your AzureDrive.
 *
 * This credential provides a default {@link ChainedTokenCredential} configuration that should
 * work for most applications that use the Azure SDK.
 *
 * The following credential types will be tried, in order:
 *
 * - {@link EnvironmentCredential}
 * - {@link ManagedIdentityCredential}
 * - {@link VisualStudioCodeCredential}
 * - {@link AzureCliCredential}
 * - {@link AzurePowerShellCredential}
 */
export type AzureDriveAuthByAzureCredentials = {
  accountName: string
  localAddress?: string
}

export type AzureDriveAuth =
  | AzureDriveAuthByConnectionString
  | AzureDriveAuthByAccountKeyCredentials
  | AzureDriveAuthByAzureCredentials

export type AzureDriveConfig = AzureDriveCommonConfig & AzureDriveAuth

export class AzureDrive implements Drive {
  /**
   * Reference to the Azure storage instance
   */
  public adapter: BlobServiceClient

  /**
   * Name of the driver
   */
  public name: 'azure' = 'azure'

  constructor(private _config: AzureDriveConfig) {
    if ('connectionString' in _config) {
      this.adapter = BlobServiceClient.fromConnectionString(_config.connectionString)
    } else {
      let credential: StorageSharedKeyCredential | TokenCredential
      if ('accountKey' in _config) {
        credential = new StorageSharedKeyCredential(_config.accountName, _config.accountKey)
      } else {
        credential = new DefaultAzureCredential()
      }

      const url = _config.localAddress ?? `https://${_config.accountName}.blob.core.windows.net`

      const azurePipeline = newPipeline(credential)

      this.adapter = new BlobServiceClient(url, azurePipeline)
    }
  }

  /**
   * Make absolute path to a given location
   */
  public makePath(location: string) {
    return this._config.prefix
      ? Location.stripSlashes(this._config.prefix) + '/' + Location.normalize(location)
      : Location.normalize(location)
  }

  public getBlockBlobClient(path: string) {
    const container = this._config.container

    const containerClient = this.adapter.getContainerClient(container)
    return containerClient.getBlockBlobClient(path)
  }

  private async _generateBlobSASURL(
    blockBlobClient: BlockBlobClient,
    options: BlobSASSignatureValues
  ): Promise<string> {
    options.permissions =
      options.permissions === undefined || typeof options.permissions === 'string'
        ? BlobSASPermissions.parse(options.permissions || 'r')
        : options.permissions

    options.startsOn = options.startsOn || new Date()
    options.expiresOn = options.expiresOn || new Date(options.startsOn.valueOf() + 3600 * 1000)

    const factories = (blockBlobClient as any).pipeline.factories
    const credential = factories[factories.length - 1] as StorageSharedKeyCredential

    const blobSAS = generateBlobSASQueryParameters(
      {
        containerName: blockBlobClient.containerName, // Required
        blobName: blockBlobClient.name, // Required
        permissions: options.permissions, // Required
        startsOn: options.startsOn,
        expiresOn: options.expiresOn
      },
      credential
    )

    return `${blockBlobClient.url}?${blobSAS.toString()}`
  }

  /**
   * Returns the file contents as a buffer. The buffer return
   * value allows you to self choose the encoding when
   * converting the buffer to a string.
   */
  public async get(location: string, options: BlobDownloadToBufferOptions | any = {}): Promise<Buffer> {
    const absolutePath = this.makePath(location)
    try {
      const blockBlobClient = this.getBlockBlobClient(absolutePath)
      return await blockBlobClient.downloadToBuffer(0, 0, options)
    } catch (error) {
      throw new CannotReadFileException(location, error)
    }
  }

  /**
   * Returns the file contents as a stream
   */
  public async getStream(location: string, options: BlobDownloadOptions | any = {}): Promise<NodeJS.ReadableStream> {
    const absolutePath = this.makePath(location)
    try {
      const response = await this.getBlockBlobClient(absolutePath).download(0, 0, options)
      return response.readableStreamBody as NodeJS.ReadableStream
    } catch (error) {
      throw new CannotReadFileException(location, error)
    }
  }

  /**
   * A boolean to find if the location path exists or not
   */
  public exists(location: string, options: BlobExistsOptions | any = {}): Promise<boolean> {
    const absolutePath = this.makePath(location)
    try {
      return this.getBlockBlobClient(absolutePath).exists(options)
    } catch (error) {
      throw new CannotGetMetaDataException(location, 'exists', error)
    }
  }

  /**
   * Returns the signed url for a given path
   */
  public async getSignedUrl(location: string, options?: SignedUrlOptions): Promise<string> {
    const absolutePath = this.makePath(location)
    const opts: BlobSASSignatureValues = {
      ...options,
      expiresOn: options?.expiresIn ? new Date(Date.now() + options.expiresIn * 1000) : undefined,
      containerName: this._config.container
    }

    try {
      const blockBlobClient = this.getBlockBlobClient(absolutePath)
      return await this._generateBlobSASURL(blockBlobClient, opts)
    } catch (error) {
      throw new CannotGetMetaDataException(location, 'signedUrl', error)
    }
  }

  /**
   * Returns URL to a given path
   */
  public async getUrl(location: string): Promise<string> {
    const absolutePath = this.makePath(location)
    return this.getBlockBlobClient(absolutePath).url
  }

  /**
   * Write string|buffer contents to a destination. The missing
   * intermediate directories will be created (if required).
   *
   * @todo look into returning the response of upload
   */
  public async put(
    location: string,
    contents: Buffer | string,
    options?: BlockBlobUploadOptions | undefined
  ): Promise<void> {
    const absolutePath = this.makePath(location)
    try {
      const blockBlobClient = this.getBlockBlobClient(absolutePath)
      await blockBlobClient.upload(contents, contents.length, options)
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
    options?: BlockBlobUploadStreamOptions
  ): Promise<void> {
    const absolutePath = this.makePath(location)
    try {
      const blockBlobClient = this.getBlockBlobClient(absolutePath)
      await blockBlobClient.uploadStream(contents as Readable, undefined, undefined, options)
    } catch (error) {
      throw new CannotWriteFileException(location, error)
    }
  }

  /**
   * Copy a given location path from the source to the desination.
   * The missing intermediate directories will be created (if required)
   *
   * @todo look into returning the response of syncCopyFromURL
   */
  public async copy(source: string, destination: string): Promise<void> {
    const sourcePath = this.makePath(source)
    const destinationPath = this.makePath(destination)
    const opts: BlobSASSignatureValues = {
      containerName: this._config.container
    }

    try {
      const sourceBlockBlobClient = this.getBlockBlobClient(sourcePath)
      const destinationBlockBlobClient = this.getBlockBlobClient(destinationPath)

      const url = await this._generateBlobSASURL(sourceBlockBlobClient, opts)
      await destinationBlockBlobClient.syncCopyFromURL(url)
    } catch (error) {
      throw new CannotCopyFileException(source, destination, error.original || error)
    }
  }

  /**
   * Remove a given location path
   *
   * @todo find a way to extend delete with BlobDeleteOptions
   */
  public async delete(location: string): Promise<void> {
    const absolutePath = this.makePath(location)
    try {
      await this.getBlockBlobClient(absolutePath).deleteIfExists()
    } catch (error) {
      throw new CannotDeleteFileException(location, error)
    }
  }

  /**
   * Move a given location path from the source to the desination.
   * The missing intermediate directories will be created (if required)
   */
  public async move(source: string, destination: string): Promise<void> {
    try {
      await this.copy(source, destination)
      await this.delete(source)
    } catch (error) {
      if (error instanceof LocationException) {
        throw error
      }
      throw new CannotMoveFileException(source, destination, error.cause || error)
    }
  }

  /**
   * Returns the file stats
   */
  public async getStats(location: string): Promise<DriveFileStats> {
    const absolutePath = this.makePath(location)
    try {
      const metaData = await this.getBlockBlobClient(absolutePath).getProperties()

      return {
        modified: metaData.lastModified!,
        size: metaData.contentLength!,
        isFile: true,
        etag: metaData.etag
      }
    } catch (error) {
      throw new CannotGetMetaDataException(location, 'stats', error)
    }
  }
}
