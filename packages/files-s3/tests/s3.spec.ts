import { Readable } from 'stream'

import {
  CannotCopyFileException,
  CannotGetMetaDataException,
  CannotMoveFileException,
  CannotReadFileException,
  Drive,
  FileException,
  LocationException
} from '@apoyo/files'
import { S3Drive, S3DriveConfig } from '../src'
import { Arr, Dict, pipe } from '@apoyo/std'

describe('S3 Drive', () => {
  let drive: Drive

  beforeEach(async () => {
    const config: S3DriveConfig = {
      bucket: 'test',
      region: 'us-east-1',
      endpoint: process.env.AWS_S3_SERVER || 'http://localhost:4569',
      forcePathStyle: true,
      key: '<aws_access_key>',
      secret: '<aws_secret_key>'
    }

    drive = new S3Drive(config)

    await drive.delete('foo.txt')
    await drive.delete('bar.txt')
    await drive.delete('baz/bar.txt')
    await drive.delete('bar/baz/foo.txt')
  })

  describe('put', () => {
    it('write file to the destination', async () => {
      await drive.put('foo.txt', 'hello world')

      const contents = await drive.get('foo.txt')

      expect(contents.toString()).toBe('hello world')
    })

    it('create intermediate directories when missing', async () => {
      await drive.put('bar/baz/foo.txt', 'hello world')

      const contents = await drive.get('bar/baz/foo.txt')

      expect(contents.toString()).toBe('hello world')
    })

    it('overwrite destination when file already exists', async () => {
      await drive.put('foo.txt', 'hi world')
      await drive.put('foo.txt', 'hello world')

      const contents = await drive.get('foo.txt')

      expect(contents.toString()).toBe('hello world')
    })
  })

  describe('putStream', () => {
    it('write stream to a file', async () => {
      const stream = new Readable({
        read() {
          this.push('hello world')
          this.push(null)
        }
      })

      expect(stream.readable).toBe(true)
      await drive.putStream('foo.txt', stream)
      expect(stream.readable).toBe(false)

      const contents = await drive.get('foo.txt')
      expect(contents.toString()).toBe('hello world')
    })

    it('create intermediate directories when writing a stream to a file', async () => {
      const stream = new Readable({
        read() {
          this.push('hello world')
          this.push(null)
        }
      })

      expect(stream.readable).toBe(true)
      await drive.putStream('bar/baz/foo.txt', stream)
      expect(stream.readable).toBe(false)

      const contents = await drive.get('bar/baz/foo.txt')
      expect(contents.toString()).toBe('hello world')
    })

    it('overwrite existing file when stream to a file', async () => {
      const stream = new Readable({
        read() {
          this.push('hello world')
          this.push(null)
        }
      })

      expect(stream.readable).toBe(true)
      await drive.put('foo.txt', 'hi world')
      await drive.putStream('foo.txt', stream)
      expect(stream.readable).toBe(false)

      const contents = await drive.get('foo.txt')
      expect(contents.toString()).toBe('hello world')
    })
  })

  describe('exists', () => {
    it('return true when a file exists', async () => {
      await drive.put('bar/baz/foo.txt', 'bar')
      expect(await drive.exists('bar/baz/foo.txt')).toBe(true)
    })

    it("return false when a file doesn't exists", async () => {
      expect(await drive.exists('foo.txt')).toBe(false)
    })

    it("return false when a file parent directory doesn't exists", async () => {
      expect(await drive.exists('bar/baz/foo.txt')).toBe(false)
    })
  })

  describe('delete', () => {
    it('remove file', async () => {
      await drive.put('bar/baz/foo.txt', 'bar')
      await drive.delete('bar/baz/foo.txt')

      expect(await drive.exists('bar/baz/foo.txt')).toBe(false)
    })

    it('do not error when trying to remove a non-existing file', async () => {
      await drive.delete('foo.txt')
      expect(await drive.exists('foo.txt')).toBe(false)
    })

    it("do not error when file parent directory doesn't exists", async () => {
      await drive.delete('bar/baz/foo.txt')
      expect(await drive.exists('bar/baz/foo.txt')).toBe(false)
    })
  })

  describe('copy', () => {
    it('copy file from within the disk root', async () => {
      await drive.put('foo.txt', 'hello world')
      await drive.copy('foo.txt', 'bar.txt')

      const contents = await drive.get('bar.txt')
      expect(contents.toString()).toBe('hello world')
    })

    it('create intermediate directories when copying a file', async () => {
      await drive.put('foo.txt', 'hello world')
      await drive.copy('foo.txt', 'baz/bar.txt')

      const contents = await drive.get('baz/bar.txt')
      expect(contents.toString()).toBe('hello world')
    })

    it("return error when source doesn't exists", async () => {
      try {
        await drive.copy('foo.txt', 'bar.txt')
      } catch (error) {
        expect(error).toBeInstanceOf(FileException)
        expect(error).toBeInstanceOf(CannotCopyFileException)
        expect(error.message).toBe('Cannot copy file from "foo.txt" to "bar.txt"')
      }
    })

    it('overwrite destination when already exists', async () => {
      await drive.put('foo.txt', 'hello world')
      await drive.put('bar.txt', 'hi world')
      await drive.copy('foo.txt', 'bar.txt')

      const contents = await drive.get('bar.txt')
      expect(contents.toString()).toBe('hello world')
    })
  })

  describe('move', () => {
    it('move file from within the disk root', async () => {
      await drive.put('foo.txt', 'hello world')
      await drive.move('foo.txt', 'bar.txt')

      const contents = await drive.get('bar.txt')
      expect(contents.toString()).toBe('hello world')
      expect(await drive.exists('foo.txt')).toBe(false)
    })

    it('create intermediate directories when moving a file', async () => {
      await drive.put('foo.txt', 'hello world')
      await drive.move('foo.txt', 'baz/bar.txt')

      const contents = await drive.get('baz/bar.txt')
      expect(contents.toString()).toBe('hello world')
      expect(await drive.exists('foo.txt')).toBe(false)
    })

    it("return error when source doesn't exists", async () => {
      try {
        await drive.move('foo.txt', 'baz/bar.txt')
      } catch (error) {
        expect(error).toBeInstanceOf(FileException)
        expect(error).toBeInstanceOf(CannotMoveFileException)
        expect(error.message).toBe('Cannot move file from "foo.txt" to "baz/bar.txt"')
      }
    })

    it('overwrite destination when already exists', async () => {
      await drive.put('foo.txt', 'hello world')
      await drive.put('baz/bar.txt', 'hi world')

      await drive.move('foo.txt', 'baz/bar.txt')

      const contents = await drive.get('baz/bar.txt')
      expect(contents.toString()).toBe('hello world')
    })
  })

  describe('get', () => {
    it('get file contents', async () => {
      await drive.put('foo.txt', 'hello world')

      const contents = await drive.get('foo.txt')
      expect(contents.toString()).toBe('hello world')
    })

    it('get file contents as a stream', async () => {
      await drive.put('foo.txt', 'hello world')

      const stream = await drive.getStream('foo.txt')

      await new Promise<void>((resolve) => {
        stream.on('data', (chunk) => {
          expect(chunk.toString()).toBe('hello world')
          resolve()
        })
      })
    })

    it("return error when file doesn't exists", async () => {
      try {
        await drive.get('foo.txt')
      } catch (error) {
        expect(error).toBeInstanceOf(FileException)
        expect(error).toBeInstanceOf(CannotReadFileException)
        expect(error.message).toBe('Cannot read file from location "foo.txt"')
      }
    })
  })

  describe('getStats', () => {
    it('get file stats', async () => {
      await drive.put('foo.txt', 'hello world')

      const stats = await drive.getStats('foo.txt')
      expect(stats.size).toBe(11)
      expect(stats.modified).toBeInstanceOf(Date)
    })

    it('return error when file is missing', async () => {
      try {
        await drive.getStats('foo.txt')
      } catch (error) {
        expect(error).toBeInstanceOf(FileException)
        expect(error).toBeInstanceOf(CannotGetMetaDataException)
        expect(error.message).toBe('Unable to retrieve the "stats" for file at location "foo.txt"')
      }
    })
  })

  describe('getUrl', () => {
    it('get url to a given file', async () => {
      const url = await drive.getUrl('foo.txt')
      expect(url).toBe('http://localhost:4569/test/foo.txt')
    })
  })

  describe('getSignedUrl', () => {
    it('get signed url to a given file', async () => {
      const url = await drive.getSignedUrl('foo.txt')
      const parsed = new URL(url)
      const queryParams = pipe(parsed.searchParams.entries(), Arr.from, Dict.fromPairs)
      expect(parsed.origin + parsed.pathname).toBe('http://localhost:4569/test/foo.txt')
      expect(queryParams).toEqual(
        expect.objectContaining({
          'X-Amz-Signature': expect.anything(),
          'x-id': expect.stringMatching('GetObject')
        })
      )
    })
  })

  describe('makePath', () => {
    it('should reject invalid locations', async () => {
      const invalidLocations = [
        `foo/../bar.txt`, // Reserved filename
        `foo\\bar.txt`, // Illegal backslash char
        `foo/(bar).txt` // Illegal chars
      ]

      for (const invalidLocation of invalidLocations) {
        await expect(drive.get(invalidLocation)).rejects.toThrow(LocationException)
        await expect(drive.put(invalidLocation, 'Invalid')).rejects.toThrow(LocationException)
        await expect(drive.delete(invalidLocation)).rejects.toThrow(LocationException)
        await expect(drive.copy(invalidLocation, invalidLocation)).rejects.toThrow(LocationException)
        await expect(drive.move(invalidLocation, invalidLocation)).rejects.toThrow(LocationException)
      }
    })
  })
})
