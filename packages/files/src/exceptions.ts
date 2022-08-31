import { Exception } from '@apoyo/std'

/**
 * Base exception class for file errors
 */
export class FileException extends Exception {
  constructor(message: string, cause: Error | undefined, public readonly code: string) {
    super(message, cause)
  }
}

/**
 * Unable to write file to the destination
 */
export class CannotWriteFileException extends FileException {
  constructor(public readonly location: string, cause: Error) {
    super(`Cannot write file at location "${location}"`, cause, 'E_CANNOT_WRITE_FILE')
  }
}

/**
 * Unable to read file from a given location
 */
export class CannotReadFileException extends FileException {
  constructor(public readonly location: string, cause: Error) {
    super(`Cannot read file from location "${location}"`, cause, 'E_CANNOT_READ_FILE')
  }
}

/**
 * Unable to delete file from a given location
 */
export class CannotDeleteFileException extends FileException {
  constructor(public readonly location: string, cause: Error) {
    super(`Cannot delete file at location "${location}"`, cause, 'E_CANNOT_DELETE_FILE')
  }
}

/**
 * Unable to copy file from source to destination
 */
export class CannotCopyFileException extends FileException {
  constructor(public readonly source: string, public readonly destination: string, cause: Error) {
    super(`Cannot copy file from "${source}" to "${destination}"`, cause, 'E_CANNOT_COPY_FILE')
  }
}

/**
 * Unable to move file from source to destination
 */
export class CannotMoveFileException extends FileException {
  constructor(public readonly source: string, public readonly destination: string, cause: Error) {
    super(`Cannot move file from "${source}" to "${destination}"`, cause, 'E_CANNOT_MOVE_FILE')
  }
}

/**
 * Unable to get file metadata
 */
export class CannotGetMetaDataException extends FileException {
  constructor(public readonly location: string, public readonly operation: string, cause: Error) {
    super(`Unable to retrieve the "${operation}" for file at location "${location}"`, cause, 'E_CANNOT_GET_METADATA')
  }
}

/**
 * Unable to generate url for a file. The assets serving is disabled
 */
export class CannotGenerateUrlException extends FileException {
  constructor(public readonly location: string) {
    super(`Cannot generate URL for location "${location}".`, undefined, 'E_CANNOT_GENERATE_URL')
  }
}
