import { Arr, pipe, Str } from '@apoyo/std'
import {
  LocationEmptyFilenameException,
  LocationIllegalCharsException,
  LocationReservedFilenameException,
  LocationTooLongException
} from './exceptions'

// Restrict allowed characters too avoid illegal characters
const PATH_REGEXP = /^[a-zA-Z0-9\ _\-\.]+$/

// Forbid backtracking and other reserved filenames in usual file-systems
const PATH_RESERVED = ['.', '..']

// Most providers don't support location keys above 1kb
const PATH_MAX_LENGTH = 1024

export class Location {
  /**
   * Strip first and last "/" characters
   */
  public static stripSlashes(location: string): string {
    const len = location.length
    const start = location.charAt(0) === '/' ? 1 : 0
    const end = Math.max(start, location.charAt(len - 1) === '/' ? len - 1 : len)
    return location.substring(start, end)
  }

  public static parseFilename(location: string, fileName: string) {
    if (fileName.length === 0) {
      throw new LocationEmptyFilenameException(location, PATH_RESERVED)
    }
    const isReserved = PATH_RESERVED.includes(fileName)
    if (isReserved) {
      throw new LocationReservedFilenameException(location, PATH_RESERVED)
    }
    const isValid = PATH_REGEXP.test(fileName)
    if (!isValid) {
      throw new LocationIllegalCharsException(location)
    }
    return fileName
  }

  public static normalize(location: string): string {
    if (location.length > PATH_MAX_LENGTH) {
      throw new LocationTooLongException(location)
    }
    if (location.indexOf('\0') >= 0) {
      throw new LocationIllegalCharsException(location)
    }

    return pipe(
      Location.stripSlashes(location),
      Str.split('/'),
      Arr.map((name) => Location.parseFilename(location, name)),
      Arr.join('/')
    )
  }
}
