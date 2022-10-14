/**
 * Content options for files
 */
export type ContentHeaders = {
  contentType?: string
  contentLanguage?: string
  contentEncoding?: string
  contentDisposition?: string
  cacheControl?: string
}

/**
 * Options for writing, moving and copying files
 */
export type WriteOptions = ContentHeaders & Record<string, any>

/**
 * Options for generating signed urls
 */
export type SignedUrlOptions = ContentHeaders & {
  /**
   * Signed URL expiration time in seconds
   */
  expiresIn?: number
}

/**
 * Options for listing files
 */
export type ListOptions = {
  /**
   * Directory that should be listed
   */
  prefix?: string

  /**
   * Directory delimiter.
   * Defaults to "/".
   */
  delimiter?: string

  /**
   * Number of files listed per page
   */
  limit?: number

  /**
   * Cursor used to fetch the next page
   */
  next?: string
}

/**
 * Stats returned by the drive drivers
 */
export type DriveFileStats = {
  size: number
  modified: Date
  isFile: boolean
  etag?: string
}

export type DriveFile = {
  name: string
  isFile: boolean
}

export type DriveFilePage = {
  items: DriveFile[]
  next?: string
}

/**
 * Shape of the generic driver
 */
export interface DriverContract {
  /**
   * A boolean to find if the location path exists or not
   */
  exists(location: string): Promise<boolean>

  /**
   * Returns the file contents as a buffer.
   */
  get(location: string): Promise<Buffer>

  /**
   * Returns the file contents as a stream
   */
  getStream(location: string): Promise<NodeJS.ReadableStream>

  /**
   * Returns the location path stats
   */
  getStats(location: string): Promise<DriveFileStats>

  /**
   * Returns a signed URL for a given location path
   */
  getSignedUrl(location: string, options?: SignedUrlOptions): Promise<string>

  /**
   * Returns a URL for a given location path
   */
  getUrl(location: string): Promise<string>

  /**
   * Write string|buffer contents to a destination. The missing
   * intermediate directories will be created (if required).
   */
  put(location: string, contents: Buffer | string, options?: WriteOptions): Promise<void>

  /**
   * Write a stream to a destination. The missing intermediate
   * directories will be created (if required).
   */
  putStream(location: string, contents: NodeJS.ReadableStream, options?: WriteOptions): Promise<void>

  /**
   * Remove a given location path
   */
  delete(location: string): Promise<void>

  /**
   * Copy a given location path from the source to the desination.
   * The missing intermediate directories will be created (if required)
   */
  copy(source: string, destination: string, options?: WriteOptions): Promise<void>

  /**
   * Move a given location path from the source to the desination.
   * The missing intermediate directories will be created (if required)
   */
  move(source: string, destination: string, options?: WriteOptions): Promise<void>

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
  list(options?: ListOptions): Promise<DriveFilePage>
}
