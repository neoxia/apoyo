import {
  CannotCopyFileException,
  CannotMoveFileException,
  CannotReadFileException,
  CannotWriteFileException,
  CannotDeleteFileException,
  CannotGetMetaDataException,
  DriverContract
} from '@apoyo/files'

import { DriveFileStats } from '@apoyo/files'

import { DefaultAzureCredential } from '@azure/identity'
import {
  newPipeline,
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobDownloadOptions,
  BlobDownloadToBufferOptions,
  BlobExistsOptions,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  BlobSASSignatureValues,
  BlockBlobUploadOptions,
  BlockBlobUploadStreamOptions,
  BlockBlobClient,
  CommonOptions
} from '@azure/storage-blob'
import { ReadStream } from 'fs'

export type AzureDriverConfig = CommonOptions & {
  connectionString?: string
  azureTenantId?: string
  azureClientId?: string
  azureClientSecret?: string
  name?: string
  key?: string
  localAddress?: string
  container?: string
}

export class AzureDriver implements DriverContract {
  /**
   * Reference to the Azure storage instance
   */
  public adapter: BlobServiceClient

  /**
   * Name of the driver
   */
  public name: 'azure' = 'azure'

  constructor(private _config: AzureDriverConfig) {
    if (_config.connectionString) {
      // eslint-disable-next-line
      this.adapter = BlobServiceClient.fromConnectionString(
        _config.connectionString
      )
    } else {
      let credential: any
      if (_config.azureTenantId && _config.azureClientId && _config.azureClientSecret) {
        credential = new DefaultAzureCredential()
      } else if (_config.name && _config.key) {
        credential = new StorageSharedKeyCredential(_config.name, _config.key)
      }

      let url = `https://${this._config.name}.blob.core.windows.net`

      if (typeof this._config.localAddress !== 'undefined') {
        url = this._config.localAddress
      }

      const azurePipeline = newPipeline(credential)

      this.adapter = new BlobServiceClient(url, azurePipeline)
    }
  }

  public getBlockBlobClient(location: string) {
    const container = this._config.container as string

    const containerClient = this.adapter.getContainerClient(container)
    return containerClient.getBlockBlobClient(location)
  }

  public async generateBlobSASURL(blockBlobClient: BlockBlobClient, options: BlobSASSignatureValues): Promise<string> {
    options.permissions =
      options.permissions === undefined || typeof options.permissions === 'string'
        ? BlobSASPermissions.parse(options.permissions || 'r')
        : options.permissions

    options.startsOn = options.startsOn || new Date()
    options.expiresOn = options.expiresOn || new Date(options.startsOn.valueOf() + 3600 * 1000)

    const factories = (blockBlobClient as any).pipeline.factories
    const credential = factories[factories.length - 1] as StorageSharedKeyCredential

    const blobSAS = await generateBlobSASQueryParameters(
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
    try {
      const blockBlobClient = this.getBlockBlobClient(location)
      return await blockBlobClient.downloadToBuffer(0, 0, options)
    } catch (error) {
      throw new CannotReadFileException(location, error)
    }
  }

  /**
   * Returns the file contents as a stream
   */
  public async getStream(location: string, options: BlobDownloadOptions | any = {}): Promise<NodeJS.ReadableStream> {
    const response = await this.getBlockBlobClient(location).download(0, 0, options)
    return response.readableStreamBody as NodeJS.ReadableStream
  }

  /**
   * A boolean to find if the location path exists or not
   */
  public exists(location: string, options: BlobExistsOptions | any = {}): Promise<boolean> {
    try {
      return this.getBlockBlobClient(location).exists(options)
    } catch (error) {
      throw new CannotGetMetaDataException(location, 'exists', error)
    }
  }

  /**
   * Returns the signed url for a given path
   */
  public async getSignedUrl(location: string, options?: BlobSASSignatureValues): Promise<string> {
    options = options || {
      containerName: this._config.container as string
    }
    options.containerName = options.containerName || (this._config.container as string)

    try {
      const blockBlobClient = this.getBlockBlobClient(location)
      const SASUrl = await this.generateBlobSASURL(blockBlobClient, options)
      return SASUrl
    } catch (error) {
      throw new CannotGetMetaDataException(location, 'signedUrl', error)
    }
  }

  /**
   * Returns URL to a given path
   */
  public async getUrl(location: string): Promise<string> {
    return unescape(this.getBlockBlobClient(location).url)
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
    const blockBlobClient = this.getBlockBlobClient(location)
    try {
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
    contents: ReadStream,
    options?: BlockBlobUploadStreamOptions
  ): Promise<void> {
    const blockBlobClient = this.getBlockBlobClient(location)

    try {
      await blockBlobClient.uploadStream(contents, undefined, undefined, options)
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
  public async copy(source: string, destination: string, options?: BlobSASSignatureValues): Promise<void> {
    options = options || {
      containerName: this._config.container as string
    }
    options.containerName = options.containerName || (this._config.container as string)

    const sourceBlockBlobClient = this.getBlockBlobClient(source)
    const destinationBlockBlobClient = this.getBlockBlobClient(destination)

    const url = await this.generateBlobSASURL(sourceBlockBlobClient, options)

    try {
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
    try {
      await this.getBlockBlobClient(location).delete()
    } catch (error) {
      throw new CannotDeleteFileException(location, error)
    }
  }

  /**
   * Move a given location path from the source to the desination.
   * The missing intermediate directories will be created (if required)
   */
  public async move(source: string, destination: string, options?: BlobSASSignatureValues): Promise<void> {
    try {
      await this.copy(source, destination, options)
      await this.delete(source)
    } catch (error) {
      throw new CannotMoveFileException(source, destination, error.original || error)
    }
  }

  /**
   * Returns the file stats
   */
  public async getStats(location: string): Promise<DriveFileStats> {
    try {
      const metaData = await this.getBlockBlobClient(location).getProperties()

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
