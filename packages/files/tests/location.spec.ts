import {
  Location,
  LocationEmptyFilenameException,
  LocationIllegalCharsException,
  LocationReservedFilenameException,
  LocationTooLongException
} from '../src'

describe('Location', () => {
  describe('normalize', () => {
    it('should throw when location is too long', () => {
      expect(() => Location.normalize('a'.repeat(1024))).not.toThrow()
      expect(() => Location.normalize('a'.repeat(1025))).toThrow(LocationTooLongException)
    })

    it('should not contain illegal characters', () => {
      expect(() => Location.normalize('foo\0.txt')).toThrow(LocationIllegalCharsException)
      expect(() => Location.normalize('><,$*%()')).toThrow(LocationIllegalCharsException)
    })

    it('should not contain empty folder names', () => {
      expect(() => Location.normalize('foo//bar.txt')).toThrow(LocationEmptyFilenameException)
      expect(() => Location.normalize('')).toThrow(LocationEmptyFilenameException)
    })

    it('should not contain reserved file names', () => {
      expect(() => Location.normalize('foo/../bar.txt')).toThrow(LocationReservedFilenameException)
      expect(() => Location.normalize('foo/./bar.txt')).toThrow(LocationReservedFilenameException)
    })

    it('should ignore leading slash', () => {
      expect(Location.normalize('/foo/bar.txt')).toBe('foo/bar.txt')
      expect(Location.normalize('foo/bar/')).toBe('foo/bar')
    })
  })
})
